import type Config from './Config'
import { initialConfig, newConfig } from './Config'
import type Route from './Route'
import defaultTheme from '../../../renderer/data/theme'
import { copy } from '../../../renderer/data/utils'
import { type RootState } from '../../store'
import { initialRootState } from '../../RootState'
import { type EntryState, type Identifiable } from '../../EntryState'
import type SceneSettings from './SceneSettings'
import type AppStorage from '../../../storage/AppStorage'
import type AudioPlaylist from '../../scene/AudioPlaylist'
import type ScriptPlaylist from '../../scene/ScriptPlaylist'
import type * as ClipStorage from '../../../storage/Clip'
import type * as ConfigStorage from '../../../storage/Config'
import type * as SceneSettingsStorage from '../../../storage/SceneSettings'
import type * as SceneGroupStorage from '../../../storage/SceneGroup'
import type * as SceneStorage from '../../../storage/Scene'
import type * as SceneGridStorage from '../../../storage/SceneGrid'
import type * as LibrarySourceStorage from '../../../storage/LibrarySource'
import type * as AudioStorage from '../../../storage/Audio'
import type * as CaptionScriptStorage from '../../../storage/CaptionScript'
import type * as PlaylistStorage from '../../../storage/Playlist'
import type * as TagStorage from '../../../storage/Tag'
import type * as OverlayStorage from '../../../storage/Overlay'
import type * as AudioPlaylistStorage from '../../../storage/AudioPlaylist'
import type * as ScriptPlaylistStorage from '../../../storage/ScriptPlaylist'
import type * as RouteStorage from '../../../storage/Route'
import type Audio from '../../audio/Audio'
import type Tag from '../../tag/Tag'
import { newTag } from '../../tag/Tag'
import type CaptionScript from '../../captionScript/CaptionScript'
import type Clip from '../../clip/Clip'
import type LibrarySource from '../../librarySource/LibrarySource'
import type Overlay from '../../overlay/Overlay'
import type Playlist from '../../playlist/Playlist'
import type Scene from '../../scene/Scene'
import type SceneGrid from '../../sceneGrid/SceneGrid'
import type SceneGroup from '../../sceneGroup/SceneGroup'
import { initialScenePickerState } from '../../scenePicker/slice'
import { initialVideoClipperState } from '../../videoClipper/slice'
import { initialAudioLibraryState } from '../../audioLibrary/slice'
import { initialSceneDetailState } from '../../sceneDetail/slice'
import { initialCaptionScriptorState } from '../../captionScriptor/slice'
import { initialSystemConstants } from '../../constants/SystemConstants'
import { initialPlayersState } from '../../player/slice'
import { setDisplayedSources } from '../slice'
import { newLibrarySource } from '../../librarySource/LibrarySource'
import { newSceneGrid } from '../../sceneGrid/SceneGrid'
import { newScene } from '../../scene/Scene'
import { newPlaylist } from '../../playlist/Playlist'
import { newAudio } from '../../audio/Audio'
import { newCaptionScript } from '../../captionScript/CaptionScript'
import { newClip } from '../../clip/Clip'
import { newSceneGroup } from '../../sceneGroup/SceneGroup'
import { newOverlay } from '../../overlay/Overlay'
import { newRoute } from './Route'
import { ThemeOptions } from '@mui/material'

export default interface App {
  version: string
  config: Config
  sceneGroups: number[] // Array of SceneGroup IDs
  scenes: number[] // Array of Scene IDs
  grids: number[] // Array of SceneGrid IDs
  library: number[] // Array of LibrarySource IDs
  audios: number[] // Array of Audio IDs
  scripts: number[] // Array of CaptionScript IDs
  playlists: number[] // Array of Playlist IDs
  tags: number[] // Array of Tag IDs
  route: Route[]
  specialMode?: string
  openTab: number
  displayedSources: number[] // Array of LibrarySource IDs
  libraryYOffset: number
  libraryFilters: string[]
  librarySelected: number[]
  audioOpenTab: number
  audioYOffset: number
  audioFilters: string[]
  audioSelected: number[]
  scriptYOffset: number
  scriptFilters: string[]
  scriptSelected: number[]
  progressMode?: string
  progressTitle?: string
  progressCurrent: number
  progressTotal: number
  progressNext?: string
  systemMessage?: string
  systemSnackOpen: boolean
  systemSnack?: string
  systemSnackSeverity?: string
  tutorial?: string
  theme: ThemeOptions
}

