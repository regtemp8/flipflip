import {
  copy,
  type AppStorage,
  type Clip as ClipStorage,
  type Config as ConfigStorage,
  type SceneSettings as SceneSettingsStorage,
  type SceneGroup as SceneGroupStorage,
  type Scene as SceneStorage,
  type SceneGrid as SceneGridStorage,
  type LibrarySource as LibrarySourceStorage,
  type Audio as AudioStorage,
  type CaptionScript as CaptionScriptStorage,
  type Playlist as PlaylistStorage,
  type Tag as TagStorage,
  type Overlay as OverlayStorage,
  type AudioPlaylist as AudioPlaylistStorage,
  type DisplayPlaylist as DisplayPlaylistStorage,
  type ScenePlaylist as ScenePlaylistStorage,
  type ScriptPlaylist as ScriptPlaylistStorage,
  type Route as RouteStorage,
  type DisplaySettings as DisplaySettingsStorage,
  type ServerSettings as ServerSettingsStorage,
  type Display as DisplayStorage,
  type DisplayView as DisplayViewStorage,
  PLT,
  SG,
  MVF
} from 'flipflip-common'

import { type RootState } from '../store'
import { type EntryState, type Identifiable } from '../EntryState'
import {
  type AppStorageImport,
  initialAppStorageImport
} from '../AppStorageImport'
import { newApp } from './data/App'
import type Config from './data/Config'
import { newConfig } from './data/Config'
import type SceneSettings from './data/SceneSettings'
import type Audio from '../audio/Audio'
import { newAudio } from '../audio/Audio'
import type Tag from '../tag/Tag'
import { newTag } from '../tag/Tag'
import type CaptionScript from '../captionScript/CaptionScript'
import { newCaptionScript } from '../captionScript/CaptionScript'
import type Clip from '../clip/Clip'
import { newClip } from '../clip/Clip'
import type LibrarySource from '../librarySource/LibrarySource'
import { newLibrarySource } from '../librarySource/LibrarySource'
import type Overlay from '../overlay/Overlay'
import { newOverlay } from '../overlay/Overlay'
import type Playlist from '../playlist/Playlist'
import { newPlaylist } from '../playlist/Playlist'
import type Scene from '../scene/Scene'
import { newScene } from '../scene/Scene'
import type SceneGrid from '../sceneGrid/SceneGrid'
import { newSceneGrid } from '../sceneGrid/SceneGrid'
import type SceneGroup from '../sceneGroup/SceneGroup'
import { newSceneGroup } from '../sceneGroup/SceneGroup'
import { newRoute } from './data/Route'
import DisplaySettings from './data/DisplaySettings'
import ServerSettings, { initialServerSettings } from './data/ServerSettings'
import Display, { newDisplay } from '../display/Display'
import View, { newView } from '../displayView/View'
import {
  convertSceneIDToGridID,
  getRandomColor,
  isSceneIDAGridID
} from '../../data/utils'
import { ScenePlaylistItem } from '../scenePlaylistItem/ScenePlaylistItem'
import { DisplayPlaylistItem } from '../displayPlaylistItem/DisplayPlaylistItem'

export function toAppStorage(state: RootState): AppStorage {
  return {
    ...state.app,
    theme: state.app.theme as any,
    audioSelected: state.app.audioSelected
      .map((id) => state.audio.entries[id].url || '')
      .filter((url) => url !== ''),
    librarySelected: state.app.librarySelected
      .map((id) => state.librarySource.entries[id].url || '')
      .filter((url) => url !== ''),
    scriptSelected: state.app.scriptSelected
      .map((id) => state.captionScript.entries[id].url || '')
      .filter((url) => url !== ''),
    config: toConfigStorage(state.app.config, state),
    sceneGroups: state.app.sceneGroups
      .map((id) => toSceneGroupStorage(id, state))
      .filter((s) => s != null)
      .map((s) => s as SceneGroup),
    scenes: state.app.scenes.map((id) => toSceneStorage(id, state)),
    grids: state.app.grids.map((id) => toSceneGridStorage(id, state)),
    library: state.app.library.map((id) => toLibrarySourceStorage(id, state)),
    audios: state.app.audios.map((id) => toAudioStorage(id, state)),
    scripts: state.app.scripts.map((id) => toCaptionScriptStorage(id, state)),
    playlists: state.app.playlists
      .filter((id) => state.playlist.entries[id].type === PLT.audio)
      .map((id) => toPlaylistStorage(id, state)),
    tags: state.app.tags.map((id) => toTagStorage(id, state)),
    displayedSources: state.app.displayedSources.map((id) =>
      toLibrarySourceStorage(id, state)
    )
  }
}

export function toConfigStorage(
  config: Config,
  state: RootState
): ConfigStorage {
  return {
    ...config,
    displaySettings: {
      ...config.displaySettings,
      alwaysOnTop: false,
      showMenu: true
    },
    serverSettings: {
      host: config.serverSettings.host,
      port: config.serverSettings.port
    },
    defaultScene: toSceneSettingsStorage(config.defaultScene, state)
  }
}

function toSceneSettingsStorage(
  sceneSettings: SceneSettings,
  state: RootState
): SceneSettingsStorage {
  return {
    ...sceneSettings,
    sources: sceneSettings.sources.map((id) =>
      toLibrarySourceStorage(id, state)
    ),
    overlays: sceneSettings.overlays.map((id) => toOverlayStorage(id, state)),
    // only used for migrations
    overlaySceneID: 0,
    overlaySceneOpacity: 0,
    gridView: false,
    grid: [],
    audios: [],
    rotatePortrait: false
  }
}

function toSceneGroupStorage(
  id: number,
  state: RootState
): SceneGroupStorage | undefined {
  const group = state.sceneGroup.entries[id]
  if (group.type === SG.display) {
    // TODO save displays
    return undefined
  } else if (group.type === SG.playlist) {
    // TODO save display and scene playlists
    return {
      ...group,
      scenes: group.scenes.filter((id) => {
        const type = state.playlist.entries[id].type
        return type === PLT.audio || type === PLT.script
      })
    }
  } else {
    return group
  }
}

export function toSceneStorage(id: number, state: RootState): SceneStorage {
  const scene = state.scene.entries[id]
  return {
    ...scene,
    sources: scene.sources.map((id) => toLibrarySourceStorage(id, state)),
    overlays: scene.overlays.map((id) => toOverlayStorage(id, state)),
    audioPlaylists: scene.audioPlaylists
      .map((id) => toAudioPlaylistStorage(id, state))
      .filter((playlist) => playlist != null)
      .map((playlist) => playlist as AudioPlaylistStorage),
    scriptPlaylists: scene.scriptPlaylists
      .map((id) => toScriptPlaylistStorage(id, state))
      .filter((playlist) => playlist != null)
      .map((playlist) => playlist as ScriptPlaylistStorage)
  }
}

function toOverlayStorage(id: number, state: RootState): OverlayStorage {
  return state.overlay.entries[id]
}

export function toAudioPlaylistStorage(
  id: number,
  state: RootState
): AudioPlaylistStorage | undefined {
  const playlist = state.playlist.entries[id]
  return playlist != null
    ? {
        shuffle: playlist.shuffle,
        repeat: playlist.repeat,
        name: playlist.name,
        audios: playlist.items.map((id) => toAudioStorage(id, state))
      }
    : undefined
}

export function toDisplayPlaylistStorage(
  id: number,
  state: RootState
): DisplayPlaylistStorage | undefined {
  const playlist = state.playlist.entries[id]
  return playlist != null
    ? {
        shuffle: playlist.shuffle,
        repeat: playlist.repeat,
        name: playlist.name,
        displays: playlist.items.map((id) => toDisplayStorage(id, state))
      }
    : undefined
}

