import { v4 as uuidv4 } from 'uuid'
import wretch from 'wretch'
import { AppDispatch, RootState } from '../store'
import Config from '../app/data/Config'
import { LibrarySource, newLibrarySource } from 'flipflip-common'
import { PlayerState, setPlayersLoaded } from '../player/slice'
import {
  getFileName,
  loadBDSMlr,
  loadDanbooru,
  loadDeviantArt,
  loadE621,
  loadEHentai,
  loadGelbooru1,
  loadGelbooru2,
  loadHydrus,
  loadImageFap,
  loadImgur,
  loadInstagram,
  loadLuscious,
  loadPiwigo,
  loadReddit,
  loadRedGifs,
  loadRemoteImageURLList,
  loadSexCom,
  loadTumblr,
  loadTwitter,
  processAllURLs
} from '../../components/player/Scrapers'
import {
  CancelablePromise,
  getCachePath,
  randomizeList
} from '../../data/utils'
import {
  filterPathsToJustPlayable,
  getSourceType,
  isVideo,
  ST,
  SOF
} from 'flipflip-common'
import {
  ScrapedSources,
  setSourceScraperSources,
  setSourceScraperSourcesWorker,
  setSourceScraperShiftPromiseQueue,
  setSourceScraperProgress,
  setSourceScraperSceneSources,
  ScraperProgress
} from './slice'
import { setPlayerCaptcha } from '../player/slice'
import { systemMessage } from '../app/slice'
import { setCount } from '../app/thunks'
import { toLibrarySourceStorage } from '../app/convert'
import flipflip from '../../FlipFlipService'

function convertMapToRecord<V>(map: Map<string, V>): Record<string, V> {
  const record: Record<string, V> = {}
  map.forEach((value: V, key: string) => (record[key] = value))
  return record
}

function convertRecordToMap<V>(record: Record<string, V>): Map<string, V> {
  const map = new Map<string, V>()
  Object.keys(record).forEach((key) => map.set(key, record[key]))
  return map
}

function getPlayerSceneID(
  player: PlayerState,
  isNextSceneID: boolean,
  overlayIndex?: number
) {
  if (isNextSceneID) {
    return player.nextSceneID
  } else if (overlayIndex != null) {
    return player.overlays[overlayIndex].sceneID
  } else {
    return player.sceneID
  }
}

function isPlayerStopped(
  dispatch: AppDispatch,
  state: RootState,
  playerUUID: string,
  sceneID: number,
  isNextSceneID: boolean,
  overlayIndex?: number
) {
  const player = state.players[playerUUID]
  const playerStopped =
    player == null ||
    sceneID !== getPlayerSceneID(player, isNextSceneID, overlayIndex)
  if (playerStopped) {
    // this player stopped, but there might be other players who do need sources
    let newPlayerUUID = Object.keys(state.players).find(
      (uuid) => state.players[uuid].sceneID === sceneID
    )
    if (newPlayerUUID == null) {
      newPlayerUUID = Object.keys(state.players).find(
        (uuid) =>
          state.players[uuid].overlays.find((s) => s.sceneID === sceneID) !=
          null
      )
    }
    if (newPlayerUUID == null) {
      newPlayerUUID = Object.keys(state.players).find((uuid) => {
        const p = state.players[uuid]
        return (
          // only return true for next scene if current scene is loaded
          p.nextSceneID === sceneID &&
          state.sourceScraper[p.sceneID as number].completed
        )
      })
    }

    dispatch(setSourceScraperSourcesWorker({ id: sceneID, value: '' }))
    if (newPlayerUUID != null) {
      dispatch(scrapeSources(newPlayerUUID))
    }
  }

  return playerStopped
}

