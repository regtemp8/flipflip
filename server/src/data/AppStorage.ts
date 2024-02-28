import { promises, copyFileSync, existsSync, readFileSync } from 'fs'
import { getBackups, cleanBackups } from './Backup'
import { getContext, getPortablePath, getSavePath } from '../utils'
import {
  removeDuplicatesBy,
  defaultTheme,
  TT,
  initialAppStorage,
  newAudio,
  newCaptionScript,
  newConfig,
  newLibrarySource,
  newPlaylist,
  newRoute,
  type Scene,
  newScene,
  newSceneGrid,
  newSceneGroup,
  type Tag,
  newTag,
  type WeightGroup,
  type Route,
  type AppStorage as AppStorageData,
  LibrarySource,
  SceneGrid,
  SceneGroup,
  Audio,
  CaptionScript,
  Playlist
} from 'flipflip-common'

declare const PACKAGE_JSON_VERSION_WEBPACK_ENTRY: string

/**
 * Archives a file (if it exists) to same path appending '.{epoch now}'
 * to the file name
 * @param {string} filePath
 */
function archiveFile(filePath: string): void {
  if (existsSync(filePath)) {
    copyFileSync(filePath, filePath + '.' + Date.now())
  }
}

export default class AppStorage {
  appVersion: string
  initialState: AppStorageData = initialAppStorage