export function toScenePlaylistStorage(
  id: number,
  state: RootState
): ScenePlaylistStorage | undefined {
  const playlist = state.playlist.entries[id]
  return playlist != null
    ? {
        shuffle: playlist.shuffle,
        repeat: playlist.repeat,
        name: playlist.name,
        scenes: playlist.items.map((id) => toSceneStorage(id, state))
      }
    : undefined
}

export function toScriptPlaylistStorage(
  id: number,
  state: RootState
): ScriptPlaylistStorage | undefined {
  const playlist = state.playlist.entries[id]
  return playlist != null
    ? {
        shuffle: playlist.shuffle,
        repeat: playlist.repeat,
        name: playlist.name,
        scripts: playlist.items.map((id) => toCaptionScriptStorage(id, state))
      }
    : undefined
}

export function toSceneGridStorage(
  id: number,
  state: RootState
): SceneGridStorage {
  return state.sceneGrid.entries[id]
}

export function toLibrarySourceStorage(
  id: number,
  state: RootState | AppStorageImport
): LibrarySourceStorage {
  const source = state.librarySource.entries[id]
  return {
    ...source,
    lastCheck:
      source.lastCheck != null ? new Date(source.lastCheck).toString() : '',
    tags: source.tags.map((id) => toTagStorage(id, state)),
    clips: source.clips.map((id) => toClipStorage(id, state))
  }
}

function toClipStorage(
  id: number,
  state: RootState | AppStorageImport
): ClipStorage {
  const clip = state.clip.entries[id]
  return {
    ...clip,
    tags: clip.tags.map((id) => toTagStorage(id, state))
  }
}

function toAudioStorage(id: number, state: RootState): AudioStorage {
  const audio = state.audio.entries[id]
  return {
    ...audio,
    tags: audio.tags.map((id) => toTagStorage(id, state))
  }
}

function toCaptionScriptStorage(
  id: number,
  state: RootState
): CaptionScriptStorage {
  const script = state.captionScript.entries[id]
  return {
    ...script,
    tags: script.tags.map((id) => toTagStorage(id, state))
  }
}

function toPlaylistStorage(id: number, state: RootState): PlaylistStorage {
  const { name, items } = state.playlist.entries[id]
  return { id, name, audios: items }
}

function toTagStorage(
  id: number,
  state: RootState | AppStorageImport
): TagStorage {
  return state.tag.entries[id]
}

export function toDisplayStorage(id: number, state: RootState): DisplayStorage {
  const display = state.display.entries[id]
  return {
    ...display,
    views: display.views.map((id) => toDisplayViewStorage(id, state))
  }
}

export function toDisplayViewStorage(
  id: number,
  state: RootState
): DisplayViewStorage {
  const view = state.displayView.entries[id]
  return { ...view }
}

export function fromDisplayStorage(
  s: DisplayStorage,
  displaySlice: EntryState<Display>,
  displayViewSlice: EntryState<View>
): number {
  const mapper = (f: DisplayStorage): Display => {
    return newDisplay({
      id: f.id,
      name: f.name,
      views: f.views.map((s) => fromDisplayViewStorage(s, displayViewSlice)),
      selectedView: f.selectedView,
      displayViewsListYOffset: f.displayViewsListYOffset
    })
  }

  return from<DisplayStorage, Display>(s, displaySlice, mapper)
}

function fromDisplayViewStorage(
  s: DisplayViewStorage,
  displayViewSlice: EntryState<View>
): number {
  const mapper = (f: DisplayViewStorage): View => newView(f as View)
  return from<DisplayViewStorage, View>(s, displayViewSlice, mapper)
}

export function fromAppStorage(appStorage: AppStorage): AppStorageImport {
  const slice = copy<AppStorageImport>(initialAppStorageImport)
  const getSelected = (
    selected: string[],
    slice: EntryState<LibrarySource | Audio | CaptionScript>
  ): number[] => {
    const urls = new Map<string, number>()
    Object.values(slice.entries).forEach((s) => urls.set(s.url as string, s.id))
    return selected.map((s) => urls.get(s) || -1).filter((id) => id !== -1)
  }

  const library = appStorage.library.map((s) =>
    fromLibrarySourceStorage(s, slice.librarySource, slice.tag, slice.clip)
  )
  const librarySelected = getSelected(
    appStorage.librarySelected,
    slice.librarySource
  )
  const audios = appStorage.audios.map((s) =>
    fromAudioStorage(s, slice.audio, slice.tag)
  )
  const audioSelected = getSelected(appStorage.audioSelected, slice.audio)
  const scripts = appStorage.scripts.map((s) =>
    fromCaptionScriptStorage(s, slice.captionScript, slice.tag)
  )
  const scriptSelected = getSelected(
    appStorage.scriptSelected,
    slice.captionScript
  )

  appStorage.playlists.map((s) => fromPlaylistStorage(s, slice.playlist))
  slice.app = newApp({
    ...appStorage,
    config: fromConfigStorage(
      appStorage.config,
      slice.librarySource,
      slice.tag,
      slice.clip,
      slice.overlay
    ),
    sceneGroups: appStorage.sceneGroups.map((s) =>
      fromSceneGroupStorage(s, slice.sceneGroup)
    ),
    scenes: appStorage.scenes.map((s) =>
      fromSceneStorage(
        s,
        slice.scene,
        slice.librarySource,
        slice.tag,
        slice.clip,
        slice.overlay,
        slice.playlist,
        slice.audio,
        slice.captionScript
      )
    ),
    grids: appStorage.grids.map((s) =>
      fromSceneGridStorage(s, slice.sceneGrid)
    ),
    library,
    audios,
    scripts,
    playlists: [],
    tags: appStorage.tags.map((s) => fromTagStorage(s, slice.tag)),
    route: appStorage.route.map((s) => fromRouteStorage(s)),
    displayedSources: appStorage.displayedSources
      .map((s) => s.id)
      .filter((id) => library.includes(id)),
    librarySelected,
    audioSelected,
    scriptSelected
  })

  if (slice.app.route.length > 0) {
    const lastRoute = slice.app.route[slice.app.route.length - 1]
    if (['play', 'libraryplay', 'gridplay'].includes(lastRoute.kind)) {
      slice.app.route.pop()
    }
  }

  convertScenesToDisplays(
    slice.display,
    slice.displayView,
    slice.playlist,
    slice.scene,
    slice.sceneGrid,
    slice.scenePlaylistItem,
    slice.overlay,
    slice.displayPlaylistItem
  )
  slice.app.displays = convertSceneGridsToDisplays(
    slice.display,
    slice.displayView,
    slice.playlist,
    slice.scene,
    slice.sceneGrid,
    slice.scenePlaylistItem,
    slice.overlay
  )
  slice.app.playlists = Object.keys(slice.playlist.entries).map((id) =>
    Number(id)
  )
  return slice
}

function fromConfigStorage(
  s: ConfigStorage,
  librarySourceSlice: EntryState<LibrarySource>,
  tagSlice: EntryState<Tag>,
  clipSlice: EntryState<Clip>,
  overlaySlice: EntryState<Overlay>
) {
  return newConfig({
    defaultScene: fromSceneSettingsStorage(
      s.defaultScene,
      librarySourceSlice,
      tagSlice,
      clipSlice,
      overlaySlice
    ),
    remoteSettings: { ...s.remoteSettings },
    serverSettings: fromServerSettings(s.serverSettings),
    caching: { ...s.caching },
    displaySettings: fromDisplaySettings(s.displaySettings),
    generalSettings: { ...s.generalSettings },
    tutorials: { ...s.tutorials },
    clientID: s.clientID,
    newWindowAlerted: s.newWindowAlerted
  })
}

