import { createSelector } from '@reduxjs/toolkit'
import { getActiveSceneID } from '../app/thunks'
import { type RootState } from '../store'
import { type EntryState, getEntry } from '../EntryState'
import { AppStorageImport, initialAppStorageImport } from '../AppStorageImport'
import type TimingSettings from './TimingSettings'
import type Scene from './Scene'
import {
  areWeightsValid,
  convertGridIDToSceneID,
  convertSceneIDToGridID,
  getEffects
} from '../../data/utils'
import { toLibrarySourceStorage } from '../app/convert'
import { getAppScenes } from '../app/selectors'
import type SceneSettings from '../app/data/SceneSettings'
import type AudioPlaylist from './AudioPlaylist'
import type ScriptPlaylist from './ScriptPlaylist'
import type WeightGroup from './WeightGroup'
import { getSceneGridEntries, selectSceneGrids } from '../sceneGrid/selectors'
import { getLibrarySourceEntries } from '../librarySource/selectors'
import { getClipEntries } from '../clip/selectors'
import { getTagEntries } from '../tag/selectors'
import { getOverlayEntries } from '../overlay/selectors'
import Overlay from '../overlay/Overlay'
import { copy } from 'flipflip-common'

const getSceneOrSceneSettings = (
  state: RootState,
  id?: number
): Scene | SceneSettings => {
  return id != null
    ? getEntry(state.scene, id)
    : state.app.config.defaultScene
}

export const selectSceneFadeExp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeExp
}

export const selectSceneFadeOv = (id?: number) => {
  return (state: RootState): number => getSceneOrSceneSettings(state, id).fadeOv
}

export const selectSceneFadeAmp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeAmp
}

export const selectSceneFadePer = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadePer
}

export const selectSceneHasBPM = (id?: number) => {
  return (state: RootState): boolean => {
    if (id === undefined) return false

    const scene = getEntry(state.scene, id)
    const playlists = scene?.audioPlaylists
    return (
      playlists !== undefined &&
      playlists.length > 0 &&
      playlists[0].audios.length > 0 &&
      state.audio.entries[playlists[0].audios[0]]?.bpm !== undefined
    )
  }
}

export const selectSceneFadeInOut = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).fadeInOut
}

export const selectSceneFadeTF = (id?: number) => {
  return (state: RootState): string => getSceneOrSceneSettings(state, id).fadeTF
}

export const selectSceneFadeDuration = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeDuration
}

export const selectSceneFadeDurationMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeDurationMin
}

export const selectSceneFadeDurationMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeDurationMax
}

export const selectSceneFadeSinRate = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeSinRate
}

export const selectSceneFadeBPMMulti = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeBPMMulti
}

export const selectSceneFadeIOPulse = (id: number) => {
  return (state: RootState): boolean => getEntry(state.scene, id).fadeIOPulse
}

export const selectSceneFadeIOStartAmp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeIOStartAmp
}

export const selectSceneFadeIOStartExp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeIOStartExp
}
export const selectSceneFadeIOStartOv = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeIOStartOv
}

export const selectSceneFadeIOStartPer = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeIOStartPer
}

export const selectSceneFadeIOEndAmp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeIOEndAmp
}

export const selectSceneFadeIOEndExp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeIOEndExp
}
export const selectSceneFadeIOEndOv = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeIOEndOv
}

export const selectSceneFadeIOEndPer = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeIOEndPer
}

export const selectSceneFadeIOBPMMulti = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeIOBPMMulti
}

export const selectSceneFadeIODuration = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeIODuration
}

export const selectSceneFadeIODurationMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeIODurationMax
}

export const selectSceneFadeIODurationMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeIODurationMin
}

export const selectSceneFadeIOSinRate = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).fadeIOSinRate
}

export const selectSceneFadeIOTF = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).fadeIOTF
}

export const selectScenePanning = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).panning
}

