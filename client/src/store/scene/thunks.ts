import { type AppDispatch, type RootState } from '../store'
import { getEntry } from '../EntryState'
import { newCaptionScript } from '../captionScript/CaptionScript'
import type Scene from './Scene'
import { newScene } from './Scene'
import {
  setScene,
  setScenes,
  setSceneAddSource,
  setSceneAddScriptPlaylist,
  setSceneSources,
  setSceneAddSources,
  setSceneVideoVolume
} from './slice'
import type LibrarySource from '../librarySource/LibrarySource'
import { newLibrarySource } from '../librarySource/LibrarySource'
import {
  addLibrarySources,
  setLibrarySource,
  setLibrarySources
} from '../librarySource/slice'
import {
  areWeightsValid,
  filterSource,
  reduceList,
  randomizeList,
  isSceneIDAGridID,
  convertSceneIDToGridID,
  applyEffects,
  arrayMove
} from '../../data/utils'
import {
  copy,
  getSourceType,
  removeDuplicatesBy,
  RP,
  ST,
  TT,
  SL,
  HTF,
  VTF,
  IT,
  AF,
  GT,
  SP,
  SS,
  WeightGroup
} from 'flipflip-common'
import {
  addRoutes,
  addToLibrary,
  addToScenes,
  removeFromScenes,
  setRoute,
  setSpecialMode,
  setSystemSnack,
  systemMessage,
  openLibraryImport
} from '../app/slice'
import { newRoute } from '../app/data/Route'
import { getSourceUrl } from '../../data/actions'
import { setCaptionScript } from '../captionScript/slice'
import { newTag } from '../tag/Tag'
import { setTag } from '../tag/slice'
import { setSceneGrid } from '../sceneGrid/slice'
import { newSceneGridCell } from '../sceneGrid/SceneGridCell'
import { toSceneGridStorage, toSceneStorage } from '../app/convert'
import {
  type Scene as SceneStorage,
  type SceneGrid as SceneGridStorage
} from 'flipflip-common'
import { getVideoClipperScene } from './selectors'
import { getActiveScene } from '../app/thunks'
import flipflip from '../../FlipFlipService'

export function startFromScene(sceneName: string) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const scene = Object.values(state.scene.entries).find(
      (s) => s.name === sceneName
    )
    if (scene) {
      if (scene.sources.length > 0) {
        dispatch(
          setRoute([
            newRoute({ kind: 'scene', value: scene.id }),
            newRoute({ kind: 'play', value: scene.id })
          ])
        )
      } else {
        console.error("Scene '" + sceneName + "' has no sources")
      }
    } else {
      console.error("Couldn't find scene '" + sceneName + "'")
    }
  }
}