function promiseLoop(
  playerUUID: string,
  sceneID: number,
  isNextSceneID: boolean,
  overlayIndex?: number
) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const player = state.players[playerUUID]
    const captcha = player?.captcha
    const promiseQueue = state.sourceScraper[sceneID].promiseQueue
    if (captcha != null && promiseQueue.length === 0) {
      setTimeout(() => {
        dispatch(promiseLoop(playerUUID, sceneID, isNextSceneID, overlayIndex))
      }, 2000)
    }

    // Process until queue is empty or player has been stopped
    if (promiseQueue.length === 0) {
      dispatch(setSourceScraperSourcesWorker({ id: sceneID, value: '' }))
      return
    }
    if (
      isPlayerStopped(
        dispatch,
        state,
        playerUUID,
        sceneID,
        isNextSceneID,
        overlayIndex
      )
    )
      return

    const workerUUID = state.sourceScraper[sceneID].workerUUID
    const receiveMessage = (message: any) => {
      const state = getState()
      const object = message.data
      if (
        object?.type === 'RPC' ||
        (object?.helpers != null && object.helpers.uuid !== workerUUID)
      ) {
        return
      }

      if (object?.captcha != null && captcha == null) {
        dispatch(
          setPlayerCaptcha({
            uuid: playerUUID,
            value: {
              captcha: {
                captcha: object.captcha,
                source: object?.source,
                helpers: object?.helpers
              },
              overlayIndex
            }
          })
        )
      }

      if (object?.error != null) {
        console.error(
          'Error retrieving ' +
            object?.source?.url +
            (object?.helpers?.next > 0 ? ' Page ' + object.helpers.next : '')
        )
        console.error(object.error)
      }

      if (object?.warning != null) {
        console.warn(object.warning)
      }

      if (object?.systemMessage != null) {
        dispatch(systemMessage(object.systemMessage))
      }

      // If we are not at the end of a source
      console.log(object)
      if (object?.source) {
        if (object?.data) {
          const sources = state.sourceScraper[sceneID]
          const value: ScrapedSources = {
            ...sources,
            allURLs: convertMapToRecord(object.allURLs),
            allPosts: convertMapToRecord(object.allPosts)
          }

          // Add the next promise to the queue
          const { source, helpers } = object
          if (helpers.next != null) {
            value.promiseQueue = [...value.promiseQueue, { source, helpers }]
          }

          console.log('setSourceScraperSources')
          dispatch(setSourceScraperSources({ id: sceneID, value }))
          dispatch(setCount(source.url, helpers.count, helpers.next == null))
        }

        setTimeout(
          () => {
            dispatch(
              promiseLoop(playerUUID, sceneID, isNextSceneID, overlayIndex)
            )
          },
          object?.timeout != null ? object.timeout : 1000
        )
      }
    }

    const sources = state.sourceScraper[sceneID]
    const promiseData = sources.promiseQueue[0]
    if (promiseData == null) return

    dispatch(setSourceScraperShiftPromiseQueue(sceneID))
    const config = state.app.config
    const pathSep = state.constants.pathSep
    const { imageTypeFilter, weightFunction } = state.scene.entries[sceneID]
    const workerListener = receiveMessage
    if (config.generalSettings.prioritizePerformance) {
      flipflip().events.onWorkerResponse(workerUUID, workerListener)
      scrapeFiles(
        workerListener,
        convertRecordToMap(sources.allURLs as Record<string, string[]>),
        convertRecordToMap(sources.allPosts),
        config,
        promiseData.source,
        imageTypeFilter,
        weightFunction,
        promiseData.helpers,
        pathSep
      )
    } else {
      scrapeFiles(
        workerListener,
        convertRecordToMap(sources.allURLs as Record<string, string[]>),
        convertRecordToMap(sources.allPosts),
        config,
        promiseData.source,
        imageTypeFilter,
        weightFunction,
        promiseData.helpers,
        pathSep,
        true
      ).then((message) => workerListener(message))
    }
  }
}