export const selectScenePanTF = (id?: number) => {
  return (state: RootState): string => getSceneOrSceneSettings(state, id).panTF
}

export const selectScenePanDuration = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panDuration
}

export const selectScenePanDurationMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panDurationMin
}

export const selectScenePanDurationMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panDurationMax
}

export const selectScenePanSinRate = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panSinRate
}

export const selectScenePanBPMMulti = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panBPMMulti
}

export const selectSceneTimingTF = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).timingFunction
}

export const selectSceneTimingDuration = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).timingConstant
}

export const selectSceneTimingDurationMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).timingMin
}

export const selectSceneTimingDurationMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).timingMax
}

export const selectSceneTimingSinRate = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).timingSinRate
}

export const selectSceneTimingBPMMulti = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).timingBPMMulti
}

export const selectSceneBackForth = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).backForth
}

export const selectSceneBackForthTF = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).backForthTF
}

export const selectSceneBackForthDuration = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).backForthConstant
}

export const selectSceneBackForthDurationMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).backForthMin
}

export const selectSceneBackForthDurationMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).backForthMax
}

export const selectSceneBackForthSinRate = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).backForthSinRate
}

export const selectSceneBackForthBPMMulti = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).backForthBPMMulti
}

export const selectSceneSlide = (id?: number) => {
  return (state: RootState): boolean => getSceneOrSceneSettings(state, id).slide
}

export const selectSceneSlideTF = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).slideTF
}

export const selectSceneSlideDuration = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).slideDuration
}

export const selectSceneSlideDurationMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).slideDurationMin
}

export const selectSceneSlideDurationMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).slideDurationMax
}

export const selectSceneSlideSinRate = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).slideSinRate
}

export const selectSceneSlideBPMMulti = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).slideBPMMulti
}

export const selectSceneStrobe = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).strobe
}

export const selectSceneStrobePulse = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).strobePulse
}

export const selectSceneStrobeTF = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).strobeTF
}

export const selectSceneStrobeDuration = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobeTime
}

export const selectSceneStrobeDurationMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobeTimeMin
}

export const selectSceneStrobeDurationMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobeTimeMax
}

export const selectSceneStrobeSinRate = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobeSinRate
}

export const selectSceneStrobeBPMMulti = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobeBPMMulti
}

export const selectSceneStrobeDelayTF = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).strobeDelayTF
}

export const selectSceneStrobeDelayDuration = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobeDelay
}

export const selectSceneStrobeDelayDurationMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobeDelayMin
}

export const selectSceneStrobeDelayDurationMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobeDelayMax
}

export const selectSceneStrobeDelaySinRate = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobeDelaySinRate
}

export const selectSceneStrobeDelayBPMMulti = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobeDelayBPMMulti
}

export const selectSceneStrobeColor = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).strobeColor
}

export const selectSceneStrobeColorSet = (id?: number) => {
  return (state: RootState): string[] =>
    getSceneOrSceneSettings(state, id).strobeColorSet
}

export const selectSceneZoomTF = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).transTF
}

export const selectSceneZoomDuration = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).transDuration
}

export const selectSceneZoomDurationMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).transDurationMin
}

export const selectSceneZoomDurationMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).transDurationMax
}

export const selectSceneZoomSinRate = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).transSinRate
}

export const selectSceneZoomBPMMulti = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).transBPMMulti
}

export const selectSceneFadeEase = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).fadeEase
}

export const selectSceneFadeIOStartEase = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).fadeIOStartEase
}

export const selectSceneFadeIOEndEase = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).fadeIOEndEase
}

export const selectScenePanStartEase = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).panStartEase
}

export const selectScenePanStartExp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panStartExp
}

export const selectScenePanStartOv = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panStartOv
}

export const selectScenePanStartAmp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panStartAmp
}

export const selectScenePanStartPer = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panStartPer
}

export const selectScenePanEndEase = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).panEndEase
}