export const initialApp: App = {
  version: '',
  config: initialConfig,
  sceneGroups: [],
  scenes: [],
  grids: [],
  library: [],
  audios: [],
  scripts: [],
  playlists: [],
  tags: [],
  route: [],
  openTab: 0,
  displayedSources: [],
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
  progressCurrent: 0,
  progressTotal: 0,
  systemSnackOpen: false,
  theme: defaultTheme
}

export function newApp (init?: Partial<App>) {
  return Object.assign(copy<App>(initialApp), init)
}

export function toAppStorage (state: RootState): AppStorage {
  return {
    ...state.app,
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
    sceneGroups: state.app.sceneGroups.map((id) =>
      toSceneGroupStorage(id, state)
    ),
    scenes: state.app.scenes.map((id) => toSceneStorage(id, state)),
    grids: state.app.grids.map((id) => toSceneGridStorage(id, state)),
    library: state.app.library.map((id) => toLibrarySourceStorage(id, state)),
    audios: state.app.audios.map((id) => toAudioStorage(id, state)),
    scripts: state.app.scripts.map((id) => toCaptionScriptStorage(id, state)),
    playlists: state.app.playlists.map((id) => toPlaylistStorage(id, state)),
    tags: state.app.tags.map((id) => toTagStorage(id, state)),
    displayedSources: state.app.displayedSources.map((id) =>
      toLibrarySourceStorage(id, state)
    )
  }
}

export function toConfigStorage (
  config: Config,
  state: RootState
): ConfigStorage.default {
  return {
    ...config,
    defaultScene: toSceneSettingsStorage(config.defaultScene, state)
  }
}

function toSceneSettingsStorage (
  sceneSettings: SceneSettings,
  state: RootState
): SceneSettingsStorage.default {
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

function toSceneGroupStorage (
  id: number,
  state: RootState
): SceneGroupStorage.default {
  return state.sceneGroup.entries[id]
}

export function toSceneStorage (
  id: number,
  state: RootState
): SceneStorage.default | undefined {
  const scene = state.scene.entries[id]
  return scene !== undefined
    ? {
        ...scene,
        sources: scene.sources.map((id) => toLibrarySourceStorage(id, state)),
        overlays: scene.overlays.map((id) => toOverlayStorage(id, state)),
        audioPlaylists: scene.audioPlaylists.map((playlist) =>
          toAudioPlaylistStorage(playlist, state)
        ),
        scriptPlaylists: scene.scriptPlaylists.map((playlist) =>
          toScriptPlaylistStorage(playlist, state)
        )
      }
    : undefined
}

function toOverlayStorage (
  id: number,
  state: RootState
): OverlayStorage.default {
  return state.overlay.entries[id]
}

function toAudioPlaylistStorage (
  playlist: AudioPlaylist,
  state: RootState
): AudioPlaylistStorage.default {
  return {
    ...playlist,
    audios: playlist.audios.map((id) => toAudioStorage(id, state))
  }
}

function toScriptPlaylistStorage (
  playlist: ScriptPlaylist,
  state: RootState
): ScriptPlaylistStorage.default {
  return {
    ...playlist,
    scripts: playlist.scripts.map((id) => toCaptionScriptStorage(id, state))
  }
}

export function toSceneGridStorage (
  id: number,
  state: RootState
): SceneGridStorage.default {
  return state.sceneGrid.entries[id]
}

export function toLibrarySourceStorage (
  id: number,
  state: RootState
): LibrarySourceStorage.default {
  const source = state.librarySource.entries[id]
  return {
    ...source,
    lastCheck: new Date(source.lastCheck).toString(),
    tags: source.tags.map((id) => toTagStorage(id, state)),
    clips: source.clips.map((id) => toClipStorage(id, state))
  }
}

function toClipStorage (id: number, state: RootState): ClipStorage.default {
  const clip = state.clip.entries[id]
  return {
    ...clip,
    tags: clip.tags.map((id) => toTagStorage(id, state))
  }
}

function toAudioStorage (id: number, state: RootState): AudioStorage.default {
  const audio = state.audio.entries[id]
  return {
    ...audio,
    tags: audio.tags.map((id) => toTagStorage(id, state))
  }
}

function toCaptionScriptStorage (
  id: number,
  state: RootState
): CaptionScriptStorage.default {
  const script = state.captionScript.entries[id]
  return {
    ...script,
    tags: script.tags.map((id) => toTagStorage(id, state))
  }
}

function toPlaylistStorage (
  id: number,
  state: RootState
): PlaylistStorage.default {
  return state.playlist.entries[id]
}

function toTagStorage (id: number, state: RootState): TagStorage.default {
  return state.tag.entries[id]
}

export function fromAppStorage (appStorage: AppStorage): RootState {
  const slice = copy<RootState>(initialRootState)
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
        slice.audio,
        slice.captionScript
      )
    ),
    grids: appStorage.grids.map((s) => fromSceneGridStorage(s, slice.sceneGrid)),
    library,
    audios,
    scripts,
    playlists: appStorage.playlists.map((s) =>
      fromPlaylistStorage(s, slice.playlist)
    ),
    tags: appStorage.tags.map((s) => fromTagStorage(s, slice.tag)),
    route: appStorage.route.map((s) => fromRouteStorage(s)),
    displayedSources: appStorage.displayedSources
      .map((s) => s.id)
      .filter((id) => library.includes(id)),
    librarySelected,
    audioSelected,
    scriptSelected
  })

  if(slice.app.route.length > 0) {
    const lastRoute = slice.app.route[slice.app.route.length - 1]
    if(['play', 'libraryplay', 'gridplay'].includes(lastRoute.kind)) {
      slice.app.route.pop()
    }
  }

  return slice
}