function sourceLoop(
  playerUUID: string,
  sceneID: number,
  isNextSceneID: boolean,
  overlayIndex?: number
) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const scraperState = state.sourceScraper[sceneID]
    const { total, current } = scraperState.progress as ScraperProgress
    if (current === total) {
      dispatch(setSourceScraperSourcesWorker({ id: sceneID, value: '' }))
      if (!isNextSceneID) {
        dispatch(setPlayersLoaded(sceneID))
      }
      dispatch(scrapeSources(playerUUID))
      return
    }
    console.log('isPlayerStopped')
    if (
      isPlayerStopped(
        dispatch,
        state,
        playerUUID,
        sceneID,
        isNextSceneID,
        overlayIndex
      )
    )
      return

    console.log('SOURCE LOOP: ' + current)
    const sceneSources = scraperState.sceneSources
    const d = sceneSources[current]
    let allURLs: Map<string, string[]>
    if (scraperState.allURLs) {
      allURLs = convertRecordToMap(scraperState.allURLs)
    } else {
      allURLs = new Map<string, string[]>()
      sceneSources.forEach((s) => allURLs.set(s.url, []))
    }

    const scene = state.scene.entries[sceneID]
    if (!isNextSceneID) {
      let message = d ? [d.url] : ['']
      if (overlayIndex != null) {
        const name = scene.name
        message = ["Loading '" + name + "'...", ...message]
      }

      dispatch(
        setSourceScraperProgress({
          id: sceneID,
          value: { total, current: current + 1, message }
        })
      )
    }
    if (!scene.playVideoClips && d.clips) {
      d.clips = []
    }

    const workerUUID = state.sourceScraper[sceneID].workerUUID
    const receiveMessage = (message: any) => {
      const state = getState()
      const object = message.data
      if (
        object?.type === 'RPC' ||
        (object?.helpers != null && object.helpers.uuid !== workerUUID)
      ) {
        return
      }

      if (!isNextSceneID) {
        const captcha = state.players[playerUUID]?.captcha
        if (object?.captcha != null && captcha == null) {
          dispatch(
            setPlayerCaptcha({
              uuid: playerUUID,
              value: {
                captcha: {
                  captcha: object.captcha,
                  source: object?.source,
                  helpers: object?.helpers
                },
                overlayIndex
              }
            })
          )
        }
      }

      if (object?.error != null) {
        console.error(
          'Error retrieving ' +
            object?.source?.url +
            (object?.helpers?.next > 0 ? ' Page ' + object.helpers.next : '')
        )
        console.error(object.error)
      }

      if (object?.warning != null) {
        console.warn(object.warning)
      }

      if (object?.systemMessage != null) {
        dispatch(systemMessage(object.systemMessage))
      }

      console.log(object)
      if (object?.source) {
        // Just add the new urls to the end of the list
        if (object?.data && object?.allURLs) {
          const sources = state.sourceScraper[sceneID]
          const value: ScrapedSources = {
            ...sources,
            allURLs: convertMapToRecord(object.allURLs),
            allPosts: convertMapToRecord(object.allPosts)
          }

          // Add the next promise to the queue
          const { source, helpers } = object
          if (helpers.next != null) {
            value.promiseQueue = [...value.promiseQueue, { source, helpers }]
          }

          console.log('setSourceScraperSources')
          dispatch(setSourceScraperSources({ id: sceneID, value }))
          dispatch(setCount(source.url, helpers.count, helpers.next == null))
        }

        const timeout = object?.timeout != null ? object.timeout : 1000
        setTimeout(() => {
          dispatch(sourceLoop(playerUUID, sceneID, isNextSceneID, overlayIndex))
        }, timeout)
      }
    }

    const config = state.app.config
    const pathSep = state.constants.pathSep
    const { imageTypeFilter, weightFunction } = state.scene.entries[sceneID]
    const workerListener = receiveMessage
    if (config.generalSettings.prioritizePerformance) {
      flipflip().events.onWorkerResponse(workerUUID, workerListener)
      scrapeFiles(
        workerListener,
        allURLs,
        convertRecordToMap(scraperState.allPosts),
        config,
        d,
        imageTypeFilter,
        weightFunction,
        { next: -1, count: 0, retries: 0, uuid: workerUUID },
        pathSep
      )
    } else {
      scrapeFiles(
        workerListener,
        allURLs,
        convertRecordToMap(scraperState.allPosts),
        config,
        d,
        imageTypeFilter,
        weightFunction,
        { next: -1, count: 0, retries: 0, uuid: workerUUID },
        pathSep,
        true
      ).then((message) => workerListener(message))
    }
  }
}