export const selectScenePanEndExp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panEndExp
}

export const selectScenePanEndOv = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panEndOv
}

export const selectScenePanEndAmp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panEndAmp
}

export const selectScenePanEndPer = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panEndPer
}

export const selectSceneSlideEase = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).slideEase
}

export const selectSceneSlideExp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).slideExp
}

export const selectSceneSlideOv = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).slideOv
}

export const selectSceneSlideAmp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).slideAmp
}

export const selectSceneSlidePer = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).slidePer
}

export const selectSceneStrobeEase = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).strobeEase
}

export const selectSceneStrobeExp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobeExp
}

export const selectSceneStrobeOv = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobeOv
}

export const selectSceneStrobeAmp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobeAmp
}

export const selectSceneStrobePer = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobePer
}

export const selectSceneTransEase = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).transEase
}

export const selectSceneTransExp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).transExp
}

export const selectSceneTransOv = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).transOv
}

export const selectSceneTransAmp = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).transAmp
}

export const selectSceneTransPer = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).transPer
}

export const selectScenePanHorizTransType = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).panHorizTransType
}

export const selectScenePanHorizTransRandom = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).panHorizTransRandom
}

export const selectScenePanHorizTransImg = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).panHorizTransImg
}

export const selectScenePanHorizTransLevel = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panHorizTransLevel
}

export const selectScenePanHorizTransLevelMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panHorizTransLevelMin
}

export const selectScenePanHorizTransLevelMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panHorizTransLevelMax
}

export const selectScenePanVertTransType = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).panVertTransType
}

export const selectScenePanVertTransRandom = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).panVertTransRandom
}

export const selectScenePanVertTransImg = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).panVertTransImg
}

export const selectScenePanVertTransLevel = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panVertTransLevel
}

export const selectScenePanVertTransLevelMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panVertTransLevelMin
}

export const selectScenePanVertTransLevelMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).panVertTransLevelMax
}

export const selectSceneHorizTransType = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).horizTransType
}

export const selectSceneHorizTransRandom = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).horizTransRandom
}

export const selectSceneHorizTransLevel = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).horizTransLevel
}

export const selectSceneHorizTransLevelMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).horizTransLevelMin
}

export const selectSceneHorizTransLevelMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).horizTransLevelMax
}

export const selectSceneVertTransType = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).vertTransType
}

export const selectSceneVertTransRandom = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).vertTransRandom
}

export const selectSceneVertTransLevel = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).vertTransLevel
}

export const selectSceneVertTransLevelMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).vertTransLevelMin
}

export const selectSceneVertTransLevelMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).vertTransLevelMax
}

export const selectSceneZoom = (id?: number) => {
  return (state: RootState): boolean => getSceneOrSceneSettings(state, id).zoom
}

export const selectSceneZoomRandom = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).zoomRandom
}

export const selectSceneZoomStart = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).zoomStart
}

export const selectSceneZoomEnd = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).zoomEnd
}

export const selectSceneZoomStartMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).zoomStartMin
}

export const selectSceneZoomStartMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).zoomStartMax
}

export const selectSceneZoomEndMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).zoomEndMin
}

export const selectSceneZoomEndMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).zoomEndMax
}

export const selectSceneImageTypeFilter = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).imageTypeFilter
}

export const selectSceneImageOrientation = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).imageOrientation
}

export const selectSceneGifOption = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).gifOption
}

export const selectSceneVideoOption = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).videoOption
}

export const selectSceneVideoOrientation = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).videoOrientation
}

export const selectSceneImageType = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).imageType
}

export const selectSceneBackgroundType = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).backgroundType
}

export const selectSceneBackgroundColor = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).backgroundColor
}

export const selectSceneBackgroundColorSet = (id?: number) => {
  return (state: RootState): string[] =>
    getSceneOrSceneSettings(state, id).backgroundColorSet
}

export const selectSceneSlideType = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).slideType
}