export function generateScenes(
  id: number,
  children: boolean = true,
  force: boolean = false
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const generateScenes: Scene[] = []
    if (id.toString().startsWith('999')) {
      const gridID = Number(id.toString().replace('999', ''))
      const sceneGrid = state.sceneGrid.entries[gridID]
      for (const row of sceneGrid.grid) {
        for (const cell of row) {
          const gScene = state.scene.entries[cell.sceneID]
          if (
            gScene?.generatorWeights &&
            gScene.regenerate &&
            areWeightsValid(gScene)
          ) {
            generateScenes.push(gScene)
          }
          if (gScene && gScene.overlayEnabled) {
            for (const overlayID of gScene.overlays) {
              const overlay = state.overlay.entries[overlayID]
              if (overlay.sceneID.toString().startsWith('999')) {
                // No grid overlays within a grid
              } else {
                const oScene = state.scene.entries[overlay.sceneID]
                if (
                  oScene?.generatorWeights &&
                  oScene.regenerate &&
                  areWeightsValid(oScene)
                ) {
                  generateScenes.push(oScene)
                }
              }
            }
          }
        }
      }
    } else {
      const scene = state.scene.entries[id]
      if ((scene.regenerate || force) && areWeightsValid(scene)) {
        generateScenes.push(scene)
      }
      if (scene.overlayEnabled && children) {
        for (const overlayID of scene.overlays) {
          const overlay = state.overlay.entries[overlayID]
          if (overlay.sceneID.toString().startsWith('999')) {
            const id = Number(overlay.sceneID.toString().replace('999', ''))
            const oScene = state.sceneGrid.entries[id]
            for (const row of oScene.grid) {
              for (const cell of row) {
                const gScene = state.scene.entries[cell.sceneID]
                if (
                  gScene?.generatorWeights &&
                  gScene.regenerate &&
                  areWeightsValid(gScene)
                ) {
                  generateScenes.push(gScene)
                }
              }
            }
          } else {
            const oScene = state.scene.entries[overlay.sceneID]
            if (
              oScene?.generatorWeights &&
              oScene.regenerate &&
              areWeightsValid(oScene)
            ) {
              generateScenes.push(oScene)
            }
          }
        }
      }
    }

    const newScenes: Scene[] = []
    for (const scene of generateScenes) {
      const newScene = state.scene.entries[scene.id]
      let generatorWeights = newScene.generatorWeights ?? []

      // Add globally ignored tags/types if not overridden by generator
      if (!newScene.overrideIgnore) {
        for (const ignored of state.app.config.displaySettings.ignoredTags) {
          generatorWeights = generatorWeights.concat([
            { type: TT.none, search: ignored }
          ])
        }
      }

      // Record all the groups we're requiring/excluding
      const allSearches = generatorWeights
        .filter((wg) => wg.type === TT.all && !wg.rules)
        .map((wg) => wg.search as string)
      const noneSearches = generatorWeights
        .filter((wg) => wg.type === TT.none && !wg.rules)
        .map((wg) => wg.search as string)
      const allAdvRules = generatorWeights
        .filter((wg) => wg.type === TT.all && wg.rules)
        .map((wg) => wg.search as string)
      const noneAdvRules = generatorWeights
        .filter((wg) => wg.type === TT.none && wg.rules)
        .map((wg) => wg.search as string)

      // Sources to require
      let reqAdvSources: LibrarySource[] | undefined
      // Sources to exclude
      let excAdvSources: LibrarySource[] | undefined

      // Build generator's list of sources
      let genSources = new Array<LibrarySource>()

      // First, build all our adv rules
      for (const wg of generatorWeights.filter((wg) => !!wg.rules)) {
        // Build each adv rule like a regular set of simple rules
        // First get tags to require/exclude
        const rules = wg.rules as WeightGroup[]
        const ruleAllSearches = rules
          .filter((wg) => wg.type === TT.all)
          .map((wg) => wg.search as string)
        const ruleOrSearches = rules
          .filter((wg) => wg.type === TT.or)
          .map((wg) => wg.search as string)
        const ruleNoneSearches = rules
          .filter((wg) => wg.type === TT.none)
          .map((wg) => wg.search as string)

        // Build this rule's list of sources
        let rulesSources = new Array<LibrarySource>()

        // If we don't have any weights, calculate by just require/exclude
        if (
          ruleAllSearches.length +
            ruleOrSearches.length +
            ruleNoneSearches.length ===
          rules.length
        ) {
          const sources = []
          // For each source in the library
          for (const sourceID of state.app.library) {
            const s = state.librarySource.entries[sourceID]
            let addedClip = false
            const invalidClips = []
            // If this is a video with clips
            if (
              getSourceType(s.url) === ST.video &&
              s.clips &&
              s.clips.length > 0
            ) {
              // Weight each clip first
              for (const clipID of s.clips) {
                const c = state.clip.entries[clipID]
                let b = false

                // Filter out clips which don't have ruleAllSearches/allSearches
                for (const as of ruleAllSearches) {
                  if (!filterSource(as, s, c, state.tag.entries)) {
                    invalidClips.push(c.id)
                    b = true
                    break
                  }
                }
                if (b) continue
                for (const as of allSearches) {
                  if (!filterSource(as, s, c, state.tag.entries)) {
                    invalidClips.push(c.id)
                    b = true
                    break
                  }
                }
                if (b) continue

                // Filter out clips which don't have any ruleOrSearches
                let anyRos = ruleOrSearches.length === 0
                for (const os of ruleOrSearches) {
                  if (filterSource(os, s, c, state.tag.entries)) {
                    anyRos = true
                    break
                  }
                }
                if (!anyRos) {
                  invalidClips.push(c.id)
                  continue
                }

                // Filter out clips which have ruleNoneSearches/noneSearches
                for (const ns of ruleNoneSearches) {
                  if (filterSource(ns, s, c, state.tag.entries)) {
                    invalidClips.push(c.id)
                    b = true
                    break
                  }
                }
                if (b) continue
                for (const ns of noneSearches) {
                  if (filterSource(ns, s, c, state.tag.entries)) {
                    invalidClips.push(c.id)
                    b = true
                    break
                  }
                }
                if (b) continue

                // If this clip is valid, mark as added
                addedClip = true
              }
            }

            // If we're not already adding a clip, check the source
            if (!addedClip) {
              let b = false

              // Filter out sources which don't have ruleAllSearches/allSearches
              for (const as of ruleAllSearches) {
                if (!filterSource(as, s, undefined, state.tag.entries)) {
                  b = true
                  break
                }
              }
              if (b) continue
              for (const as of allSearches) {
                if (!filterSource(as, s, undefined, state.tag.entries)) {
                  b = true
                  break
                }
              }
              if (b) continue

              // Filter out sources which don't have any ruleOrSearches
              let anyRos = ruleOrSearches.length === 0
              for (const os of ruleOrSearches) {
                if (filterSource(os, s, undefined, state.tag.entries)) {
                  anyRos = true
                  break
                }
              }
              if (!anyRos) {
                continue
              }

              // Filter out sources which have ruleNoneSearches/noneSearches
              for (const ns of ruleNoneSearches) {
                if (filterSource(ns, s, undefined, state.tag.entries)) {
                  b = true
                  break
                }
              }
              if (b) continue
              for (const ns of noneSearches) {
                if (filterSource(ns, s, undefined, state.tag.entries)) {
                  b = true
                  break
                }
              }
              if (b) continue
            } else {
              // If we're adding a clip, mark invalid ones
              s.disabledClips = invalidClips
            }
            sources.push(s)
          }
          rulesSources = sources
        } else {
          // Otherwise, generate sources for each weighted rule
          const rules = wg.rules as WeightGroup[]
          for (const rule of rules) {
            if (rule.type === TT.weight) {
              const sources = []
              // For each source in the library
              for (const sourceID of state.app.library) {
                const s = state.librarySource.entries[sourceID]
                let addedClip = false
                const invalidClips = []
                // If this is a video with clips
                if (
                  getSourceType(s.url) === ST.video &&
                  s.clips &&
                  s.clips.length > 0
                ) {
                  // Weight each clip first
                  for (const clipID of s.clips) {
                    const c = state.clip.entries[clipID]
                    let b = false

                    // Filter out clips which don't match this search
                    if (
                      !filterSource(
                        rule.search as string,
                        s,
                        c,
                        state.tag.entries
                      )
                    ) {
                      invalidClips.push(c.id)
                      continue
                    }

                    // Filter out clips which don't have ruleAllSearches/allSearches
                    for (const as of ruleAllSearches) {
                      if (!filterSource(as, s, c, state.tag.entries)) {
                        invalidClips.push(c.id)
                        b = true
                        break
                      }
                    }
                    if (b) continue
                    for (const as of allSearches) {
                      if (!filterSource(as, s, c, state.tag.entries)) {
                        invalidClips.push(c.id)
                        b = true
                        break
                      }
                    }
                    if (b) continue

                    // Filter out clips which don't have any ruleOrSearches
                    let anyRos = ruleOrSearches.length === 0
                    for (const os of ruleOrSearches) {
                      if (filterSource(os, s, c, state.tag.entries)) {
                        anyRos = true
                        break
                      }
                    }
                    if (!anyRos) {
                      invalidClips.push(c.id)
                      continue
                    }

                    // Filter out clips which have ruleNonSearches/noneSearches
                    for (const ns of ruleNoneSearches) {
                      if (filterSource(ns, s, c, state.tag.entries)) {
                        invalidClips.push(c.id)
                        b = true
                        break
                      }
                    }
                    if (b) continue
                    for (const ns of noneSearches) {
                      if (filterSource(ns, s, c, state.tag.entries)) {
                        invalidClips.push(c.id)
                        b = true
                        break
                      }
                    }
                    if (b) continue

                    // If this clip is valid, mark as added
                    addedClip = true
                  }
                }

                // If we've not already added a clip, check the source
                if (!addedClip) {
                  let b = false

                  // Filter out sources which don't match this search
                  if (
                    !filterSource(
                      rule.search as string,
                      s,
                      undefined,
                      state.tag.entries
                    )
                  ) {
                    continue
                  }

                  // Filter out sources which don't have ruleAllSearches/allSearches
                  for (const as of ruleAllSearches) {
                    if (!filterSource(as, s, undefined, state.tag.entries)) {
                      b = true
                      break
                    }
                  }
                  if (b) continue
                  for (const as of allSearches) {
                    if (!filterSource(as, s, undefined, state.tag.entries)) {
                      b = true
                      break
                    }
                  }
                  if (b) continue

                  // Filter out sources which don't have any ruleOrSearches
                  let anyRos = ruleOrSearches.length === 0
                  for (const os of ruleOrSearches) {
                    if (filterSource(os, s, undefined, state.tag.entries)) {
                      anyRos = true
                      break
                    }
                  }
                  if (!anyRos) {
                    continue
                  }

                  // Filter out sources which have ruleNoneSearches/noneSearches
                  for (const ns of ruleNoneSearches) {
                    if (filterSource(ns, s, undefined, state.tag.entries)) {
                      b = true
                      break
                    }
                  }
                  if (b) continue
                  for (const ns of noneSearches) {
                    if (filterSource(ns, s, undefined, state.tag.entries)) {
                      b = true
                      break
                    }
                  }
                  if (b) continue
                } else {
                  // If we're adding a clip, mark invalid ones
                  s.disabledClips = invalidClips
                }
                sources.push(s)
              }
              // Randomize list and reduce
              rulesSources = rulesSources.concat(randomizeList(sources))
            }
          }
        }
        switch (wg.type) {
          // If this adv rule is weighted, add the percentage of sources to the master list
          case TT.weight:
            wg.max = rulesSources.length
            const chosenSources = reduceList(
              randomizeList(rulesSources),
              Math.round(newScene.generatorMax * ((wg.percent as number) / 100))
            )
            genSources = genSources.concat(chosenSources)
            wg.chosen = chosenSources.length
            break
          // If this adv rule is all, add the sources to the require list
          case TT.all:
            if (!reqAdvSources) {
              reqAdvSources = rulesSources
            } else {
              reqAdvSources = reqAdvSources.filter(
                (s) => !!rulesSources.find((source) => source.url === s.url)
              )
            }
            break
          // If this adv rule is none, add the sources to the excl list
          case TT.none:
            if (!excAdvSources) {
              excAdvSources = rulesSources
            } else {
              excAdvSources = excAdvSources.concat(rulesSources)
            }
            break
        }
      }

      // Now, build our simple rules
      // If we don't have any weights, calculate by just require/exclude
      if (
        allSearches.length +
          noneSearches.length +
          allAdvRules.length +
          noneAdvRules.length ===
        generatorWeights.length
      ) {
        const sources = []
        for (const sourceID of state.app.library) {
          const s = state.librarySource.entries[sourceID]
          // Filter out sources which are not in required list
          if (
            reqAdvSources &&
            !reqAdvSources.find((source) => source.id === s.id)
          ) {
            continue
          }
          // Filter out sources which are in exclude list
          if (excAdvSources?.find((source) => source.id === s.id)) {
            continue
          }

          let addedClip = false
          const invalidClips = []
          // If this is a video with clips
          if (
            getSourceType(s.url) === ST.video &&
            s.clips &&
            s.clips.length > 0
          ) {
            // Weight each clip first
            for (const clipID of s.clips) {
              const c = state.clip.entries[clipID]
              let b = false

              // Filter out clips which don't have allSearches
              for (const as of allSearches) {
                if (!filterSource(as, s, c, state.tag.entries)) {
                  invalidClips.push(c.id)
                  b = true
                  break
                }
              }
              if (b) continue

              // Filter out clips which have noneSearches
              for (const ns of noneSearches) {
                if (filterSource(ns, s, c, state.tag.entries)) {
                  invalidClips.push(c.id)
                  b = true
                  break
                }
              }
              if (b) continue

              // If this clip is valid, mark as added
              addedClip = true
            }
          }

          // If we're not already adding a clip, check the source
          if (!addedClip) {
            let b = false

            // Filter out sources which don't have allSearches
            for (const as of allSearches) {
              if (!filterSource(as, s, undefined, state.tag.entries)) {
                b = true
                break
              }
            }
            if (b) continue

            // Filter out sources which have noneSearches
            for (const ns of noneSearches) {
              if (filterSource(ns, s, undefined, state.tag.entries)) {
                b = true
                break
              }
            }
            if (b) continue
          } else {
            // If we're adding a clip, mark invalid ones
            s.disabledClips = invalidClips
          }
          sources.push(s)
        }
        genSources = sources
      } else {
        // Otherwise, generate sources for each weight
        for (const wg of generatorWeights.filter(
          (wg) => !wg.rules && wg.type === TT.weight
        )) {
          const sources = []
          // For each source in the library
          for (const sourceID of state.app.library) {
            const s = state.librarySource.entries[sourceID]
            // Filter out sources which are not in required list
            if (
              reqAdvSources &&
              !reqAdvSources.find((source) => source.id === s.id)
            ) {
              continue
            }
            // Filter out sources which are in exclude list
            if (excAdvSources?.find((source) => source.id === s.id)) {
              continue
            }

            let addedClip = false
            const invalidClips = []
            // If this is a video with clips
            if (
              getSourceType(s.url) === ST.video &&
              s.clips &&
              s.clips.length > 0
            ) {
              // Weight each clip first
              for (const clipID of s.clips) {
                const c = state.clip.entries[clipID]
                let b = false

                // Filter out clips which don't match this search
                if (
                  !filterSource(wg.search as string, s, c, state.tag.entries)
                ) {
                  invalidClips.push(c.id)
                  continue
                }

                // Filter out clips which don't have allSearches
                for (const as of allSearches) {
                  if (!filterSource(as, s, c, state.tag.entries)) {
                    invalidClips.push(c.id)
                    b = true
                    break
                  }
                }
                if (b) continue

                // Filter out clips which have noneSearches
                for (const ns of noneSearches) {
                  if (filterSource(ns, s, c, state.tag.entries)) {
                    invalidClips.push(c.id)
                    b = true
                    break
                  }
                }
                if (b) continue

                // If this clip is valid, mark as added
                addedClip = true
              }
            }

            // If we're not already adding a clip, check the source tags
            if (!addedClip) {
              let b = false

              // Filter out sources which don't match this search
              if (
                !filterSource(
                  wg.search as string,
                  s,
                  undefined,
                  state.tag.entries
                )
              ) {
                continue
              }

              // Filter out sources which don't have allSearches
              for (const as of allSearches) {
                if (!filterSource(as, s, undefined, state.tag.entries)) {
                  b = true
                  break
                }
              }
              if (b) continue

              // Filter out sources which have noneSearches
              for (const ns of noneSearches) {
                if (filterSource(ns, s, undefined, state.tag.entries)) {
                  b = true
                  break
                }
              }
              if (b) continue
            } else {
              // If we're adding a clip, mark invalid ones
              s.disabledClips = invalidClips
            }
            sources.push(s)
          }
          wg.max = sources.length
          const chosenSources = reduceList(
            sources,
            Math.round(newScene.generatorMax * ((wg.percent as number) / 100))
          )
          genSources = genSources.concat(chosenSources)
          wg.chosen = chosenSources.length
        }
      }
      genSources = reduceList(
        randomizeList(removeDuplicatesBy((s) => s.url, genSources)),
        newScene.generatorMax
      )
      genSources = copy<LibrarySource[]>(genSources)
      const startID = state.librarySource.nextID
      genSources.forEach((s, i) => (s.id = startID + i))
      dispatch(addLibrarySources(genSources))
      newScene.sources = genSources.map((s) => s.id)
      newScenes.push(newScene)
    }

    dispatch(setScenes(newScenes))
  }
}