function fromConfigStorage (
  s: ConfigStorage.default,
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
    caching: { ...s.caching },
    displaySettings: { ...s.displaySettings },
    generalSettings: { ...s.generalSettings },
    tutorials: { ...s.tutorials },
    clientID: s.clientID,
    newWindowAlerted: s.newWindowAlerted
  })
}

function fromSceneSettingsStorage (
  s: SceneSettingsStorage.default,
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

export function fromTagStorage (
  s: TagStorage.default,
  tagSlice: EntryState<Tag>
) {
  return from<TagStorage.default, Tag>(s, tagSlice, (f) => newTag(f as Tag))
}

function fromPlaylistStorage (
  s: PlaylistStorage.default,
  playlistSlice: EntryState<Playlist>
) {
  return from<PlaylistStorage.default, Playlist>(s, playlistSlice, (f) =>
    newPlaylist(f as Playlist)
  )
}

function fromAudioStorage (
  s: AudioStorage.default,
  audioSlice: EntryState<Audio>,
  tagSlice: EntryState<Tag>
) {
  const mapper = (f: AudioStorage.default): Audio => {
    return newAudio({
      ...f,
      tags: f.tags.map((s) => fromTagStorage(s, tagSlice))
    })
  }
  return from<AudioStorage.default, Audio>(s, audioSlice, mapper)
}

function fromCaptionScriptStorage (
  s: CaptionScriptStorage.default,
  captionScriptSlice: EntryState<CaptionScript>,
  tagSlice: EntryState<Tag>
) {
  const mapper = (f: CaptionScriptStorage.default): CaptionScript => {
    return newCaptionScript({
      ...f,
      tags: f.tags.map((s) => fromTagStorage(s, tagSlice)),
      blink: { ...f.blink },
      caption: { ...f.caption },
      captionBig: { ...f.captionBig },
      count: { ...f.count }
    })
  }
  return from<CaptionScriptStorage.default, CaptionScript>(
    s,
    captionScriptSlice,
    mapper
  )
}

export function fromLibrarySourceStorage (
  s: LibrarySourceStorage.default,
  librarySourceSlice: EntryState<LibrarySource>,
  tagSlice: EntryState<Tag>,
  clipSlice: EntryState<Clip>
) {
  const mapper = (f: LibrarySourceStorage.default): LibrarySource => {
    const clipIDs = new Map<number, number>()
    const lastCheck = f.lastCheck != null ? new Date(f.lastCheck).getTime() : null
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
  return from<LibrarySourceStorage.default, LibrarySource>(
    s,
    librarySourceSlice,
    mapper
  )
}

export function fromSceneGridStorage (
  s: SceneGridStorage.default,
  sceneGridSlice: EntryState<SceneGrid>
) {
  return from<SceneGridStorage.default, SceneGrid>(s, sceneGridSlice, (f) =>
    newSceneGrid(f as SceneGrid)
  )
}

function fromClipStorage (
  s: ClipStorage.default,
  clipSlice: EntryState<Clip>,
  tagSlice: EntryState<Tag>,
  clipIDs: Map<number, number>
) {
  const mapper = (f: ClipStorage.default): Clip => {
    return newClip({
      ...f,
      tags: f.tags.map((t) => fromTagStorage(t, tagSlice))
    })
  }
  return from<ClipStorage.default, Clip>(s, clipSlice, mapper, clipIDs)
}

function fromSceneGroupStorage (
  s: SceneGroupStorage.default,
  sceneGroupSlice: EntryState<SceneGroup>
) {
  return from<SceneGroupStorage.default, SceneGroup>(s, sceneGroupSlice, (f) =>
    newSceneGroup(f as SceneGroup)
  )
}

export function fromSceneStorage (
  s: SceneStorage.default,
  sceneSlice: EntryState<Scene>,
  librarySourceSlice: EntryState<LibrarySource>,
  tagSlice: EntryState<Tag>,
  clipSlice: EntryState<Clip>,
  overlaySlice: EntryState<Overlay>,
  audioSlice: EntryState<Audio>,
  captionScriptSlice: EntryState<CaptionScript>
) {
  const mapper = (f: SceneStorage.default): Scene => {
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
        fromAudioPlaylistStorage(s, audioSlice, tagSlice)
      ),
      audioStartIndex: f.audioStartIndex,
      textEnabled: f.textEnabled,
      scriptPlaylists: f.scriptPlaylists.map((s) =>
        fromScriptPlaylistStorage(s, captionScriptSlice, tagSlice)
      ),
      scriptStartIndex: f.scriptStartIndex,
      regenerate: f.regenerate,
      generatorWeights: f.generatorWeights,
      openTab: f.openTab
    })
  }

  return from<SceneStorage.default, Scene>(s, sceneSlice, mapper)
}