function startScrape(
  playerUUID: string,
  sceneID: number,
  isNextSceneID: boolean,
  overlayIndex?: number
) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    console.log('startScrape')
    const state = getState()
    const pathSep = state.constants.pathSep
    const scene = state.scene.entries[sceneID]
    const sources = scene.sources.map((id) => state.librarySource.entries[id])
    const sceneSources: LibrarySource[] = []
    for (const source of sources) {
      if (source.dirOfSources && getSourceType(source.url) === ST.local) {
        try {
          const directories = await flipflip().api.getDirectories(source.url)
          for (const d of directories) {
            sceneSources.push(
              newLibrarySource({ url: source.url + pathSep + d })
            )
          }
        } catch (e) {
          sceneSources.push(newLibrarySource({ url: source.url }))
          console.error(e)
        }
      } else {
        sceneSources.push(toLibrarySourceStorage(source.id, state))
      }
    }
    console.log('<< sceneSources')

    if (scene.sourceOrderFunction === SOF.random) {
      randomizeList(sceneSources)
    }

    console.log('setSourceScraperSceneSources')
    dispatch(setSourceScraperSceneSources({ id: sceneID, value: sceneSources }))
    console.log('sourceLoop')
    dispatch(sourceLoop(playerUUID, sceneID, isNextSceneID, overlayIndex))
  }
}

function shouldStartScrape(
  sceneID: number,
  sourceScraperState: Record<number, ScrapedSources>
) {
  return sourceScraperState[sceneID] == null
}

function shouldContinueScrape(
  sceneID: number,
  sourceScraperState: Record<number, ScrapedSources>
) {
  const scrapedSources = sourceScraperState[sceneID]
  return (
    scrapedSources.progress &&
    scrapedSources.progress.current < scrapedSources.progress.total
  )
}

function shouldScrapePromises(
  sceneID: number,
  sourceScraperState: Record<number, ScrapedSources>
) {
  const scrapedSources = sourceScraperState[sceneID]
  return (
    scrapedSources.promiseQueue.length > 0 && scrapedSources.workerUUID == null
  )
}

function scheduleScrape(
  playerUUID: string,
  sceneID: number,
  isNextSceneID: boolean,
  workerUUID: string,
  overlayIndex?: number
) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    if (!sceneID) {
      return false
    }

    let scheduled = false
    const state = getState()
    if (shouldStartScrape(sceneID, state.sourceScraper)) {
      console.log('shouldStartScrape')
      dispatch(
        setSourceScraperSources({
          id: sceneID,
          value: {
            sceneSources: [],
            promiseQueue: [],
            allPosts: {},
            workerUUID,
            completed: false
          }
        })
      )
      setTimeout(() => {
        dispatch(startScrape(playerUUID, sceneID, isNextSceneID, overlayIndex))
      }, 200)
      scheduled = true
    } else if (shouldContinueScrape(sceneID, state.sourceScraper)) {
      console.log('shouldContinueScrape')
      setTimeout(() => {
        dispatch(sourceLoop(playerUUID, sceneID, isNextSceneID, overlayIndex))
      }, 200)
      scheduled = true
    } else if (shouldScrapePromises(sceneID, state.sourceScraper)) {
      console.log('shouldScrapePromises')
      dispatch(
        setSourceScraperSourcesWorker({ id: sceneID, value: workerUUID })
      )
      setTimeout(() => {
        dispatch(promiseLoop(playerUUID, sceneID, isNextSceneID, overlayIndex))
        dispatch(
          scheduleScrape(
            playerUUID,
            sceneID,
            isNextSceneID,
            workerUUID,
            overlayIndex
          )
        )
      }, 200)
      scheduled = true
    }

    console.log('scheduleScrape: ' + scheduled)
    return scheduled
  }
}