export const selectSceneSlideDistance = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).slideDistance
}

export const selectSceneStrobeColorType = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).strobeColorType
}

export const selectSceneStrobeLayer = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).strobeLayer
}

export const selectSceneStrobeOpacity = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).strobeOpacity
}

export const selectSceneNextSceneID = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).nextSceneID
}

export const selectSceneNextSceneRandoms = (id?: number) => {
  return (state: RootState): number[] =>
    getSceneOrSceneSettings(state, id).nextSceneRandoms
}

export const selectSceneNextSceneAllImages = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).nextSceneAllImages
}

export const selectScenePersistAudio = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).persistAudio
}

export const selectScenePersistText = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).persistText
}

export const selectSceneOverlays = (id?: number) => {
  return (state: RootState): number[] =>
    getSceneOrSceneSettings(state, id).overlays
}

export const selectSceneOverlayEnabled = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).overlayEnabled
}

export const selectSceneNextSceneTime = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).nextSceneTime
}

export const selectSceneBackgroundBlur = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).backgroundBlur
}

export const selectSceneRegenerate = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).regenerate
}

export const selectSceneFullSource = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).fullSource
}

export const selectSceneVideoSpeed = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).videoSpeed
}

export const selectSceneVideoRandomSpeed = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).videoRandomSpeed
}

export const selectSceneVideoSpeedMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).videoSpeedMin
}

export const selectSceneVideoSpeedMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).videoSpeedMax
}

export const selectSceneVideoSkip = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).videoSkip
}

export const selectSceneVideoVolume = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).videoVolume
}

export const selectSceneRandomVideoStart = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).randomVideoStart
}

export const selectSceneContinueVideo = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).continueVideo
}

export const selectScenePlayVideoClips = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).playVideoClips
}

export const selectSceneForceAllSource = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).forceAllSource
}

export const selectSceneForceAll = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).forceAll
}

export const selectSceneGifTimingConstant = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).gifTimingConstant
}

export const selectSceneGifTimingMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).gifTimingMin
}

export const selectSceneGifTimingMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).gifTimingMax
}

export const selectSceneVideoTimingConstant = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).videoTimingConstant
}

export const selectSceneVideoTimingMin = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).videoTimingMin
}

export const selectSceneVideoTimingMax = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).videoTimingMax
}

export const selectSceneSkipVideoStart = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).skipVideoStart
}

export const selectSceneSkipVideoEnd = (id?: number) => {
  return (state: RootState): number =>
    getSceneOrSceneSettings(state, id).skipVideoEnd
}

export const selectSceneWeightFunction = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).weightFunction
}

export const selectSceneSourceOrderFunction = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).sourceOrderFunction
}

export const selectSceneOrderFunction = (id?: number) => {
  return (state: RootState): string =>
    getSceneOrSceneSettings(state, id).orderFunction
}

export const selectSceneFirstSourceUrl = (id?: number) => {
  return (state: RootState): string | undefined => {
    const sources = getSceneOrSceneSettings(state, id).sources
    return sources !== undefined && sources.length > 0
      ? state.librarySource.entries[sources[0]]?.url
      : ''
  }
}

export const selectSceneSources = (id?: number) => {
  return (state: RootState): number[] =>
    getSceneOrSceneSettings(state, id).sources ?? []
}

export const selectSceneHasGeneratorWeights = (id?: number) => {
  return (state: RootState): boolean => {
    const scene = getSceneOrSceneSettings(state, id)
    return scene.generatorWeights != null
  }
}

export const selectSceneCrossFade = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).crossFade
}

export const selectSceneCrossFadeAudio = (id?: number) => {
  return (state: RootState): boolean =>
    getSceneOrSceneSettings(state, id).crossFadeAudio
}

export const selectSceneAudioEnabled = (id: number) => {
  return (state: RootState): boolean => getEntry(state.scene, id).audioEnabled
}