export function playAudio(audioID: number, displayed: number[]) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const source = state.audio.entries[audioID]
    const sourceURL = getSourceUrl(source, state.constants.pathSep)
    const libraryID = state.app.audios.find(
      (id) => state.audio.entries[id].url === sourceURL
    )
    if (libraryID == null) {
      dispatch(
        systemMessage('The source ' + sourceURL + " isn't in your Library")
      )
      return
    }

    const startIndex = displayed.indexOf(source.id)
    const tempScene = newScene({
      id: state.scene.nextID,
      name: 'audio_scene_temp',
      libraryID,
      audioScene: true,
      audioEnabled: true,
      audioPlaylists: [{ audios: displayed, shuffle: false, repeat: RP.all }],
      audioStartIndex: startIndex,
      strobe: true,
      strobeTime: 10000,
      strobeLayer: SL.image,
      panning: true,
      panDuration: 20000,
      panHorizTransType: HTF.random,
      panHorizTransLevelMax: 50,
      panHorizTransLevelMin: 10,
      panHorizTransRandom: true,
      panVertTransType: VTF.random,
      panVertTransLevelMax: 50,
      panVertTransLevelMin: 10,
      panVertTransRandom: true,
      imageType: IT.centerNoClip
    })

    dispatch(setScene(tempScene))
    dispatch(
      addRoutes([
        newRoute({ kind: 'scene', value: tempScene.id }),
        newRoute({ kind: 'libraryplay', value: tempScene.id })
      ])
    )
  }
}

