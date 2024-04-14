import { v4 as uuidv4 } from 'uuid'
import { AppDispatch, RootState } from '../store'
import { LibrarySource, ScrapeResult, newLibrarySource } from 'flipflip-common'
import { PlayerState, setPlayersLoaded } from '../player/slice'
import { randomizeList } from '../../data/utils'
import { getSourceType, ST, SOF } from 'flipflip-common'
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
import { loadImageViews } from '../player/thunks'

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
    if (
      isPlayerStopped(
        dispatch,
        state,
        playerUUID,
        sceneID,
        isNextSceneID,
        overlayIndex
      )
    ) {
      return
    }

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

    const workerUUID = state.sourceScraper[sceneID].workerUUID
    const receiveMessage = async (message?: ScrapeResult) => {
      const state = getState()
      if (
        isPlayerStopped(
          dispatch,
          state,
          playerUUID,
          sceneID,
          isNextSceneID,
          overlayIndex
        )
      ) {
        return
      }

      const object = message
      if (object?.helpers?.uuid !== workerUUID) {
        return
      }

      if (object?.captcha != null && captcha == null) {
        dispatch(
          setPlayerCaptcha({
            uuid: playerUUID,
            overlayIndex,
            value: {
              captcha: object.captcha,
              source: object?.source,
              helpers: object?.helpers
            }
          })
        )
      }

      if (object?.error != null) {
        const next = object?.helpers?.next
        console.error(
          'Error retrieving ' +
            object?.source?.url +
            (next > 0 ? ' Page ' + next : '')
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
      if (object?.source) {
        if (object?.data) {
          const sources = state.sourceScraper[sceneID]
          const value: ScrapedSources = {
            ...sources,
            allURLs: object.allURLs,
            allPosts: object.allPosts ?? {}
          }

          // Add the next promise to the queue
          const { source, helpers } = object
          if (helpers?.next != null) {
            value.promiseQueue = [...value.promiseQueue, { source, helpers }]
          }

          dispatch(setSourceScraperSources({ id: sceneID, value }))
          dispatch(
            setCount(source.url, helpers?.count ?? 0, helpers?.next == null)
          )
          if (!isNextSceneID) {
            dispatch(loadImageViews(playerUUID, overlayIndex))
          }
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
    const { imageTypeFilter, weightFunction } = state.scene.entries[sceneID]
    flipflip()
      .api.scrapeFiles(
        sources.allURLs as Record<string, string[]>,
        sources.allPosts,
        config,
        promiseData.source,
        imageTypeFilter,
        weightFunction,
        { ...promiseData.helpers, uuid: workerUUID },
        state
      )
      .then(receiveMessage)
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
    if (
      isPlayerStopped(
        dispatch,
        state,
        playerUUID,
        sceneID,
        isNextSceneID,
        overlayIndex
      )
    ) {
      return
    }

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

    const sceneSources = scraperState.sceneSources
    const d = newLibrarySource(sceneSources[current])
    let allURLs: Record<string, string[]>
    if (scraperState.allURLs) {
      allURLs = scraperState.allURLs
    } else {
      allURLs = {}
      sceneSources.forEach((s) => (allURLs[s.url] = []))
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
    if (!scene.playVideoClips && d.clips.length > 0) {
      d.clips = []
    }

    const workerUUID = state.sourceScraper[sceneID].workerUUID
    const receiveMessage = (message?: ScrapeResult) => {
      const state = getState()
      if (
        isPlayerStopped(
          dispatch,
          state,
          playerUUID,
          sceneID,
          isNextSceneID,
          overlayIndex
        )
      ) {
        return
      }

      const object = message
      if (object?.helpers != null && object.helpers.uuid !== workerUUID) {
        return
      }

      if (!isNextSceneID) {
        const captcha = state.players[playerUUID]?.captcha
        if (object?.captcha != null && captcha == null) {
          dispatch(
            setPlayerCaptcha({
              uuid: playerUUID,
              overlayIndex,
              value: {
                captcha: object.captcha,
                source: object?.source,
                helpers: object?.helpers
              }
            })
          )
        }
      }

      if (object?.error != null) {
        const next = object?.helpers?.next
        console.error(
          'Error retrieving ' +
            object?.source?.url +
            (next > 0 ? ' Page ' + next : '')
        )
        console.error(object.error)
      }

      if (object?.warning != null) {
        console.warn(object.warning)
      }

      if (object?.systemMessage != null) {
        dispatch(systemMessage(object.systemMessage))
      }

      if (object?.source) {
        // Just add the new urls to the end of the list
        if (object?.data && object?.allURLs) {
          const sources = state.sourceScraper[sceneID]
          const value: ScrapedSources = {
            ...sources,
            allURLs: object.allURLs,
            allPosts: object.allPosts ?? {}
          }

          // Add the next promise to the queue
          const { source, helpers } = object
          if (helpers?.next != null) {
            value.promiseQueue = [...value.promiseQueue, { source, helpers }]
          }

          dispatch(setSourceScraperSources({ id: sceneID, value }))
          dispatch(
            setCount(source.url, helpers?.count ?? 0, helpers?.next == null)
          )
          if (!isNextSceneID) {
            dispatch(loadImageViews(playerUUID, overlayIndex))
          }
        }

        const timeout = object?.timeout != null ? object.timeout : 1000
        setTimeout(() => {
          dispatch(sourceLoop(playerUUID, sceneID, isNextSceneID, overlayIndex))
        }, timeout)
      }
    }

    const config = state.app.config
    const { imageTypeFilter, weightFunction } = state.scene.entries[sceneID]
    flipflip()
      .api.scrapeFiles(
        allURLs,
        scraperState.allPosts,
        config,
        d,
        imageTypeFilter,
        weightFunction,
        { next: -1, count: 0, retries: 0, uuid: workerUUID },
        state
      )
      .then(receiveMessage)
  }
}

function startScrape(
  playerUUID: string,
  sceneID: number,
  isNextSceneID: boolean,
  overlayIndex?: number
) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
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

    if (scene.sourceOrderFunction === SOF.random) {
      randomizeList(sceneSources)
    }

    dispatch(setSourceScraperSceneSources({ id: sceneID, value: sceneSources }))
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
    scrapedSources.promiseQueue.length > 0 && scrapedSources.workerUUID === ''
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
      setTimeout(() => {
        dispatch(sourceLoop(playerUUID, sceneID, isNextSceneID, overlayIndex))
      }, 200)
      scheduled = true
    } else if (shouldScrapePromises(sceneID, state.sourceScraper)) {
      dispatch(
        setSourceScraperSourcesWorker({ id: sceneID, value: workerUUID })
      )
      setTimeout(() => {
        dispatch(promiseLoop(playerUUID, sceneID, isNextSceneID, overlayIndex))
      }, 200)
      scheduled = true
    }

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
      dispatch(scheduleScrape(playerUUID, nextSceneID, true, workerUUID))
    }
    overlays.forEach(({ sceneID }, index) => {
      dispatch(scheduleScrape(playerUUID, sceneID, false, workerUUID, index))
    })
  }
}