export const selectSceneAudioPlaylists = (id: number) => {
  return (state: RootState): AudioPlaylist[] =>
    getEntry(state.scene, id).audioPlaylists
}

export const selectSceneScriptPlaylist = (id: number, index: number) => {
  return (state: RootState): ScriptPlaylist =>
    getEntry(state.scene, id).scriptPlaylists[index]
}

export const selectSceneTextEnabled = (id: number) => {
  return (state: RootState): boolean => getEntry(state.scene, id).textEnabled
}

export const selectSceneScriptPlaylistLength = (id: number) => {
  return (state: RootState): number =>
    getEntry(state.scene, id).scriptPlaylists.length
}

export const selectSceneOpenTab = (id: number) => {
  return (state: RootState): number => getEntry(state.scene, id).openTab
}

export const selectSceneName = (id: number) => {
  return (state: RootState): string => getEntry(state.scene, id).name
}

export const selectSceneUseWeights = (id: number) => {
  return (state: RootState): boolean => getEntry(state.scene, id).useWeights
}

export const selectSceneGeneratorWeights = (id: number) => {
  return (state: RootState): WeightGroup[] | undefined =>
    getEntry(state.scene, id).generatorWeights
}

export const selectSceneOverrideIgnore = (id: number) => {
  return (state: RootState): boolean => getEntry(state.scene, id).overrideIgnore
}

export const selectSceneGeneratorMax = (id: number) => {
  return (state: RootState): number => getEntry(state.scene, id).generatorMax
}

export const selectSceneIsGridScene = (id: number) => {
  return (state: RootState): boolean =>
    getEntry(state.scene, id).gridScene ?? false
}

export const selectSceneIsAudioScene = (id: number) => {
  return (state: RootState): boolean =>
    getEntry(state.scene, id).audioScene ?? false
}

export const selectSceneIsScriptScene = (id: number) => {
  return (state: RootState): boolean =>
    getEntry(state.scene, id).scriptScene ?? false
}

export const selectSceneIsDownloadScene = (id: number) => {
  return (state: RootState): boolean =>
    getEntry(state.scene, id).downloadScene ?? false
}

export const selectSceneScriptPlaylists = (id: number) => {
  return (state: RootState): ScriptPlaylist[] =>
    getEntry(state.scene, id).scriptPlaylists
}

export interface EasingOptions {
  ease: string
  exp: number
  amp: number
  per: number
  ov: number
}

export interface SceneStrobeOptions {
  colorType: string
  color: string
  colorSet: string[]
  strobePulse: boolean
  strobeLayer: string
  strobeOpacity: number
  timing: TimingSettings
  delay: TimingSettings
  easing: EasingOptions
}

const selectScene = (id: number) => (state: RootState) =>
  state.scene.entries[id]

export const selectSceneStrobeOptions = (id: number) => {
  return createSelector([selectScene(id)], (scene) => {
    const timing: TimingSettings = {
      timingFunction: scene.strobeTF,
      time: scene.strobeTime,
      timeMax: scene.strobeTimeMax,
      timeMin: scene.strobeTimeMin,
      sinRate: scene.strobeSinRate,
      bpmMulti: scene.strobeBPMMulti
    }
    const delay: TimingSettings = {
      timingFunction: scene.strobeDelayTF,
      time: scene.strobeDelay,
      timeMax: scene.strobeDelayMax,
      timeMin: scene.strobeDelayMin,
      sinRate: scene.strobeDelaySinRate,
      bpmMulti: scene.strobeDelayBPMMulti
    }
    const easing = {
      ease: scene.strobeEase,
      exp: scene.strobeExp,
      amp: scene.strobeAmp,
      per: scene.strobePer,
      ov: scene.strobeOv
    }

    return {
      colorType: scene.strobeColorType,
      color: scene.strobeColor,
      colorSet: scene.strobeColorSet,
      strobePulse: scene.strobePulse,
      strobeLayer: scene.strobeLayer,
      strobeOpacity: scene.strobeOpacity,
      timing,
      delay,
      easing
    }
  })
}