export function playScript(
  scriptID: number,
  sceneID: number,
  displayed: number[]
) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const source = state.captionScript.entries[scriptID]
    const sourceURL = getSourceUrl(source, state.constants.pathSep)
    const libraryID = state.app.scripts.find(
      (id) => state.captionScript.entries[id].url === sourceURL
    )
    if (libraryID == null) {
      dispatch(
        systemMessage('The source ' + sourceURL + " isn't in your Library")
      )
      return
    }

    const startIndex = displayed.indexOf(source.id)
    const tempScene = copy<Scene>(state.scene.entries[sceneID])
    tempScene.id = state.scene.nextID
    tempScene.libraryID = libraryID
    tempScene.scriptScene = true
    tempScene.textEnabled = true
    tempScene.scriptPlaylists = [
      { scripts: displayed, shuffle: false, repeat: RP.all }
    ]
    tempScene.scriptStartIndex = startIndex

    dispatch(setScene(tempScene))
    dispatch(
      addRoutes([
        newRoute({ kind: 'scene', value: tempScene.id }),
        newRoute({ kind: 'libraryplay', value: tempScene.id })
      ])
    )
  }
}

export function nextScene(sceneID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const scene = state.scene.entries[sceneID]
    if (scene && scene.nextSceneID !== 0) {
      const nextSceneID =
        scene.nextSceneID === -1 ? scene.nextSceneRandomID : scene.nextSceneID
      const nextScene = state.scene.entries[nextSceneID]
      if (nextScene != null) {
        dispatch(
          setRoute([
            newRoute({ kind: 'scene', value: nextScene.id }),
            newRoute({ kind: 'play', value: nextScene.id })
          ])
        )
      }
    }
  }
}