export function scrapeSources(playerUUID: string) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const { sceneID, nextSceneID, overlays } = state.players[playerUUID]
    const workerUUID = uuidv4()
    const scheduled = dispatch(
      scheduleScrape(playerUUID, sceneID as number, false, workerUUID)
    )
    if (!scheduled) {
      console.log('SCHEDULE NEXT SCENE')
      dispatch(scheduleScrape(playerUUID, nextSceneID, true, workerUUID))
    }
    overlays.forEach(({ sceneID }, index) => {
      console.log('SCHEDULE OVERLAY ' + index)
      dispatch(scheduleScrape(playerUUID, sceneID, false, workerUUID, index))
    })
  }
}

async function cachePath(
  config: Config,
  source: LibrarySource,
  pathSep: string
) {
  const cachePath =
    (await getCachePath(config.caching.directory, source.url)) +
    getFileName(source.url, pathSep)
  return config.caching.enabled && (await flipflip().api.pathExists(cachePath))
    ? cachePath
    : null
}

// Determine what kind of source we have based on the URL and return associated Promise
async function scrapeFiles(
  pm: Function,
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  returnPromise = false
) {
  const sourceType = getSourceType(source.url)
  if (sourceType === ST.local) {
    // Local files
    if (returnPromise) {
      return await new CancelablePromise((resolve) => {
        loadLocalDirectory(
          resolve,
          allURLs,
          allPosts,
          config,
          source,
          filter,
          weight,
          helpers,
          '',
          pathSep
        )
      })
    } else {
      loadLocalDirectory(
        pm,
        allURLs,
        allPosts,
        config,
        source,
        filter,
        weight,
        helpers,
        '',
        pathSep
      )
    }
  } else if (sourceType === ST.list) {
    // Image List
    helpers.next = null
    if (returnPromise) {
      return await new CancelablePromise((resolve) => {
        loadRemoteImageURLListPromise(
          allURLs,
          allPosts,
          config,
          source,
          filter,
          weight,
          helpers,
          pathSep,
          resolve
        )
      })
    } else {
      flipflip().api.loadInWorker('loadRemoteImageURLList', [
        allURLs,
        allPosts,
        config,
        source,
        filter,
        weight,
        helpers,
        pathSep
      ])
    }
  } else if (sourceType === ST.video) {
    if (returnPromise) {
      const path = (await cachePath(config, source, pathSep)) ?? ''
      return await new CancelablePromise((resolve) => {
        loadVideo(
          resolve,
          allURLs,
          allPosts,
          config,
          source,
          filter,
          weight,
          helpers,
          path,
          pathSep
        )
      })
    } else {
      const path = (await cachePath(config, source, pathSep)) ?? ''
      loadVideo(
        pm,
        allURLs,
        allPosts,
        config,
        source,
        filter,
        weight,
        helpers,
        path,
        pathSep
      )
    }
  } else if (sourceType === ST.playlist) {
    if (returnPromise) {
      const path = (await cachePath(config, source, pathSep)) ?? ''
      return await new CancelablePromise((resolve) => {
        loadPlaylist(
          resolve,
          allURLs,
          allPosts,
          config,
          source,
          filter,
          weight,
          helpers,
          path,
          pathSep
        )
      })
    } else {
      const path = (await cachePath(config, source, pathSep)) ?? ''
      loadPlaylist(
        pm,
        allURLs,
        allPosts,
        config,
        source,
        filter,
        weight,
        helpers,
        path,
        pathSep
      )
    }
  } else if (sourceType === ST.nimja) {
    if (returnPromise) {
      return await new CancelablePromise((resolve) => {
        loadNimja(
          resolve,
          allURLs,
          allPosts,
          config,
          source,
          filter,
          weight,
          helpers,
          '',
          pathSep
        )
      })
    } else {
      loadNimja(
        pm,
        allURLs,
        allPosts,
        config,
        source,
        filter,
        weight,
        helpers,
        '',
        pathSep
      )
    }
  } else {
    // Paging sources
    let workerFunction: any
    if (sourceType === ST.tumblr) {
      workerFunction = returnPromise
        ? loadTumblrPromise
        : loadInWorker('loadTumblr')
    } else if (sourceType === ST.reddit) {
      workerFunction = returnPromise
        ? loadRedditPromise
        : loadInWorker('loadReddit')
    } else if (sourceType === ST.redgifs) {
      workerFunction = returnPromise
        ? loadRedGifsPromise
        : loadInWorker('loadRedGifs')
    } else if (sourceType === ST.imagefap) {
      workerFunction = returnPromise
        ? loadImageFapPromise
        : loadInWorker('loadImageFap')
    } else if (sourceType === ST.sexcom) {
      workerFunction = returnPromise
        ? loadSexComPromise
        : loadInWorker('loadSexCom')
    } else if (sourceType === ST.imgur) {
      workerFunction = returnPromise
        ? loadImgurPromise
        : loadInWorker('loadImgur')
    } else if (sourceType === ST.twitter) {
      workerFunction = returnPromise
        ? loadTwitterPromise
        : loadInWorker('loadTwitter')
    } else if (sourceType === ST.deviantart) {
      workerFunction = returnPromise
        ? loadDeviantArtPromise
        : loadInWorker('loadDeviantArt')
    } else if (sourceType === ST.instagram) {
      workerFunction = returnPromise
        ? loadInstagramPromise
        : loadInWorker('loadInstagram')
    } else if (sourceType === ST.danbooru) {
      workerFunction = returnPromise
        ? loadDanbooruPromise
        : loadInWorker('loadDanbooru')
    } else if (sourceType === ST.e621) {
      workerFunction = returnPromise
        ? loadE621Promise
        : loadInWorker('loadE621')
    } else if (sourceType === ST.luscious) {
      workerFunction = returnPromise
        ? loadLusciousPromise
        : loadInWorker('loadLuscious')
    } else if (sourceType === ST.gelbooru1) {
      workerFunction = returnPromise
        ? loadGelbooru1Promise
        : loadInWorker('loadGelbooru1')
    } else if (sourceType === ST.gelbooru2) {
      workerFunction = returnPromise
        ? loadGelbooru2Promise
        : loadInWorker('loadGelbooru2')
    } else if (sourceType === ST.ehentai) {
      workerFunction = returnPromise
        ? loadEHentaiPromise
        : loadInWorker('loadEHentai')
    } else if (sourceType === ST.bdsmlr) {
      workerFunction = returnPromise
        ? loadBDSMlrPromise
        : loadInWorker('loadBDSMlr')
    } else if (sourceType === ST.hydrus) {
      workerFunction = returnPromise
        ? loadHydrusPromise
        : loadInWorker('loadHydrus')
    } else if (sourceType === ST.piwigo) {
      workerFunction = returnPromise
        ? loadPiwigoPromise
        : loadInWorker('loadPiwigo')
    }
    if (helpers.next === -1) {
      helpers.next = 0
      const cachePath = (await getCachePath(
        config.caching.directory,
        source.url
      )) as string

      if (
        config.caching.enabled &&
        (await flipflip().api.hasFiles(cachePath))
      ) {
        // If the cache directory exists, use it
        if (returnPromise) {
          return await new CancelablePromise((resolve) => {
            loadLocalDirectory(
              resolve,
              allURLs,
              allPosts,
              config,
              source,
              filter,
              weight,
              helpers,
              cachePath,
              pathSep
            )
          })
        } else {
          loadLocalDirectory(
            pm,
            allURLs,
            allPosts,
            config,
            source,
            filter,
            weight,
            helpers,
            cachePath,
            pathSep
          )
        }
      } else {
        if (returnPromise) {
          return await new CancelablePromise((resolve) => {
            workerFunction(
              allURLs,
              allPosts,
              config,
              source,
              filter,
              weight,
              helpers,
              pathSep,
              resolve
            )
          })
        } else {
          workerFunction(
            allURLs,
            allPosts,
            config,
            source,
            filter,
            weight,
            helpers,
            pathSep
          )
        }
      }
    } else {
      if (returnPromise) {
        return await new CancelablePromise((resolve) => {
          workerFunction(
            allURLs,
            allPosts,
            config,
            source,
            filter,
            weight,
            helpers,
            pathSep,
            resolve
          )
        })
      } else {
        workerFunction(
          allURLs,
          allPosts,
          config,
          source,
          filter,
          weight,
          helpers,
          pathSep
        )
      }
    }
  }
}