  constructor(windowId: number) {
    this.appVersion = PACKAGE_JSON_VERSION_WEBPACK_ENTRY
    this.initialState.version = this.appVersion
    const savePath = getSavePath()
    const portablePath = getPortablePath()
    try {
      const noData = {}
      let data: any = noData
      let portableMode = false
      const portablePathExists = existsSync(portablePath)
      const savePathExists = existsSync(savePath)
      if (portablePathExists) {
        data = JSON.parse(readFileSync(portablePath, 'utf-8'))
        if (data.config.generalSettings.portableMode === false) {
          data = savePathExists
            ? JSON.parse(readFileSync(savePath, 'utf-8'))
            : noData
        } else {
          portableMode = true
        }
      } else if (savePathExists) {
        data = JSON.parse(readFileSync(savePath, 'utf-8'))
        if (data.config.generalSettings.portableMode === true) {
          portableMode = true
          data = portablePathExists
            ? JSON.parse(readFileSync(portablePath, 'utf-8'))
            : noData
        }
      }

      if (
        (portableMode && existsSync(`${portablePath}.new`)) ||
        existsSync(`${savePath}.new`)
      ) {
        console.warn('FOUND OLD SAVE')
      }
      if (data === noData) {
        return
      }
      if (data.version !== this.appVersion) {
        // Preserve the existing file - so as not to destroy user's data
        archiveFile(portableMode ? portablePath : savePath)
      }

      switch (data.version) {
        // When no version number found in data.json -- assume pre-v2.0.0 format
        // This should fail safe and self heal.
        case undefined: {
          // Create Library from aggregate of previous scenes' directories
          let sources = Array<string>()
          for (const scene of data.scenes) {
            sources = sources.concat(scene.directories)
          }
          sources = removeDuplicatesBy((s) => s, sources)
          // Create our initialState object
          this.initialState = {
            version: this.appVersion,
            specialMode: data.specialMode ?? null,
            openTab: data.openTab ?? 0,
            displayedSources: [],
            config: newConfig(data.config),
            scenes: [],
            sceneGroups: [],
            grids: [],
            audios: [],
            scripts: [],
            playlists: [],
            library: [],
            tags: [],
            route: data.route.map((s: Partial<Route>) => newRoute(s)),
            libraryYOffset: 0,
            libraryFilters: [],
            librarySelected: [],
            audioOpenTab: data.audioOpenTab ?? 3,
            audioYOffset: 0,
            audioFilters: [],
            audioSelected: [],
            scriptYOffset: 0,
            scriptFilters: [],
            scriptSelected: [],
            progressMode: null,
            progressTitle: null,
            progressCurrent: 0,
            progressTotal: 0,
            progressNext: null,
            systemMessage: null,
            systemSnackOpen: false,
            systemSnack: null,
            systemSnackSeverity: null,
            tutorial: null,
            theme: defaultTheme
          }
          // Hydrate and add the library ! Yay!!! :)
          let libraryID = 0
          const newLibrarySources = []
          for (const url of sources) {
            newLibrarySources.push(
              newLibrarySource({
                url,
                id: libraryID,
                tags: []
              })
            )
            libraryID += 1
          }
          this.initialState.library = newLibrarySources
          // Convert and add old scenes
          const context = getContext()
          const newScenes = []
          for (const oldScene of data.scenes) {
            const scene = newScene(context, oldScene)
            let sourceID = 0
            const newSources = []
            for (const oldDirectory of oldScene.directories) {
              newSources.push(
                newLibrarySource({
                  url: oldDirectory,
                  id: sourceID,
                  tags: []
                })
              )
              sourceID += 1
            }
            scene.sources = newSources
            newScenes.push(scene)
          }
          this.initialState.scenes = newScenes
          break
        }
        case '2.0.0':
        case '2.1.0':
        case '2.1.1':
        case '2.2.0':
        case '2.2.1':
        case '2.3.0':
        case '2.3.1':
        case '2.3.2':
        case '3.0.0-beta1':
        case '3.0.0-beta2': {
          const context = getContext()
          this.initialState = {
            version: this.appVersion,
            specialMode: data.specialMode,
            openTab: 0,
            displayedSources: [],
            config: newConfig(data.config),
            scenes: data.scenes.map((s: Partial<Scene>) =>
              newScene(context, s)
            ),
            sceneGroups: [],
            grids: [],
            audios: [],
            scripts: [],
            playlists: [],
            library: data.library.map((s: Partial<LibrarySource>) =>
              newLibrarySource(s)
            ),
            tags: data.tags.map((t: Partial<Tag>) => newTag(t)),
            route: [],
            libraryYOffset: 0,
            libraryFilters: [],
            librarySelected: [],
            audioOpenTab: 3,
            audioYOffset: 0,
            audioFilters: [],
            audioSelected: [],
            scriptYOffset: 0,
            scriptFilters: [],
            scriptSelected: [],
            progressMode: null,
            progressTitle: null,
            progressCurrent: 0,
            progressTotal: 0,
            progressNext: null,
            systemMessage: null,
            systemSnackOpen: false,
            systemSnack: null,
            systemSnackSeverity: null,
            tutorial: null,
            theme: defaultTheme
          }

          // Port to new generator format
          for (const scene of this.initialState.scenes) {
            // If this is a generator scene
            if (scene.tagWeights != null || scene.sceneWeights != null) {
              scene.generatorWeights = []
              // Get weights for this scene
              const tagWeights = new Map<Tag, { type: string; value: number }>(
                JSON.parse(scene.tagWeights)
              )
              let sceneWeights = new Map<
                number,
                { type: string; value: number }
              >()
              if (scene.sceneWeights !== null) {
                sceneWeights = new Map<number, { type: string; value: number }>(
                  JSON.parse(scene.sceneWeights)
                )
              }
              const weights = Array.from(tagWeights.values()).concat(
                Array.from(sceneWeights.values())
              )
              const sum =
                weights.length > 0
                  ? weights
                      .map((w) => w.value)
                      .reduce((total, value) => Number(total) + Number(value))
                  : 0

              // For each tag weight
              for (const [tag, weight] of tagWeights.entries()) {
                // If this is relevant
                if (weight.type !== TT.weight || weight.value > 0) {
                  // Add as weight group
                  const wg: WeightGroup = {
                    percent:
                      weight.value > 0
                        ? Math.round((weight.value / sum) * 100)
                        : 0,
                    type: weight.type,
                    search: '[' + tag.name + ']'
                  }

                  scene.generatorWeights.push(wg)
                }
              }

              // For each scene weight
              for (const [sceneID, weight] of sceneWeights.entries()) {
                // If this is relevant
                if (weight.value > 0) {
                  const wg: WeightGroup = {
                    percent: Math.round((weight.value / sum) * 100),
                    type: TT.weight
                  }

                  // Build a set of rules from this scene's weights
                  const tagScene = this.initialState.scenes.find(
                    (s: Scene) => s.id === sceneID
                  )
                  if (tagScene.tagWeights != null) {
                    const tagWeights = new Map<
                      Tag,
                      { type: string; value: number }
                    >(JSON.parse(tagScene.tagWeights))
                    const weights = Array.from(tagWeights.values())
                    const swSum =
                      weights.length > 0
                        ? weights
                            .map((w) => w.value)
                            .reduce(
                              (total, value) => Number(total) + Number(value)
                            )
                        : 0
                    const rules = new Array<WeightGroup>()

                    // For each tag weight
                    for (const [tag, weight] of tagWeights.entries()) {
                      // If this is relevant
                      if (weight.type !== TT.weight || weight.value > 0) {
                        // Add as weight group
                        const rule: WeightGroup = {
                          percent:
                            weight.value > 0
                              ? Math.round((weight.value / swSum) * 100)
                              : 0,
                          type: weight.type,
                          search: '[' + tag.name + ']'
                        }

                        rules.push(rule)
                      }
                    }

                    // Ensure weights are valid
                    let remaining = 100
                    for (const rule of rules) {
                      if (rule.type === TT.weight) {
                        remaining = remaining - (rule.percent ?? 0)
                      }
                    }
                    if (remaining !== 0 && remaining !== 100) {
                      rules[0].percent = (rules[0].percent ?? 0) + remaining
                    }

                    // Add rules
                    wg.rules = rules
                    scene.generatorWeights.push(wg)
                  }
                }
              }

              // Ensure weights are valid
              let remaining = 100
              for (const wg of scene.generatorWeights) {
                if (wg.type === TT.weight) {
                  remaining = remaining - wg.percent
                }
              }
              if (remaining !== 0 && remaining !== 100) {
                for (const wg of scene.generatorWeights) {
                  if (wg.type === TT.weight) {
                    wg.percent = wg.percent + remaining
                    break
                  }
                }
              }

              scene.tagWeights = null
              scene.sceneWeights = null
            }
          }

          for (let i = 0; i < this.initialState.library.length; i++) {
            this.initialState.library[i].id = i
          }
          break
        }
        case '3.0.0-beta3':
        case '3.0.0':
        case '3.0.1':
        case '3.0.3':
        case '3.0.4':
        case '3.0.5':
        case '3.0.6':
        case '3.0.7':
        case '3.1.0-beta1':
        case '3.1.0-beta2':
        case '3.1.0':
        case '3.1.1':
        case '3.1.2':
        case '3.1.3':
        case '3.1.4':
        case '3.2.0':
        case '3.2.1': {
          const context = getContext()
          this.initialState = {
            version: this.appVersion,
            specialMode: data.specialMode,
            openTab: data.openTab,
            displayedSources: [],
            config: newConfig(data.config),
            scenes: data.scenes.map((s: Partial<Scene>) =>
              newScene(context, s)
            ),
            sceneGroups:
              data.sceneGroups != null
                ? data.sceneGroups.map((g: Partial<SceneGroup>) =>
                    newSceneGroup(g)
                  )
                : [],
            grids: data.grids.map((g: Partial<SceneGrid>) => newSceneGrid(g)),
            audios:
              data.audios != null
                ? data.audios.map((a: Partial<Audio>) => newAudio(a))
                : [],
            scripts:
              data.scripts != null
                ? data.scripts.map((s: Partial<CaptionScript>) =>
                    newCaptionScript(s)
                  )
                : [],
            playlists:
              data.playlists != null
                ? data.playlists.map((p: Partial<Playlist>) => newPlaylist(p))
                : [],
            library: data.library.map((s: Partial<LibrarySource>) =>
              newLibrarySource(s)
            ),
            tags: data.tags.map((t: Partial<Tag>) => newTag(t)),
            route: data.route.map((s: Partial<Route>) => newRoute(s)),
            libraryYOffset: 0,
            libraryFilters: Array<string>(),
            librarySelected: Array<string>(),
            audioOpenTab: data.audioOpenTab ?? 3,
            audioYOffset: 0,
            audioFilters: Array<string>(),
            audioSelected: Array<string>(),
            scriptYOffset: 0,
            scriptFilters: Array<string>(),
            scriptSelected: Array<string>(),
            progressMode: null,
            progressTitle: null,
            progressCurrent: 0,
            progressTotal: 0,
            progressNext: null,
            systemMessage: null,
            systemSnackOpen: false,
            systemSnack: null,
            systemSnackSeverity: null,
            tutorial: data.tutorial,
            theme: data.theme
          }
          if (
            this.initialState.theme.palette.mode == null &&
            this.initialState.theme.palette.type != null
          ) {
            this.initialState.theme.palette.mode =
              this.initialState.theme.palette.type
          }
          // Multiply all nextSceneTime
          for (const scene of this.initialState.scenes) {
            scene.nextSceneTime = scene.nextSceneTime * 1000
          }
          this.initialState.config.defaultScene.nextSceneTime =
            this.initialState.config.defaultScene.nextSceneTime * 1000
          break
        }
        default: {
          const context = getContext()
          this.initialState = {
            version: this.appVersion,
            specialMode: data.specialMode,
            openTab: data.openTab,
            displayedSources: [],
            config: newConfig(data.config),
            scenes: data.scenes.map((s: Partial<Scene>) =>
              newScene(context, s)
            ),
            sceneGroups:
              data.sceneGroups != null
                ? data.sceneGroups.map((g: Partial<SceneGroup>) =>
                    newSceneGroup(g)
                  )
                : [],
            grids: data.grids.map((g: Partial<SceneGrid>) => newSceneGrid(g)),
            audios:
              data.audios != null
                ? data.audios.map((a: Partial<Audio>) => newAudio(a))
                : [],
            scripts:
              data.scripts != null
                ? data.scripts.map((s: Partial<CaptionScript>) =>
                    newCaptionScript(s)
                  )
                : [],
            playlists:
              data.playlists != null
                ? data.playlists.map((p: Partial<Playlist>) => newPlaylist(p))
                : [],
            library: data.library.map((s: Partial<LibrarySource>) =>
              newLibrarySource(s)
            ),
            tags: data.tags.map((t: Partial<Tag>) => newTag(t)),
            route: data.route.map((s: Partial<Route>) => newRoute(s)),
            libraryYOffset: 0,
            libraryFilters: Array<string>(),
            librarySelected: Array<string>(),
            audioOpenTab: data.audioOpenTab ?? 3,
            audioYOffset: 0,
            audioFilters: Array<string>(),
            audioSelected: Array<string>(),
            scriptYOffset: 0,
            scriptFilters: Array<string>(),
            scriptSelected: Array<string>(),
            progressMode: null,
            progressTitle: null,
            progressCurrent: 0,
            progressTotal: 0,
            progressNext: null,
            systemMessage: null,
            systemSnackOpen: false,
            systemSnack: null,
            systemSnackSeverity: null,
            tutorial: data.tutorial,
            theme: data.theme
          }
          break
        }
      }
    } catch (e) {
      // When an error occurs archive potentially incompatible data.json file
      // This essentially renames the data.json file and thus the app is self-healing
      // in that it will recreate an initial (blank) data.json file on restarting
      // - The archived file being available for investigation.
      console.error(e)
      archiveFile(savePath)
    }

    if (windowId === 1) {
      if (this.initialState.config.generalSettings.portableMode === true) {
        console.log('Saving to', portablePath)
        if (
          this.initialState.config.generalSettings.disableLocalSave === true
        ) {
          return
        }
      }
      console.log('Saving to', savePath)
    }
  }