function getNewSources(
  originalSources: LibrarySource[],
  newSources: string[],
  state: RootState
) {
  // dedup
  newSources = [...new Set(newSources)]
  const sourceURLs = originalSources.map((s) => s.url)
  newSources = newSources.filter((s) => !sourceURLs.includes(s))

  const id = state.librarySource.nextID
  return newSources.map((url, index) => {
    const librarySource = state.app.library
      .map((id) => state.librarySource.entries[id])
      .find((source) => source.url === url)
    return newLibrarySource({
      url,
      id: id + index,
      lastCheck: new Date().getTime(),
      tags: librarySource ? librarySource.tags : [],
      clips: librarySource ? librarySource.clips : [],
      blacklist: librarySource ? librarySource.blacklist : [],
      count: librarySource ? librarySource.count : 0,
      countComplete: librarySource ? librarySource.countComplete : false
    })
  })
}

function getImportURLs(
  importURL: string,
  pathSep: string,
  rootDir?: string
): string[] {
  if (importURL.includes('sources=')) {
    // Remove everything before "sources="
    importURL = importURL.substring(importURL.indexOf('sources=') + 8)

    if (importURL.includes('&')) {
      // Remove everything after the sources parameter
      importURL = importURL.substring(0, importURL.indexOf('&'))
    }

    // Split into blog names
    const importURLs = importURL.split('%20')
    for (let u = 0; u < importURLs.length; u++) {
      let fullPath
      if (rootDir) {
        fullPath = rootDir + importURLs[u]
      } else {
        fullPath = 'http://' + importURLs[u] + '.tumblr.com'
      }
      if (
        importURLs.includes(fullPath) ||
        importURLs[u] === pathSep ||
        importURLs[u] === ''
      ) {
        // Remove index and push u back
        importURLs.splice(u, 1)
        u -= 1
      } else {
        importURLs[u] = fullPath
      }
    }
    return importURLs
  }
  return []
}