function fromSceneSettingsStorage(
  s: SceneSettingsStorage,
  librarySourceSlice: EntryState<LibrarySource>,
  tagSlice: EntryState<Tag>,
  clipSlice: EntryState<Clip>,
  overlaySlice: EntryState<Overlay>
) {
  return {
    sources: s.sources.map((s) =>
      fromLibrarySourceStorage(s, librarySourceSlice, tagSlice, clipSlice)
    ),
    timingFunction: s.timingFunction,

    timingConstant: s.timingConstant,
    timingMin: s.timingMin,
    timingMax: s.timingMax,
    timingSinRate: s.timingSinRate,
    timingBPMMulti: s.timingBPMMulti,
    backForth: s.backForth,
    backForthTF: s.backForthTF,
    backForthConstant: s.backForthConstant,
    backForthMin: s.backForthMin,
    backForthMax: s.backForthMax,
    backForthSinRate: s.backForthSinRate,
    backForthBPMMulti: s.backForthBPMMulti,
    imageTypeFilter: s.imageTypeFilter,
    weightFunction: s.weightFunction,
    sourceOrderFunction: s.sourceOrderFunction,
    orderFunction: s.orderFunction,
    forceAll: s.forceAll,
    forceAllSource: s.forceAllSource,
    fullSource: s.fullSource,
    regenerate: s.regenerate,
    zoom: s.zoom,
    zoomStart: s.zoomStart,
    zoomStartMax: s.zoomStartMax,
    zoomStartMin: s.zoomStartMin,
    zoomEnd: s.zoomEnd,
    zoomEndMax: s.zoomEndMax,
    zoomEndMin: s.zoomEndMin,
    zoomRandom: s.zoomRandom,
    horizTransType: s.horizTransType,
    horizTransLevel: s.horizTransLevel,
    horizTransLevelMax: s.horizTransLevelMax,
    horizTransLevelMin: s.horizTransLevelMin,
    horizTransRandom: s.horizTransRandom,
    vertTransType: s.vertTransType,
    vertTransLevel: s.vertTransLevel,
    vertTransLevelMax: s.vertTransLevelMax,
    vertTransLevelMin: s.vertTransLevelMin,
    vertTransRandom: s.vertTransRandom,
    transTF: s.transTF,
    transDuration: s.transDuration,
    transDurationMin: s.transDurationMin,
    transDurationMax: s.transDurationMax,
    transSinRate: s.transSinRate,
    transBPMMulti: s.transBPMMulti,
    transEase: s.transEase,
    transExp: s.transExp,
    transAmp: s.transAmp,
    transPer: s.transPer,
    transOv: s.transOv,
    crossFade: s.crossFade,
    crossFadeAudio: s.crossFadeAudio,
    fadeTF: s.fadeTF,
    fadeDuration: s.fadeDuration,
    fadeDurationMin: s.fadeDurationMin,
    fadeDurationMax: s.fadeDurationMax,
    fadeSinRate: s.fadeSinRate,
    fadeBPMMulti: s.fadeBPMMulti,
    fadeEase: s.fadeEase,
    fadeExp: s.fadeExp,
    fadeAmp: s.fadeAmp,
    fadePer: s.fadePer,
    fadeOv: s.fadeOv,
    slide: s.slide,
    slideTF: s.slideTF,
    slideType: s.slideType,
    slideDistance: s.slideDistance,
    slideDuration: s.slideDuration,
    slideDurationMin: s.slideDurationMin,
    slideDurationMax: s.slideDurationMax,
    slideSinRate: s.slideSinRate,
    slideBPMMulti: s.slideBPMMulti,
    slideEase: s.slideEase,
    slideExp: s.slideExp,
    slideAmp: s.slideAmp,
    slidePer: s.slidePer,
    slideOv: s.slideOv,
    fadeInOut: s.fadeInOut,
    fadeIOPulse: s.fadeIOPulse,
    fadeIOTF: s.fadeIOTF,
    fadeIODuration: s.fadeIODuration,
    fadeIODurationMin: s.fadeIODurationMin,
    fadeIODurationMax: s.fadeIODurationMax,
    fadeIOSinRate: s.fadeIOSinRate,
    fadeIOBPMMulti: s.fadeIOBPMMulti,
    fadeIODelayTF: s.fadeIODelayTF,
    fadeIODelay: s.fadeIODelay,
    fadeIODelayMin: s.fadeIODelayMin,
    fadeIODelayMax: s.fadeIODelayMax,
    fadeIODelaySinRate: s.fadeIODelaySinRate,
    fadeIODelayBPMMulti: s.fadeIODelayBPMMulti,
    fadeIOStartEase: s.fadeIOStartEase,
    fadeIOStartExp: s.fadeIOStartExp,
    fadeIOStartAmp: s.fadeIOStartAmp,
    fadeIOStartPer: s.fadeIOStartPer,
    fadeIOStartOv: s.fadeIOStartOv,
    fadeIOEndEase: s.fadeIOEndEase,
    fadeIOEndExp: s.fadeIOEndExp,
    fadeIOEndAmp: s.fadeIOEndAmp,
    fadeIOEndPer: s.fadeIOEndPer,
    fadeIOEndOv: s.fadeIOEndOv,
    panning: s.panning,
    panTF: s.panTF,
    panDuration: s.panDuration,
    panDurationMin: s.panDurationMin,
    panDurationMax: s.panDurationMax,
    panSinRate: s.panSinRate,
    panBPMMulti: s.panBPMMulti,
    panHorizTransType: s.panHorizTransType,
    panHorizTransImg: s.panHorizTransImg,
    panHorizTransLevel: s.panHorizTransLevel,
    panHorizTransLevelMax: s.panHorizTransLevelMax,
    panHorizTransLevelMin: s.panHorizTransLevelMin,
    panHorizTransRandom: s.panHorizTransRandom,
    panVertTransType: s.panVertTransType,
    panVertTransImg: s.panVertTransImg,
    panVertTransLevel: s.panVertTransLevel,
    panVertTransLevelMax: s.panVertTransLevelMax,
    panVertTransLevelMin: s.panVertTransLevelMin,
    panVertTransRandom: s.panVertTransRandom,
    panStartEase: s.panStartEase,
    panStartExp: s.panStartExp,
    panStartAmp: s.panStartAmp,
    panStartPer: s.panStartPer,
    panStartOv: s.panStartOv,
    panEndEase: s.panEndEase,
    panEndExp: s.panEndExp,
    panEndAmp: s.panEndAmp,
    panEndPer: s.panEndPer,
    panEndOv: s.panEndOv,
    imageType: s.imageType,
    imageOrientation: s.imageOrientation,
    videoOrientation: s.videoOrientation,
    backgroundType: s.backgroundType,
    backgroundColor: s.backgroundColor,
    backgroundColorSet: s.backgroundColorSet,
    backgroundBlur: s.backgroundBlur,
    gifOption: s.gifOption,
    gifTimingConstant: s.gifTimingConstant,
    gifTimingMin: s.gifTimingMin,
    gifTimingMax: s.gifTimingMax,
    videoOption: s.videoOption,
    videoTimingConstant: s.videoTimingConstant,
    videoTimingMin: s.videoTimingMin,
    videoTimingMax: s.videoTimingMax,
    randomVideoStart: s.randomVideoStart,
    continueVideo: s.continueVideo,
    playVideoClips: s.playVideoClips,
    skipVideoStart: s.skipVideoStart,
    skipVideoEnd: s.skipVideoEnd,
    videoVolume: s.videoVolume,
    videoSpeed: s.videoSpeed,
    videoRandomSpeed: s.videoRandomSpeed,
    videoSpeedMin: s.videoSpeedMin,
    videoSpeedMax: s.videoSpeedMax,
    videoSkip: s.videoSkip,
    generatorMax: s.generatorMax,
    overlayEnabled: s.overlayEnabled,
    overlays: s.overlays.map((s) => fromOverlayStorage(s, overlaySlice)),
    nextSceneID: s.nextSceneID,
    nextSceneTime: s.nextSceneTime,
    nextSceneAllImages: s.nextSceneAllImages,
    persistAudio: s.persistAudio,
    persistText: s.persistText,
    nextSceneRandoms: s.nextSceneRandoms,
    strobe: s.strobe,
    strobePulse: s.strobePulse,
    strobeLayer: s.strobeLayer,
    strobeOpacity: s.strobeOpacity,
    strobeTF: s.strobeTF,
    strobeTime: s.strobeTime,
    strobeTimeMin: s.strobeTimeMin,
    strobeTimeMax: s.strobeTimeMax,
    strobeSinRate: s.strobeSinRate,
    strobeBPMMulti: s.strobeBPMMulti,
    strobeDelayTF: s.strobeDelayTF,
    strobeDelay: s.strobeDelay,
    strobeDelayMin: s.strobeDelayMin,
    strobeDelayMax: s.strobeDelayMax,
    strobeDelaySinRate: s.strobeDelaySinRate,
    strobeDelayBPMMulti: s.strobeDelayBPMMulti,
    strobeColorType: s.strobeColorType,
    strobeColor: s.strobeColor,
    strobeColorSet: s.strobeColorSet,
    strobeEase: s.strobeEase,
    strobeExp: s.strobeExp,
    strobeAmp: s.strobeAmp,
    strobePer: s.strobePer,
    strobeOv: s.strobeOv
  }
}