const loadNimja = (
  pm: Function,
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  cachePath: string,
  pathSep: string
) => {
  const sources = [source.url]
  allURLs = processAllURLs(sources, allURLs, source, weight, helpers, pathSep)
  helpers.next = null
  pm({
    data: {
      data: sources,
      allURLs,
      allPosts,
      weight,
      helpers,
      source,
      timeout: 0,
      pathSep
    }
  })
}

const loadLocalDirectory = async (
  pm: Function,
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  cachePath: string,
  pathSep: string
) => {
  const blacklist = ['*.css', '*.html', 'avatar.png', '*.txt']
  const url = cachePath || source.url
  const localSource = helpers.next === -1
  let data: any | undefined
  try {
    data = url
      ? await flipflip().api.recursiveReaddir(
          url,
          blacklist,
          source.blacklist,
          filter,
          localSource
        )
      : undefined
  } catch (err: any) {
    pm({
      data: {
        error: err.message,
        helpers,
        source,
        timeout: 0,
        pathSep
      }
    })
  }

  if (data) {
    allURLs = processAllURLs(
      data.sources,
      allURLs,
      source,
      weight,
      helpers,
      pathSep
    )
    // If this is a local source (not a cacheDir call)
    if (localSource) {
      helpers.count = data.count
      helpers.next = null
    }

    pm({
      data: {
        data: data.sources,
        allURLs,
        allPosts,
        weight,
        helpers,
        source,
        timeout: 0,
        pathSep
      }
    })
  }
}