export function addSource(type: string, sceneID?: number, ...args: any[]) {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<void> => {
    const state = getState()
    const pathSep = state.constants.pathSep
    const handleArgs = (sceneID: number): void => {
      if (args.length > 0) {
        let importURL = args[0]
        // Update hastebin URL (if present)
        if (importURL.includes('pastebinId=')) {
          importURL = importURL.substring(importURL.indexOf('pastebinId=') + 11)

          if (importURL.includes('&')) {
            importURL = importURL.substring(0, importURL.indexOf('&'))
          }

          const scriptID = state.captionScript.nextID
          dispatch(
            setCaptionScript(
              newCaptionScript({
                id: scriptID,
                url: 'https://hastebin.com/raw/' + importURL
              })
            )
          )
          dispatch(
            setSceneAddScriptPlaylist({
              id: sceneID,
              value: {
                scripts: [scriptID],
                shuffle: false,
                repeat: RP.none
              }
            })
          )
        }
      }
    }

    if (type === 'tutorial') {
      const nextTagID = state.tag.nextID
      const cuteTag = newTag({ id: nextTagID, name: 'Cute' })
      const animalTag = newTag({ id: nextTagID + 1, name: 'Animals' })
      dispatch(setTag(cuteTag))
      dispatch(setTag(animalTag))

      const source = newLibrarySource({
        id: state.librarySource.nextID,
        url: 'https://imgur.com/a/mMslVXT',
        tags: [cuteTag.id, animalTag.id],
        count: 100
      })

      dispatch(setLibrarySource(source))
      dispatch(setSceneAddSource({ id: sceneID as number, value: source.id }))
    } else if (type === AF.library) {
      dispatch(openLibraryImport())
    } else {
      let newSources: string[] | undefined
      switch (type) {
        case AF.url:
          if (!args || args.length !== 1) {
            newSources = ['']
          } else {
            newSources = args[0]
          }
          break
        case AF.list:
          newSources = Array.from(
            (args[0] as string).trim().split('\n')
          ).filter((s: string) => s.length > 0)
          break
        case AF.directory:
          newSources = await flipflip().api.openDirectories()
          break
        case AF.videos:
          newSources = await flipflip().api.openVideos()
          break
        case AF.videoDir:
          newSources = await flipflip().api.loadVideoSources()
          break
        case GT.local:
          if (!args || args.length < 2) {
            return
          }
          let rootDir = args[1]
          if (!rootDir.endsWith(pathSep)) {
            rootDir += pathSep
          }

          newSources = getImportURLs(args[0], rootDir)
          break
        case GT.tumblr:
          if (!args || args.length < 1) {
            return
          }

          newSources = getImportURLs(args[0], pathSep)
          break
      }

      if (!newSources) return
      const state = getState()
      if (sceneID != null) {
        const originalSources = state.scene.entries[sceneID].sources.map(
          (id) => state.librarySource.entries[id]
        )
        const sources = getNewSources(originalSources, newSources, state)
        dispatch(setLibrarySources(sources))
        dispatch(
          setSceneAddSources({ id: sceneID, value: sources.map((s) => s.id) })
        )
        handleArgs(sceneID)
      } else {
        const originalSources = state.app.library.map(
          (id) => state.librarySource.entries[id]
        )
        const sources = getNewSources(originalSources, newSources, state)
        dispatch(setLibrarySources(sources))
        dispatch(addToLibrary(sources.map((s) => s.id)))
      }
    }
  }
}