function fromDisplaySettings(s: DisplaySettingsStorage): DisplaySettings {
  const {
    fullScreen,
    clickToProgress,
    clickToProgressWhilePlaying,
    startImmediately,
    easingControls,
    audioAlert,
    cloneGridVideoElements,
    minImageSize,
    minVideoSize,
    maxInMemory,
    maxInHistory,
    maxLoadingAtOnce,
    ignoredTags
  } = s

  return {
    fullScreen,
    clickToProgress,
    clickToProgressWhilePlaying,
    startImmediately,
    easingControls,
    audioAlert,
    cloneGridVideoElements,
    minImageSize,
    minVideoSize,
    maxInMemory,
    maxInHistory,
    maxLoadingAtOnce,
    ignoredTags
  }
}

function fromServerSettings(s?: ServerSettingsStorage): ServerSettings {
  return {
    host: s?.host ?? initialServerSettings.host,
    port: s?.port ?? initialServerSettings.port,
    changed: false,
    onBlur: false
  }
}

function fromTagStorage(s: TagStorage, tagSlice: EntryState<Tag>) {
  return from<TagStorage, Tag>(s, tagSlice, (f) => newTag(f as Tag))
}

function fromPlaylistStorage(
  s: PlaylistStorage,
  playlistSlice: EntryState<Playlist>
) {
  return from<PlaylistStorage, Playlist>(s, playlistSlice, (f) => {
    const { id, audios } = f
    const name = f.name ?? `Playlist #${id}`
    return newPlaylist({ id, name, items: audios, type: PLT.audio })
  })
}

function fromAudioStorage(
  s: AudioStorage,
  audioSlice: EntryState<Audio>,
  tagSlice: EntryState<Tag>
) {
  const mapper = (f: AudioStorage): Audio => {
    return newAudio({
      ...f,
      tags: f.tags.map((s) => fromTagStorage(s, tagSlice))
    })
  }
  return from<AudioStorage, Audio>(s, audioSlice, mapper)
}

function fromCaptionScriptStorage(
  s: CaptionScriptStorage,
  captionScriptSlice: EntryState<CaptionScript>,
  tagSlice: EntryState<Tag>
) {
  const mapper = (f: CaptionScriptStorage): CaptionScript => {
    return newCaptionScript({
      ...f,
      tags: f.tags.map((s) => fromTagStorage(s, tagSlice)),
      blink: { ...f.blink },
      caption: { ...f.caption },
      captionBig: { ...f.captionBig },
      count: { ...f.count }
    })
  }
  return from<CaptionScriptStorage, CaptionScript>(
    s,
    captionScriptSlice,
    mapper
  )
}

export function fromLibrarySourceStorage(
  s: LibrarySourceStorage,
  librarySourceSlice: EntryState<LibrarySource>,
  tagSlice: EntryState<Tag>,
  clipSlice: EntryState<Clip>
) {
  const mapper = (f: LibrarySourceStorage): LibrarySource => {
    const clipIDs = new Map<number, number>()
    const lastCheck =
      f.lastCheck != null ? new Date(f.lastCheck).getTime() : undefined

    const librarySource = newLibrarySource({
      ...f,
      lastCheck,
      tags: f.tags.map((t) => fromTagStorage(t, tagSlice)),
      clips: f.clips.map((c) =>
        fromClipStorage(c, clipSlice, tagSlice, clipIDs)
      )
    })

    librarySource.disabledClips.map((id) => clipIDs.get(id))
    return librarySource
  }
  return from<LibrarySourceStorage, LibrarySource>(
    s,
    librarySourceSlice,
    mapper
  )
}

export function fromSceneGridStorage(
  s: SceneGridStorage,
  sceneGridSlice: EntryState<SceneGrid>
) {
  return from<SceneGridStorage, SceneGrid>(s, sceneGridSlice, (f) => {
    const grid = newSceneGrid(f as SceneGrid)
    for (const row of grid.grid) {
      for (const cell of row) {
        cell.sceneID = Number(cell.sceneID)
      }
    }
    return grid
  })
}

function fromClipStorage(
  s: ClipStorage,
  clipSlice: EntryState<Clip>,
  tagSlice: EntryState<Tag>,
  clipIDs: Map<number, number>
) {
  const mapper = (f: ClipStorage): Clip => {
    return newClip({
      ...f,
      tags: f.tags.map((t) => fromTagStorage(t, tagSlice))
    })
  }
  return from<ClipStorage, Clip>(s, clipSlice, mapper, clipIDs)
}

function fromSceneGroupStorage(
  s: SceneGroupStorage,
  sceneGroupSlice: EntryState<SceneGroup>
) {
  return from<SceneGroupStorage, SceneGroup>(s, sceneGroupSlice, (f) =>
    newSceneGroup(f as SceneGroup)
  )
}