export const selectSceneFadeIODelayTF = (id: number) => {
  return (state: RootState): string => getEntry(state.scene, id).fadeIODelayTF
}

export const selectSceneFadeIODelay = (id: number) => {
  return (state: RootState): number => getEntry(state.scene, id).fadeIODelay
}

export const selectSceneFadeIODelayMin = (id: number) => {
  return (state: RootState): number => getEntry(state.scene, id).fadeIODelayMin
}

export const selectSceneFadeIODelayMax = (id: number) => {
  return (state: RootState): number => getEntry(state.scene, id).fadeIODelayMax
}

export const selectSceneFadeIODelaySinRate = (id: number) => {
  return (state: RootState): number =>
    getEntry(state.scene, id).fadeIODelaySinRate
}

export const selectSceneFadeIODelayBPMMulti = (id: number) => {
  return (state: RootState): number =>
    getEntry(state.scene, id).fadeIODelayBPMMulti
}

export const selectSceneScriptStartIndex = (id: number) => {
  return (state: RootState): number =>
    getEntry(state.scene, id).scriptStartIndex
}

export const selectSceneOtherSceneNames = (id: number) => {
  return createSelector(
    [selectScene(id), getOverlayEntries, getSceneGridEntries, getSceneEntries],
    (scene, overlayEntries, gridEntries, sceneEntries) => {
      const overlays = scene?.overlays ?? []
      return overlays.map((id) => {
        const overlay = overlayEntries[id] as Overlay
        const gridID = convertSceneIDToGridID(overlay.sceneID)
        return gridID !== undefined
          ? gridEntries[gridID]?.name
          : sceneEntries[overlay.sceneID]?.name
      })
    }
  )
}

export const selectSceneLibraryID = (id: number) => {
  return (state: RootState): number => getEntry(state.scene, id).libraryID
}

export const selectSceneDisableWeightOptions = (id?: number) => {
  return (state: RootState): boolean | undefined => {
    const sources =
      id !== undefined ? getEntry(state.scene, id).sources : undefined
    return (
      sources === undefined ||
      sources.length === 0 ||
      (sources.length === 1 &&
        state.librarySource.entries[sources[0]]?.dirOfSources !== true)
    )
  }
}

export const selectSceneAudioStartIndex = (id: number) => {
  return (state: RootState): number => getEntry(state.scene, id).audioStartIndex
}

export const getNextScene = (
  state: RootState,
  id: number
): Scene | undefined => {
  const scene = getEntry(state.scene, id)
  if (scene === undefined) return undefined
  const nextID =
    scene.nextSceneID === -1 ? scene.nextSceneRandomID : scene.nextSceneID

  return getEntry(state.scene, nextID)
}

export const selectNextSceneId = (id: number) => {
  return (state: RootState): number | undefined => getNextScene(state, id)?.id
}

export const selectNextSceneSources = (id: number) => {
  return (state: RootState): number[] => getNextScene(state, id)?.sources ?? []
}

export const selectNextSceneSourcesStorage = (id: number) => {
  return createSelector(
    [
      selectNextSceneSources(id),
      getLibrarySourceEntries,
      getClipEntries,
      getTagEntries
    ],
    (sources, sourceEntries, clipEntries, tagEntries) => {
      // create copy of state, so that selector only runs when
      // librarySources, clips or tags have changed
      const state = copy<AppStorageImport>(initialAppStorageImport)
      state.librarySource.entries = sourceEntries
      state.clip.entries = clipEntries
      state.tag.entries = tagEntries

      return sources.map((id) => toLibrarySourceStorage(id, state))
    }
  )
}

export const selectNextSceneSourceOrderFunction = (id: number) => {
  return (state: RootState): string | undefined =>
    getNextScene(state, id)?.sourceOrderFunction
}