export function deleteScene(sceneID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    dispatch(removeFromScenes([sceneID]))
    const state = getState()
    state.app.scenes
      .map((id) => state.scene.entries[id])
      .forEach((scene) => {
        if (scene.nextSceneID === sceneID) {
          scene.nextSceneID = 0
        }

        const nextSceneRandomsLength = scene.nextSceneRandoms.length
        scene.nextSceneRandoms = scene.nextSceneRandoms.filter(
          (id) => id !== sceneID
        )
        const overlaysLength = scene.overlays.length
        scene.overlays = scene.overlays
          .map((id) => state.overlay.entries[id])
          .filter((o) => o.sceneID !== sceneID)
          .map((o) => o.id)

        if (
          scene.nextSceneID === 0 ||
          scene.nextSceneRandoms.length < nextSceneRandomsLength ||
          scene.overlays.length < overlaysLength
        ) {
          dispatch(setScene(scene))
        }
      })

    state.app.grids
      .map((id) => state.sceneGrid.entries[id])
      .forEach((grid) => {
        let updated = false
        for (const row of grid.grid) {
          for (let cell of row) {
            if (cell.sceneID === sceneID) {
              cell = newSceneGridCell()
              updated = true
            }
          }
        }

        if (updated) {
          dispatch(setSceneGrid(grid))
        }
      })

    dispatch(setRoute([]))
    dispatch(setSpecialMode(undefined))
  }
}