export function fromSceneStorage(
  s: SceneStorage,
  sceneSlice: EntryState<Scene>,
  librarySourceSlice: EntryState<LibrarySource>,
  tagSlice: EntryState<Tag>,
  clipSlice: EntryState<Clip>,
  overlaySlice: EntryState<Overlay>,
  playlistSlice: EntryState<Playlist>,
  audioSlice: EntryState<Audio>,
  captionScriptSlice: EntryState<CaptionScript>
) {
  const mapper = (f: SceneStorage): Scene => {
    return newScene({
      id: f.id,
      name: f.name,
      sources: f.sources.map((s) =>
        fromLibrarySourceStorage(s, librarySourceSlice, tagSlice, clipSlice)
      ),
      useWeights: f.useWeights,
      timingFunction: f.timingFunction,
      timingConstant: f.timingConstant,
      timingMin: f.timingMin,
      timingMax: f.timingMax,
      timingSinRate: f.timingSinRate,
      timingBPMMulti: f.timingBPMMulti,
      backForth: f.backForth,
      backForthTF: f.backForthTF,
      backForthConstant: f.backForthConstant,
      backForthMin: f.backForthMin,
      backForthMax: f.backForthMax,
      backForthSinRate: f.backForthSinRate,
      backForthBPMMulti: f.backForthBPMMulti,
      imageType: f.imageType,
      backgroundType: f.backgroundType,
      backgroundColor: f.backgroundColor,
      backgroundColorSet: f.backgroundColorSet,
      backgroundBlur: f.backgroundBlur,
      imageTypeFilter: f.imageTypeFilter,
      fullSource: f.fullSource,
      imageOrientation: f.imageOrientation,
      gifOption: f.gifOption,
      gifTimingConstant: f.gifTimingConstant,
      gifTimingMin: f.gifTimingMin,
      gifTimingMax: f.gifTimingMax,
      videoOrientation: f.videoOrientation,
      videoOption: f.videoOption,
      videoTimingConstant: f.videoTimingConstant,
      videoTimingMin: f.videoTimingMin,
      videoTimingMax: f.videoTimingMax,
      videoSpeed: f.videoSpeed,
      videoRandomSpeed: f.videoRandomSpeed,
      videoSpeedMin: f.videoSpeedMin,
      videoSpeedMax: f.videoSpeedMax,
      videoSkip: f.videoSkip,
      randomVideoStart: f.randomVideoStart,
      continueVideo: f.continueVideo,
      playVideoClips: f.playVideoClips,
      skipVideoStart: f.skipVideoStart,
      skipVideoEnd: f.skipVideoEnd,
      videoVolume: f.videoVolume,
      weightFunction: f.weightFunction,
      sourceOrderFunction: f.sourceOrderFunction,
      forceAllSource: f.forceAllSource,
      orderFunction: f.orderFunction,
      forceAll: f.forceAll,
      zoom: f.zoom,
      zoomRandom: f.zoomRandom,
      zoomStart: f.zoomStart,
      zoomStartMin: f.zoomStartMin,
      zoomStartMax: f.zoomStartMax,
      zoomEnd: f.zoomEnd,
      zoomEndMin: f.zoomEndMin,
      zoomEndMax: f.zoomEndMax,
      horizTransType: f.horizTransType,
      horizTransLevel: f.horizTransLevel,
      horizTransLevelMin: f.horizTransLevelMin,
      horizTransLevelMax: f.horizTransLevelMax,
      horizTransRandom: f.horizTransRandom,
      vertTransType: f.vertTransType,
      vertTransLevel: f.vertTransLevel,
      vertTransLevelMin: f.vertTransLevelMin,
      vertTransLevelMax: f.vertTransLevelMax,
      vertTransRandom: f.vertTransRandom,
      transTF: f.transTF,
      transDuration: f.transDuration,
      transDurationMin: f.transDurationMin,
      transDurationMax: f.transDurationMax,
      transSinRate: f.transSinRate,
      transBPMMulti: f.transBPMMulti,
      transEase: f.transEase,
      transExp: f.transExp,
      transAmp: f.transAmp,
      transPer: f.transPer,
      transOv: f.transOv,
      crossFade: f.crossFade,
      crossFadeAudio: f.crossFadeAudio,
      fadeTF: f.fadeTF,
      fadeDuration: f.fadeDuration,
      fadeDurationMin: f.fadeDurationMin,
      fadeDurationMax: f.fadeDurationMax,
      fadeSinRate: f.fadeSinRate,
      fadeBPMMulti: f.fadeBPMMulti,
      fadeEase: f.fadeEase,
      fadeExp: f.fadeExp,
      fadeAmp: f.fadeAmp,
      fadePer: f.fadePer,
      fadeOv: f.fadeOv,
      slide: f.slide,
      slideTF: f.slideTF,
      slideType: f.slideType,
      slideDistance: f.slideDistance,
      slideDuration: f.slideDuration,
      slideDurationMin: f.slideDurationMin,
      slideDurationMax: f.slideDurationMax,
      slideSinRate: f.slideSinRate,
      slideBPMMulti: f.slideBPMMulti,
      slideEase: f.slideEase,
      slideExp: f.slideExp,
      slideAmp: f.slideAmp,
      slidePer: f.slidePer,
      slideOv: f.slideOv,
      strobe: f.strobe,
      strobePulse: f.strobePulse,
      strobeLayer: f.strobeLayer,
      strobeOpacity: f.strobeOpacity,
      strobeTF: f.strobeTF,
      strobeTime: f.strobeTime,
      strobeTimeMin: f.strobeTimeMin,
      strobeTimeMax: f.strobeTimeMax,
      strobeSinRate: f.strobeSinRate,
      strobeBPMMulti: f.strobeBPMMulti,
      strobeDelayTF: f.strobeDelayTF,
      strobeDelay: f.strobeDelay,
      strobeDelayMin: f.strobeDelayMin,
      strobeDelayMax: f.strobeDelayMax,
      strobeDelaySinRate: f.strobeDelaySinRate,
      strobeDelayBPMMulti: f.strobeDelayBPMMulti,
      strobeColorType: f.strobeColorType,
      strobeColor: f.strobeColor,
      strobeColorSet: f.strobeColorSet,
      strobeEase: f.strobeEase,
      strobeExp: f.strobeExp,
      strobeAmp: f.strobeAmp,
      strobePer: f.strobePer,
      strobeOv: f.strobeOv,
      fadeInOut: f.fadeInOut,
      fadeIOPulse: f.fadeIOPulse,
      fadeIOTF: f.fadeIOTF,
      fadeIODuration: f.fadeIODuration,
      fadeIODurationMin: f.fadeIODurationMin,
      fadeIODurationMax: f.fadeIODurationMax,
      fadeIOSinRate: f.fadeIOSinRate,
      fadeIOBPMMulti: f.fadeIOBPMMulti,
      fadeIODelayTF: f.fadeIODelayTF,
      fadeIODelay: f.fadeIODelay,
      fadeIODelayMin: f.fadeIODelayMin,
      fadeIODelayMax: f.fadeIODelayMax,
      fadeIODelaySinRate: f.fadeIODelaySinRate,
      fadeIODelayBPMMulti: f.fadeIODelayBPMMulti,
      fadeIOStartEase: f.fadeIOStartEase,
      fadeIOStartExp: f.fadeIOStartExp,
      fadeIOStartAmp: f.fadeIOStartAmp,
      fadeIOStartPer: f.fadeIOStartPer,
      fadeIOStartOv: f.fadeIOStartOv,
      fadeIOEndEase: f.fadeIOEndEase,
      fadeIOEndExp: f.fadeIOEndExp,
      fadeIOEndAmp: f.fadeIOEndAmp,
      fadeIOEndPer: f.fadeIOEndPer,
      fadeIOEndOv: f.fadeIOEndOv,
      panning: f.panning,
      panTF: f.panTF,
      panDuration: f.panDuration,
      panDurationMin: f.panDurationMin,
      panDurationMax: f.panDurationMax,
      panSinRate: f.panSinRate,
      panBPMMulti: f.panBPMMulti,
      panHorizTransType: f.panHorizTransType,
      panHorizTransImg: f.panHorizTransImg,
      panHorizTransLevel: f.panHorizTransLevel,
      panHorizTransLevelMax: f.panHorizTransLevelMax,
      panHorizTransLevelMin: f.panHorizTransLevelMin,
      panHorizTransRandom: f.panHorizTransRandom,
      panVertTransType: f.panVertTransType,
      panVertTransImg: f.panVertTransImg,
      panVertTransLevel: f.panVertTransLevel,
      panVertTransLevelMax: f.panVertTransLevelMax,
      panVertTransLevelMin: f.panVertTransLevelMin,
      panVertTransRandom: f.panVertTransRandom,
      panStartEase: f.panStartEase,
      panStartExp: f.panStartExp,
      panStartAmp: f.panStartAmp,
      panStartPer: f.panStartPer,
      panStartOv: f.panStartOv,
      panEndEase: f.panEndEase,
      panEndExp: f.panEndExp,
      panEndAmp: f.panEndAmp,
      panEndPer: f.panEndPer,
      panEndOv: f.panEndOv,
      overrideIgnore: f.overrideIgnore,
      gridScene: f.gridScene,
      scriptScene: f.scriptScene,
      downloadScene: f.downloadScene,
      generatorMax: f.generatorMax,
      overlayEnabled: f.overlayEnabled,
      overlays: f.overlays.map((s) => fromOverlayStorage(s, overlaySlice)),
      nextSceneID: f.nextSceneID,
      nextSceneTime: f.nextSceneTime,
      nextSceneAllImages: f.nextSceneAllImages,
      persistAudio: f.persistAudio,
      persistText: f.persistText,
      nextSceneRandomID: f.nextSceneRandomID,
      nextSceneRandoms: f.nextSceneRandoms,
      libraryID: f.libraryID,
      audioScene: f.audioScene,
      audioEnabled: f.audioEnabled,
      audioPlaylists: f.audioPlaylists.map((s) =>
        fromAudioPlaylistStorage(s, playlistSlice, audioSlice, tagSlice)
      ),
      audioStartIndex: f.audioStartIndex,
      textEnabled: f.textEnabled,
      scriptPlaylists: f.scriptPlaylists.map((s) =>
        fromScriptPlaylistStorage(
          s,
          playlistSlice,
          captionScriptSlice,
          tagSlice
        )
      ),
      scriptStartIndex: f.scriptStartIndex,
      regenerate: f.regenerate,
      generatorWeights: f.generatorWeights,
      openTab: f.openTab
    })
  }

  return from<SceneStorage, Scene>(s, sceneSlice, mapper)
}