export const selectNextScenePlayVideoClips = (id: number) => {
  return (state: RootState): boolean | undefined =>
    getNextScene(state, id)?.playVideoClips
}

export const selectNextSceneImageTypeFilter = (id: number) => {
  return (state: RootState): string | undefined =>
    getNextScene(state, id)?.imageTypeFilter
}

export const selectNextSceneWeightFunction = (id: number) => {
  return (state: RootState): string | undefined =>
    getNextScene(state, id)?.weightFunction
}

export const selectSceneSelectOptions = (
  onlyExtra?: boolean,
  includeExtra?: boolean,
  includeGrids?: boolean
) => {
  return createSelector(
    [
      (state) => onlyExtra,
      (state) => includeExtra,
      (state) => includeGrids,
      getActiveSceneID,
      selectScenes(),
      selectSceneGrids()
    ],
    (onlyExtra, includeExtra, includeGrids, sceneID, scenes, grids) => {
      const options: Record<string, string> = {}
      scenes
        .filter((s) => {
          return (
            s.id !== sceneID &&
            (s.sources.length > 0 || (s.regenerate && areWeightsValid(s)))
          )
        })
        .forEach((s) => {
          if (s.name !== 'library_scene_temp') {
            options[s.id.toString()] = s.name
          }
        })

      if (includeGrids === true) {
        grids.forEach((s) => {
          const sceneID = convertGridIDToSceneID(s.id)
          if (s.name !== undefined) {
            options[sceneID.toString()] = s.name
          }
        })
      }

      if (includeExtra === true) {
        options['0'] = 'None'
        options['-1'] = 'Random'
      } else if (onlyExtra === true) {
        options['-1'] = '~~EMPTY~~'
      } else {
        options['0'] = 'None'
      }

      return options
    }
  )
}

export const selectMultiSceneSelectOptions = () => {
  return createSelector(
    [getActiveSceneID, selectScenes()],
    (sceneID: number | undefined, scenes: Scene[]): Record<string, string> => {
      const options: Record<string, string> = {}
      scenes
        .filter((s) => s.id !== sceneID && s.sources.length > 0)
        .forEach((s) => (options[s.id.toString()] = s.name))

      return options
    }
  )
}

export const videoClipperSceneName = 'video_clipper_scene_temp'
export const getVideoClipperScene = (state: RootState) => {
  return Object.values(state.scene.entries).find(
    (s) => s.name === videoClipperSceneName
  ) as Scene
}

export const selectVideoClipperScene = () => {
  return (state: RootState) => getVideoClipperScene(state)
}

export const selectVideoClipperSceneID = () => {
  return (state: RootState) => getVideoClipperScene(state)?.id
}

export const selectVideoClipperSceneVideoVolume = () => {
  return (state: RootState) => getVideoClipperScene(state).volume
}

export const selectSceneAudioPlaylistDuration = (
  id: number,
  playlistIndex: number
) => {
  return (state: RootState): number => {
    const scene = getEntry(state.scene, id)
    const playlist = scene.audioPlaylists[playlistIndex]
    return playlist.audios?.reduce(
      (total, audioID) => total + (state.audio.entries[audioID]?.duration ?? 0),
      0
    )
  }
}

export const selectSceneGeneratorWeightsValid = (id: number) => {
  return (state: RootState): boolean => {
    const scene = getEntry(state.scene, id)
    return areWeightsValid(scene)
  }
}

export const selectSceneEffectsBase64 = (id: number) => {
  return (state: RootState): string => {
    const scene = getEntry(state.scene, id)
    return getEffects(scene)
  }
}

export const getSceneEntries = (state: RootState) => state.scene.entries

export const selectScenes = () => {
  return createSelector([getAppScenes, getSceneEntries], (ids, entries) =>
    ids.map((id) => entries[id] as Scene)
  )
}