export function exportScene(sceneID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const scenesToExport = Array<SceneStorage>()
    const gridsToExport = Array<SceneGridStorage>()
    const sceneCopy = toSceneStorage(sceneID, state)
    sceneCopy.generatorWeights = undefined
    sceneCopy.openTab = 3
    sceneCopy.overlays = sceneCopy.overlays.filter((o) => o.sceneID !== 0)
    scenesToExport.push(sceneCopy)

    // Add overlays
    if (sceneCopy.overlayEnabled) {
      for (const o of sceneCopy.overlays) {
        // If overlay is a grid, add grid scenes and their immediate overlays
        const gridID = convertSceneIDToGridID(o.sceneID)
        if (gridID != null) {
          const grid = toSceneGridStorage(gridID, state)
          if (grid && !gridsToExport.find((s) => s.id === gridID)) {
            gridsToExport.push(grid)
            for (const r of grid.grid) {
              for (const c of r) {
                if (c.sceneID !== -1) {
                  const cell = toSceneStorage(c.sceneID, state)
                  if (cell && !scenesToExport.find((s) => s.id === c.sceneID)) {
                    cell.generatorWeights = undefined
                    cell.openTab = 3
                    scenesToExport.push(cell)
                    if (cell.overlayEnabled) {
                      for (const co of cell.overlays) {
                        if (!isSceneIDAGridID(co.sceneID)) {
                          const overlay = toSceneStorage(co.sceneID, state)
                          if (
                            overlay &&
                            !scenesToExport.find((s) => s.id === co.sceneID)
                          ) {
                            overlay.generatorWeights = undefined
                            overlay.openTab = 3
                            overlay.overlays = []
                            scenesToExport.push(overlay)
                          }
                        }
                      }
                    } else {
                      cell.overlays = []
                    }
                  }
                }
              }
            }
          }
        } else {
          // Otherwise, just add the overlay
          const overlay = toSceneStorage(o.sceneID, state)
          if (
            overlay !== undefined &&
            !scenesToExport.find((s) => s.id === o.sceneID)
          ) {
            overlay.generatorWeights = undefined
            overlay.openTab = 3
            overlay.overlays = []
            scenesToExport.push(overlay)
          }
        }
      }
    } else {
      sceneCopy.overlays = []
    }

    const allExports = (scenesToExport as any[]).concat(gridsToExport)
    const sceneExport = JSON.stringify(allExports)
    const fileName = sceneCopy.name + '_export.json'
    flipflip().api.saveJsonFile(fileName, sceneExport)
  }
}

export function applyEffectsToScene(sceneID: number, effects: string) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const scene = getEntry(getState().scene, sceneID)
    dispatch(setScene(applyEffects(scene, effects)))
  }
}

export function cloneScene(sceneID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const sceneCopy = copy<Scene>(state.scene.entries[sceneID])
    sceneCopy.id = state.scene.nextID

    dispatch(setScene(sceneCopy))
    dispatch(addToScenes(sceneCopy.id))
    dispatch(setRoute([newRoute({ kind: 'scene', value: sceneCopy.id })]))
    dispatch(setSpecialMode(SP.autoEdit))
    dispatch(
      setSystemSnack({
        message: 'Clone successful!',
        severity: SS.success
      })
    )
  }
}

export function saveAsScene(sceneID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const sceneCopy = copy<Scene>(state.scene.entries[sceneID])
    sceneCopy.generatorWeights = undefined
    sceneCopy.id = state.scene.nextID
    sceneCopy.openTab = 3

    dispatch(setScene(sceneCopy))
    dispatch(addToScenes(sceneCopy.id))
    dispatch(setRoute([newRoute({ kind: 'scene', value: sceneCopy.id })]))
    dispatch(setSpecialMode(SP.autoEdit))
    dispatch(
      setSystemSnack({
        message: 'Save successful!',
        severity: SS.success
      })
    )
  }
}

export function resetScene(sceneID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const scene = getEntry(state.scene, sceneID) as Scene
    Object.keys(state.app.config.defaultScene)
      .filter((key) => key !== 'sources')
      .forEach(
        (property) =>
          (scene[property] = state.app.config.defaultScene[property])
      )

    dispatch(setScene(scene))
  }
}

export function setSceneSwapSources(oldSourceID: number, newSourceID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const scene = getActiveScene(state) as Scene
    const sources = [...scene.sources]
    const oldSourceIndex = sources.indexOf(oldSourceID)
    const newSourceIndex = sources.indexOf(newSourceID)
    arrayMove(sources, oldSourceIndex, newSourceIndex)
    dispatch(setSceneSources({ id: scene.id, value: sources }))
  }
}

export function setSceneSourcesRemoveOne(sourceID: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const scene = getActiveScene(state) as Scene
    dispatch(
      setSceneSources({
        id: scene.id,
        value: scene.sources.filter((id) => id !== sourceID)
      })
    )
  }
}

export function setVideoClipperSceneVideoVolume(videoVolume: number) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    const state = getState()
    const scene = getVideoClipperScene(state)
    dispatch(setSceneVideoVolume({ id: scene.id, value: videoVolume }))
  }
}