function fromOverlayStorage(
  s: OverlayStorage,
  overlaySlice: EntryState<Overlay>
) {
  return from<OverlayStorage, Overlay>(s, overlaySlice, (f) =>
    newOverlay(f as Overlay)
  )
}

export function fromAudioPlaylistStorage(
  s: AudioPlaylistStorage,
  playlistSlice: EntryState<Playlist>,
  audioSlice: EntryState<Audio>,
  tagSlice: EntryState<Tag>
) {
  const { audios, repeat, shuffle } = s
  const id = playlistSlice.nextID
  const name = s.name ?? `Playlist #${id}`
  const exists = Object.values(playlistSlice.entries).find(
    (e) => e.name === name
  )
  if (exists == null) {
    playlistSlice.entries[id] = newPlaylist({
      id,
      name,
      repeat,
      shuffle,
      type: PLT.audio,
      items: audios.map((a) => fromAudioStorage(a, audioSlice, tagSlice))
    })

    playlistSlice.nextID++
    return id
  } else {
    return exists.id
  }
}

export function fromDisplayPlaylistStorage(
  s: DisplayPlaylistStorage,
  playlistSlice: EntryState<Playlist>,
  displaySlice: EntryState<Display>,
  displayViewSlice: EntryState<View>
) {
  const { displays, repeat, shuffle } = s
  const id = playlistSlice.nextID
  const name = s.name ?? ''
  const exists = Object.values(playlistSlice.entries).find(
    (e) => e.name === name
  )
  if (exists == null) {
    playlistSlice.entries[id] = newPlaylist({
      id,
      name,
      repeat,
      shuffle,
      type: PLT.audio,
      items: displays.map((s) =>
        fromDisplayStorage(s, displaySlice, displayViewSlice)
      )
    })

    playlistSlice.nextID++
    return id
  } else {
    return exists.id
  }
}

export function fromScenePlaylistStorage(
  s: ScenePlaylistStorage,
  playlistSlice: EntryState<Playlist>,
  sceneSlice: EntryState<Scene>,
  librarySourceSlice: EntryState<LibrarySource>,
  tagSlice: EntryState<Tag>,
  clipSlice: EntryState<Clip>,
  overlaySlice: EntryState<Overlay>,
  audioSlice: EntryState<Audio>,
  captionScriptSlice: EntryState<CaptionScript>
) {
  const { scenes, repeat, shuffle } = s
  const id = playlistSlice.nextID
  const name = s.name ?? ''
  const exists = Object.values(playlistSlice.entries).find(
    (e) => e.name === name
  )
  if (exists == null) {
    playlistSlice.entries[id] = newPlaylist({
      id,
      name,
      repeat,
      shuffle,
      type: PLT.scene,
      items: scenes.map((s) =>
        fromSceneStorage(
          s,
          sceneSlice,
          librarySourceSlice,
          tagSlice,
          clipSlice,
          overlaySlice,
          playlistSlice,
          audioSlice,
          captionScriptSlice
        )
      )
    })

    playlistSlice.nextID++
    return id
  } else {
    return exists.id
  }
}

export function fromScriptPlaylistStorage(
  s: ScriptPlaylistStorage,
  playlistSlice: EntryState<Playlist>,
  captionScriptSlice: EntryState<CaptionScript>,
  tagSlice: EntryState<Tag>
) {
  const { scripts, repeat, shuffle } = s
  const id = playlistSlice.nextID
  const name = s.name ?? `Playlist #${id}`
  const exists = Object.values(playlistSlice.entries).find(
    (e) => e.name === name
  )
  if (exists == null) {
    playlistSlice.entries[id] = newPlaylist({
      id,
      name,
      repeat,
      shuffle,
      type: PLT.script,
      items: scripts.map((s) =>
        fromCaptionScriptStorage(s, captionScriptSlice, tagSlice)
      )
    })

    playlistSlice.nextID++
    return id
  } else {
    return exists.id
  }
}

function fromRouteStorage(s: RouteStorage) {
  return newRoute({ ...s })
}

function from<F extends Identifiable, T extends Identifiable>(
  from: F,
  state: EntryState<T>,
  mapper: (from: F) => T,
  ids?: Map<number, number>
): number {
  const isNewEntry = state.entries[from.id] == null
  if (isNewEntry) {
    if (ids != null) {
      ids.set(from.id, from.id)
    }

    state.entries[from.id] = mapper(from)
    state.nextID = Math.max(from.id + 1, state.nextID)
  } else if (!equals<F, T>(from, state.entries[from.id])) {
    if (ids) {
      ids.set(from.id, state.nextID)
    }

    from.id = state.nextID
    state.entries[from.id] = mapper(from)
    state.nextID++
  }

  return from.id
}

function equals<F, T>(t1: F, t2: T) {
  return JSON.stringify(t1) === JSON.stringify(t2)
}