function fromOverlayStorage (
  s: OverlayStorage.default,
  overlaySlice: EntryState<Overlay>
) {
  return from<OverlayStorage.default, Overlay>(s, overlaySlice, (f) =>
    newOverlay(f as Overlay)
  )
}

function fromAudioPlaylistStorage (
  s: AudioPlaylistStorage.default,
  audioSlice: EntryState<Audio>,
  tagSlice: EntryState<Tag>
) {
  return {
    ...s,
    audios: s.audios.map((a) => fromAudioStorage(a, audioSlice, tagSlice))
  }
}

function fromScriptPlaylistStorage (
  s: ScriptPlaylistStorage.default,
  captionScriptSlice: EntryState<CaptionScript>,
  tagSlice: EntryState<Tag>
) {
  return {
    ...s,
    scripts: s.scripts.map((a) =>
      fromCaptionScriptStorage(a, captionScriptSlice, tagSlice)
    )
  }
}

function fromRouteStorage (s: RouteStorage.default) {
  return newRoute(s as Route)
}

function from<F extends Identifiable, T extends Identifiable> (
  from: F,
  state: EntryState<T>,
  mapper: (from: F) => T,
  ids?: Map<number, number>
): number {
  const isNewEntry = !state.entries[from.id]
  if (isNewEntry) {
    if (ids) {
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

function equals<F, T> (t1: F, t2: T) {
  return JSON.stringify(t1) === JSON.stringify(t2)
}