export const loadVideo = async (
  pm: Function,
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  cachePath: string,
  pathSep: string
) => {
  const url = cachePath || source.url
  const missingVideo = () => {
    pm({
      data: {
        error: 'Could not find ' + source.url,
        data: [],
        allURLs,
        allPosts,
        weight,
        helpers,
        source,
        timeout: 0,
        pathSep
      }
    })
  }
  const ifExists = async (url: string) => {
    if (!url.startsWith('http')) {
      url = await flipflip().api.getFileUrl(url)
    }
    helpers.count = 1

    let paths
    if (source.clips && source.clips.length > 0) {
      const clipPaths = Array<string>()
      for (const clip of source.clips) {
        if (!source.disabledClips || !source.disabledClips.includes(clip.id)) {
          let clipPath =
            url +
            ':::' +
            clip.id +
            ':' +
            (clip.volume != null ? clip.volume : '-') +
            ':::' +
            clip.start +
            ':' +
            clip.end
          if (source.subtitleFile != null && source.subtitleFile.length > 0) {
            clipPath = clipPath + '|||' + source.subtitleFile
          }
          clipPaths.push(clipPath)
        }
      }
      paths = clipPaths
    } else {
      if (source.subtitleFile != null && source.subtitleFile.length > 0) {
        url = url + '|||' + source.subtitleFile
      }
      paths = [url]
    }

    if (source.blacklist && source.blacklist.length > 0) {
      paths = paths.filter((url: string) => !source.blacklist.includes(url))
    }
    allURLs = processAllURLs(paths, allURLs, source, weight, helpers, pathSep)
    helpers.next = null

    pm({
      data: {
        data: paths,
        allURLs,
        allPosts,
        weight,
        helpers,
        source,
        timeout: 0,
        pathSep
      }
    })
  }

  if (!isVideo(url, false)) {
    missingVideo()
  }
  if (url.startsWith('http')) {
    wretch(url)
      .get()
      .notFound((e) => {
        missingVideo()
      })
      .res((r) => {
        ifExists(url)
      })
  } else {
    const exists = await flipflip().api.pathExists(url)
    if (exists) {
      ifExists(url)
    } else {
      missingVideo()
    }
  }
}