function convertScenesToDisplays(
  displaySlice: EntryState<Display>,
  viewSlice: EntryState<View>,
  playlistSlice: EntryState<Playlist>,
  sceneSlice: EntryState<Scene>,
  sceneGridSlice: EntryState<SceneGrid>,
  scenePlaylistItemSlice: EntryState<ScenePlaylistItem>,
  overlaySlice: EntryState<Overlay>,
  displayPlaylistItemSlice: EntryState<DisplayPlaylistItem>
) {
  Object.values(sceneSlice.entries).forEach((scene) => {
    const playlistName = scene.id.toString()
    const exists = Object.values(playlistSlice.entries).find(
      (p) => p.type === PLT.scene && p.name === playlistName
    )

    let scenePlaylistID: number
    if (exists != null) {
      scenePlaylistID = exists.id
    } else {
      const scenePlaylist = newPlaylist({
        id: playlistSlice.nextID,
        name: playlistName,
        type: PLT.scene
      })
      playlistSlice.nextID++
      scenePlaylistID = convertToScenePlaylist(
        scene.id,
        [],
        scenePlaylist,
        playlistSlice,
        sceneSlice,
        scenePlaylistItemSlice
      )
    }

    const scenePlaylist = playlistSlice.entries[scenePlaylistID]
    if (
      scenePlaylist.items.length === 1 &&
      (!scene.overlayEnabled || scene.overlays.length === 0)
    ) {
      delete playlistSlice.entries[scenePlaylistID]
      return
    }

    const displayPlaylist = newPlaylist({
      id: playlistSlice.nextID,
      name: `${scene.name} #${playlistSlice.nextID}`,
      type: PLT.display
    })
    playlistSlice.nextID++
    let displayDuration = 0
    let sceneName = ''
    let views: View[] = []
    let overlaysSize: number[][] | undefined = undefined
    let scenePlaylists: Playlist[][][] = []
    scenePlaylist.items.forEach((itemID) => {
      const item = scenePlaylistItemSlice.entries[itemID]
      let sceneID = item.sceneID
      if (sceneID === -1) {
        sceneID =
          item.randomScenes.length > 0
            ? item.randomScenes[0]
            : Number(Object.keys(sceneSlice.entries)[0])
      }

      const scene = sceneSlice.entries[sceneID]
      const newOverlaysSize = getOverlaysSize(
        scene.overlays,
        overlaySlice,
        sceneGridSlice
      )
      if (
        overlaysSize == null ||
        hasOverlaysSizeChanged(overlaysSize, newOverlaysSize)
      ) {
        overlaysSize = newOverlaysSize
        if (views.length > 0) {
          views.forEach((view) => (viewSlice.entries[view.id] = view))
          const display = newDisplay({
            id: displaySlice.nextID,
            name: `${sceneName} ${displaySlice.nextID}`,
            views: views.map((view) => view.id),
            selectedView: views[0].id
          })

          displaySlice.entries[display.id] = display
          displaySlice.nextID++

          const item: DisplayPlaylistItem = {
            id: displayPlaylistItemSlice.nextID,
            displayID: display.id,
            randomDisplays: [],
            duration: displayDuration
          }

          displayPlaylistItemSlice.entries[item.id] = item
          displayPlaylistItemSlice.nextID++
          displayPlaylist.items.push(item.id)
          displayDuration = 0
          views = []
        }

        sceneName = scene.name
        scenePlaylists = []
        const mainPlaylist = newPlaylist({
          id: playlistSlice.nextID,
          name: `${scene.name} 011`,
          type: PLT.scene
        })
        playlistSlice.entries[mainPlaylist.id] = mainPlaylist
        playlistSlice.nextID++
        scenePlaylists[0] = []
        scenePlaylists[0][0] = []
        scenePlaylists[0][0][0] = mainPlaylist
        const mainView = newView({
          id: viewSlice.nextID,
          name: 'View 011',
          width: 100,
          height: 100,
          color: getRandomColor(),
          playlistID: mainPlaylist.id
        })
        views.push(mainView)
        viewSlice.nextID++
        for (let i = 0; i < overlaysSize.length; i++) {
          scenePlaylists[i + 1] = []
          const item = scenePlaylistItemSlice.entries[itemID]
          const scene = sceneSlice.entries[item.sceneID]
          const overlayID = scene.overlays[i]
          const { opacity, sceneID } = overlaySlice.entries[overlayID]
          const gridID = convertSceneIDToGridID(sceneID)
          if (gridID != null) {
            const grid = sceneGridSlice.entries[gridID]
            const rows = grid.grid.length
            const cols = grid.grid[0].length
            const width = 100 / cols
            const height = 100 / rows
            const viewGrid: View[][] = []
            for (let r = 0; r < rows; r++) {
              viewGrid[r] = []
              scenePlaylists[i + 1][r] = []
              for (let c = 0; c < cols; c++) {
                const cell = grid.grid[r][c]
                const sync = cell.sceneCopy.length === 2
                let playlistID = 0
                if (!sync) {
                  const overlayPlaylist = newPlaylist({
                    id: playlistSlice.nextID,
                    name: `${sceneSlice.entries[cell.sceneID].name} ${i + 1}${
                      r + 1
                    }${c + 1}`,
                    type: PLT.scene
                  })
                  playlistSlice.entries[overlayPlaylist.id] = overlayPlaylist
                  playlistSlice.nextID++
                  scenePlaylists[i + 1][r][c] = overlayPlaylist
                  playlistID = overlayPlaylist.id
                }

                const view = newView({
                  id: viewSlice.nextID,
                  name: `View ${i + 1}${r + 1}${c + 1}`,
                  x: c * width,
                  y: r * height,
                  z: i + 1,
                  width,
                  height,
                  color: getRandomColor(),
                  playlistID,
                  opacity,
                  sync,
                  mirrorSyncedView: cell.mirror ? MVF.vertical : MVF.none
                })
                viewGrid[r][c] = view
                views.push(view)
                viewSlice.nextID++
              }
            }
            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                const view = viewGrid[r][c]
                if (view.sync) {
                  const cell = grid.grid[r][c]
                  const [syncRow, syncCol] = cell.sceneCopy
                  view.syncWithView = viewGrid[syncRow][syncCol].id
                }
              }
            }
          } else if (sceneID !== 0) {
            const overlayPlaylist = newPlaylist({
              id: playlistSlice.nextID,
              name: `${sceneSlice.entries[sceneID].name} 111`,
              type: PLT.scene
            })
            playlistSlice.entries[overlayPlaylist.id] = overlayPlaylist
            playlistSlice.nextID++
            scenePlaylists[i + 1][0][0] = overlayPlaylist

            const view = newView({
              id: viewSlice.nextID,
              name: `View ${i + 1}00`,
              z: i + 1,
              width: 100,
              height: 100,
              color: getRandomColor(),
              playlistID: overlayPlaylist.id,
              opacity
            })
            views.push(view)
            viewSlice.nextID++
          }
        }
      }

      displayDuration += item.duration
      scenePlaylists[0][0][0].items.push(itemID)
      for (let i = 1; i < scenePlaylists.length; i++) {
        const overlayID = scene.overlays[i - 1]
        const overlay = overlaySlice.entries[overlayID]
        const gridID = convertSceneIDToGridID(overlay.sceneID)
        for (let r = 0; r < scenePlaylists[i].length; r++) {
          for (let c = 0; c < scenePlaylists[i][r].length; c++) {
            const sceneID =
              gridID != null
                ? sceneGridSlice.entries[gridID].grid[r][c].sceneID
                : overlay.sceneID

            const playlistItem: ScenePlaylistItem = {
              id: scenePlaylistItemSlice.nextID,
              sceneID,
              randomScenes: [],
              duration: item.duration,
              playAfterAllImages: false
            }

            scenePlaylistItemSlice.nextID++
            scenePlaylistItemSlice.entries[playlistItem.id] = playlistItem
            scenePlaylists[i][r][c].items.push(playlistItem.id)
          }
        }
      }
    })

    if (displayPlaylist.items.length > 0 || views.length > 1) {
      views.forEach((view) => (viewSlice.entries[view.id] = view))
      const display = newDisplay({
        id: displaySlice.nextID,
        name: `${sceneName} ${displaySlice.nextID}`,
        views: views.map((view) => view.id),
        selectedView: views[0].id
      })

      displaySlice.entries[display.id] = display
      displaySlice.nextID++

      const item: DisplayPlaylistItem = {
        id: displayPlaylistItemSlice.nextID,
        displayID: display.id,
        randomDisplays: [],
        duration: displayDuration
      }

      displayPlaylistItemSlice.entries[item.id] = item
      displayPlaylistItemSlice.nextID++
      displayPlaylist.items.push(item.id)
    }
    if (displayPlaylist.items.length > 1) {
      playlistSlice.entries[displayPlaylist.id] = displayPlaylist
    }
  })
}

function getOverlaysSize(
  overlays: number[],
  overlaySlice: EntryState<Overlay>,
  sceneGridSlice: EntryState<SceneGrid>
) {
  const overlaysSize: number[][] = []
  for (const id of overlays) {
    let size: number[]
    const overlay = overlaySlice.entries[id]
    const gridID = convertSceneIDToGridID(overlay.sceneID)
    if (gridID != null) {
      const grid = sceneGridSlice.entries[gridID]
      size = [grid.grid.length, grid.grid[0].length]
    } else {
      size = [1, 1]
    }

    overlaysSize.push(size)
  }

  return overlaysSize
}

function hasOverlaysSizeChanged(
  overlaysSize: number[][],
  newOverlaysSize: number[][]
) {
  if (overlaysSize.length !== newOverlaysSize.length) return true

  for (let i = 0; i < overlaysSize.length; i++) {
    const oldSize = overlaysSize[i]
    const newSize = newOverlaysSize[i]
    if (oldSize[0] !== newSize[0] || oldSize[1] !== newSize[1]) {
      return true
    }
  }

  return false
}