  async writeFileTransactional(
    path: string,
    content: string
  ): Promise<boolean> {
    const temporaryPath = `${path}.new`
    try {
      await promises.writeFile(temporaryPath, content)
      await promises.rename(temporaryPath, path)
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  async save(
    state: Partial<AppStorageData>,
    quickSave: boolean
  ): Promise<boolean> {
    let saved = false
    if (state.config.generalSettings.portableMode === true) {
      saved = await this.writeFileTransactional(
        getPortablePath(),
        JSON.stringify(state)
      )
      if (state.config.generalSettings.disableLocalSave === false) {
        // TODO what if portableMode and disableLocalSave and portableMode succeeds but disableLocalSave fails?
        saved = await this.writeFileTransactional(
          getSavePath(),
          JSON.stringify(state)
        )
      }
    } else {
      saved = await this.writeFileTransactional(
        getSavePath(),
        JSON.stringify(state)
      )
    }

    if (quickSave) return saved

    if (state.config.generalSettings.autoCleanBackup === true) {
      this.checkAutoClean(state)
        .then((r) => {
          if (r) console.log('Performed Auto Clean')
        })
        .catch((e) => {
          console.error(e)
        })
    }

    if (state.config.generalSettings.autoBackup === true) {
      this.checkAutoBackup(state)
        .then((r) => {
          if (r) console.log('Performed Auto Backup')
        })
        .catch((e) => {
          console.error(e)
        })
    }

    return saved
  }

  backup(state: Partial<AppStorageData>): void {
    if (state.config.generalSettings.portableMode === true) {
      archiveFile(getPortablePath())
      if (state.config.generalSettings.disableLocalSave === false) {
        archiveFile(getSavePath())
      }
    } else {
      archiveFile(getSavePath())
    }
  }

  async checkAutoClean(state: Partial<AppStorageData>): Promise<boolean> {
    return await new Promise((resolve) => {
      const backups = getBackups()
      let lastBackup
      let epoch
      do {
        lastBackup = backups.shift()
        epoch =
          lastBackup != null
            ? parseInt(
                lastBackup.url.substring(lastBackup.url.lastIndexOf('.') + 1)
              )
            : NaN
      } while (isNaN(epoch))
      // If it's been longer than N days since our last backup
      if (
        Date.now() - epoch >
        86400000 * state.config.generalSettings.autoBackupDays
      ) {
        cleanBackups(state.config)
        resolve(true)
      }
      resolve(false)
    })
  }

  async checkAutoBackup(state: Partial<AppStorageData>): Promise<boolean> {
    return await new Promise((resolve) => {
      const backups = getBackups()
      if (backups.length === 0) {
        this.backup(state)
        resolve(true)
      } else {
        let lastBackup
        let epoch
        do {
          lastBackup = backups.shift()
          epoch =
            lastBackup != null
              ? parseInt(
                  lastBackup.url.substring(lastBackup.url.lastIndexOf('.') + 1)
                )
              : NaN
        } while (isNaN(epoch))
        // If it's been longer than N days since our last backup
        if (
          Date.now() - epoch >
          86400000 * state.config.generalSettings.autoBackupDays
        ) {
          this.backup(state)
          resolve(true)
        }
      }
      resolve(false)
    })
  }
}