export const loadPlaylist = (
  pm: Function,
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  cachePath: string,
  pathSep: string
) => {
  const url = cachePath || source.url
  wretch(url)
    .get()
    .text((data) => {
      let urls: string[] = []
      if (url.endsWith('.asx')) {
        const refs = new DOMParser()
          .parseFromString(data, 'text/xml')
          .getElementsByTagName('Ref')
        for (let r = 0; r < refs.length; r++) {
          const l = refs[r]
          urls.push(l.getAttribute('href') as string)
        }
      } else if (url.endsWith('.m3u8')) {
        for (const l of data.split('\n')) {
          if (l.length > 0 && !l.startsWith('#')) {
            urls.push(l.trim())
          }
        }
      } else if (url.endsWith('.pls')) {
        for (const l of data.split('\n')) {
          if (l.startsWith('File')) {
            urls.push(l.split('=')[1].trim())
          }
        }
      } else if (url.endsWith('.xspf')) {
        const locations = new DOMParser()
          .parseFromString(data, 'text/xml')
          .getElementsByTagName('location')
        for (let r = 0; r < locations.length; r++) {
          const l = locations[r]
          urls.push(l.textContent as string)
        }
      }

      if (urls.length > 0) {
        helpers.count = urls.length
      }

      urls = filterPathsToJustPlayable(filter, urls, true)

      if (source.blacklist && source.blacklist.length > 0) {
        urls = urls.filter((url: string) => !source.blacklist.includes(url))
      }
      allURLs = processAllURLs(urls, allURLs, source, weight, helpers, pathSep)
      helpers.next = null

      pm({
        data: {
          data: urls,
          allURLs,
          allPosts,
          weight,
          helpers,
          source,
          timeout: 0,
          pathSep
        }
      })
    })
    .catch((e) => {
      pm({
        data: {
          error: e.message,
          helpers,
          source,
          timeout: 0,
          pathSep
        }
      })
    })
}

const loadRemoteImageURLListPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadRemoteImageURLList(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadInWorker = (event: string) => {
  return (
    allURLs: Map<string, string[]>,
    allPosts: Map<string, string>,
    config: Config,
    source: LibrarySource,
    filter: string,
    weight: string,
    helpers: { next: any; count: number; retries: number; uuid: string },
    pathSep: string
  ) => {
    flipflip().api.loadInWorker(event, [
      allURLs,
      allPosts,
      config,
      source,
      filter,
      weight,
      helpers,
      pathSep
    ])
  }
}

const loadTumblrPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadTumblr(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadRedditPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadReddit(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadRedGifsPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadRedGifs(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadImageFapPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadImageFap(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadSexComPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadSexCom(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadImgurPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadImgur(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadTwitterPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadTwitter(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadDeviantArtPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadDeviantArt(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadInstagramPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadInstagram(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadDanbooruPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadDanbooru(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadE621Promise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadE621(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadGelbooru1Promise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadGelbooru1(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadGelbooru2Promise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadGelbooru2(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadEHentaiPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadEHentai(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadBDSMlrPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadBDSMlr(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadHydrusPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadHydrus(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadPiwigoPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadPiwigo(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}

const loadLusciousPromise = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve: Function
) => {
  loadLuscious(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    pathSep,
    resolve
  )
}