function convertSceneGridsToDisplays(
  displaySlice: EntryState<Display>,
  viewSlice: EntryState<View>,
  playlistSlice: EntryState<Playlist>,
  sceneSlice: EntryState<Scene>,
  sceneGridSlice: EntryState<SceneGrid>,
  scenePlaylistItemSlice: EntryState<ScenePlaylistItem>,
  overlaySlice: EntryState<Overlay>
): number[] {
  Object.values(sceneGridSlice.entries).forEach((grid) => {
    const gridName = grid.name ?? `Grid ${grid.id}`
    const display = newDisplay({
      id: displaySlice.nextID,
      name: gridName
    })

    const rows = grid.grid.length
    const cols = grid.grid[0].length
    const height = 100 / rows
    const width = 100 / cols
    const views: View[][][] = []
    for (let r = 0; r < rows; r++) {
      views[r] = []
      for (let c = 0; c < cols; c++) {
        views[r][c] = []
        const cell = grid.grid[r][c]
        const playlistName = cell.sceneID.toString()
        const exists = Object.values(playlistSlice.entries).find(
          (p) => p.type === PLT.scene && p.name === playlistName
        )

        let playlistID: number
        if (exists != null) {
          playlistID = exists.id
        } else {
          const playlist = newPlaylist({
            id: playlistSlice.nextID,
            name: playlistName,
            type: PLT.scene
          })
          playlistID = convertToScenePlaylist(
            cell.sceneID,
            [],
            playlist,
            playlistSlice,
            sceneSlice,
            scenePlaylistItemSlice
          )
        }

        let maxOverlaysCount = 0
        const opacities: number[] = []
        const playlist = playlistSlice.entries[playlistID]
        playlist.items.forEach((itemID) => {
          const { sceneID, randomScenes } =
            scenePlaylistItemSlice.entries[itemID]
          let id: number
          if (sceneID !== -1) {
            id = sceneID
          } else if (randomScenes.length > 0) {
            id = randomScenes[0]
          } else {
            id = Number(Object.keys(sceneSlice.entries)[0])
          }

          const { overlays, overlayEnabled } = sceneSlice.entries[id]
          if (overlayEnabled && overlays.length > maxOverlaysCount) {
            for (let i = maxOverlaysCount; i < overlays.length; i++) {
              opacities.push(overlaySlice.entries[overlays[i]].opacity)
            }

            maxOverlaysCount = overlays.length
          }
        })

        const playlistIDs = [playlistID]
        for (let z = 0; z < maxOverlaysCount; z++) {
          const overlayPlaylist = newPlaylist({
            id: playlistSlice.nextID,
            name: `${sceneSlice.entries[cell.sceneID].name} ${z + 1}${r + 1}${
              c + 1
            }`,
            type: PLT.scene
          })
          playlistSlice.entries[overlayPlaylist.id] = overlayPlaylist
          playlistSlice.nextID++
          playlistIDs.push(overlayPlaylist.id)
        }

        maxOverlaysCount++
        for (let z = 0; z < maxOverlaysCount; z++) {
          const opacity = z === 0 ? 100 : opacities[z - 1]
          const view = newView({
            id: viewSlice.nextID,
            name: `View ${z}${r + 1}${c + 1}`,
            color: getRandomColor(),
            x: c * width,
            y: r * height,
            z,
            width,
            height,
            opacity,
            playlistID: playlistIDs[z]
          })

          viewSlice.entries[view.id] = view
          viewSlice.nextID++
          display.views.push(view.id)
          views[r][c][z] = view
        }

        playlistIDs.shift()
        for (const itemID of playlist.items) {
          const { duration, sceneID, randomScenes } =
            scenePlaylistItemSlice.entries[itemID]
          let id: number
          if (sceneID !== -1) {
            id = sceneID
          } else if (randomScenes.length > 0) {
            id = randomScenes[0]
          } else {
            id = Number(Object.keys(sceneSlice.entries)[0])
          }

          const { overlays, overlayEnabled } = sceneSlice.entries[id]
          if (overlayEnabled) {
            for (let i = 0; i < overlays.length; i++) {
              const id = overlaySlice.entries[overlays[i]].sceneID
              const sceneID = isSceneIDAGridID(id) ? 0 : id
              let item = Object.values(scenePlaylistItemSlice.entries).find(
                (value) =>
                  value.sceneID === sceneID && value.duration === duration
              )
              if (item == null) {
                item = {
                  id: scenePlaylistItemSlice.nextID,
                  sceneID,
                  randomScenes: [],
                  duration,
                  playAfterAllImages: false
                }
                scenePlaylistItemSlice.nextID++
                scenePlaylistItemSlice.entries[item.id] = item
              }
              playlistSlice.entries[playlistIDs[i]].items.push(item.id)
            }
          }
          const rest = overlayEnabled ? overlays.length : 0
          for (let i = rest; i < playlistIDs.length; i++) {
            let item = Object.values(scenePlaylistItemSlice.entries).find(
              (value) => value.sceneID === 0 && value.duration === duration
            )
            if (item == null) {
              item = {
                id: scenePlaylistItemSlice.nextID,
                sceneID: 0,
                randomScenes: [],
                duration,
                playAfterAllImages: false
              }
              scenePlaylistItemSlice.nextID++
              scenePlaylistItemSlice.entries[item.id] = item
            }

            scenePlaylistItemSlice.nextID++
            scenePlaylistItemSlice.entries[item.id] = item
            playlistSlice.entries[playlistIDs[i]].items.push(item.id)
          }
        }
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid.grid[r][c]
        const sync = cell.sceneCopy.length > 0
        if (sync) {
          const copy = grid.grid[r][c].sceneCopy
          const copyViews = views[copy[0]][copy[1]]
          for (let z = 0; z < copyViews.length; z++) {
            const copyView = copyViews[z]
            const view = views[r][c][z]
            view.sync = true
            view.syncWithView = copyView.id
            view.color = copyView.color
            view.mirrorSyncedView = cell.mirror ? MVF.vertical : MVF.none
          }
        }
      }
    }

    display.selectedView = display.views[0]
    displaySlice.entries[display.id] = display
    displaySlice.nextID++
  })

  Object.values(playlistSlice.entries)
    .filter((p) => p.type === PLT.scene)
    .forEach((p) => {
      const sceneID = Number(p.name)
      if (!isNaN(sceneID) && sceneID > 0) {
        const { name } = sceneSlice.entries[sceneID]
        p.name = `${name} #${p.id}`
      }
    })
  return Object.keys(displaySlice.entries).map((id) => Number(id))
}

function convertToScenePlaylist(
  sceneID: number,
  randomScenes: number[],
  playlist: Playlist,
  playlistSlice: EntryState<Playlist>,
  sceneSlice: EntryState<Scene>,
  scenePlaylistItemSlice: EntryState<ScenePlaylistItem>
): number {
  if (
    playlist.items
      .map((id) => scenePlaylistItemSlice.entries[id].sceneID)
      .includes(sceneID)
  ) {
    // recursion detected, prevent infinite loop
    sceneID = 0
  }
  if (sceneID === 0) {
    if (playlist.items.length > 0) {
      playlistSlice.entries[playlist.id] = playlist
      playlistSlice.nextID++
      return playlist.id
    } else {
      return 0
    }
  }

  let scene
  if (sceneID !== -1) {
    scene = sceneSlice.entries[sceneID]
  } else if (randomScenes.length > 0) {
    scene = sceneSlice.entries[randomScenes[0]]
  } else {
    scene = sceneSlice.entries[Number(Object.keys(sceneSlice.entries)[0])]
  }

  const item: ScenePlaylistItem = {
    id: scenePlaylistItemSlice.nextID,
    sceneID,
    randomScenes,
    duration: scene.nextSceneTime,
    playAfterAllImages: false // TODO support playAfterAllImages
  }

  scenePlaylistItemSlice.entries[item.id] = item
  scenePlaylistItemSlice.nextID++
  playlist.items.push(item.id)

  return convertToScenePlaylist(
    scene.nextSceneID,
    scene.nextSceneRandoms,
    playlist,
    playlistSlice,
    sceneSlice,
    scenePlaylistItemSlice
  )
}
