import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type Progress from './data/Progress'
import { DONE, SPT, VCT, SP } from 'flipflip-common'
import type App from './data/App'
import { initialApp } from './data/App'
import { newConfig } from './data/Config'
import type Route from './data/Route'
import { newRoute } from './data/Route'
import { arrayMove } from '../../data/utils'
import { ColorPartial } from '@mui/material/styles/createPalette'

const initialState = initialApp
export const appSlice = createSlice({
  name: 'app',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setAppSlice: (state, action: PayloadAction<App>) => {
      Object.assign(state, action.payload)
    },
    setSpecialMode: (state, action: PayloadAction<string | undefined>) => {
      state.specialMode = action.payload
    },
    setDisplayedSources: (state, action: PayloadAction<number[]>) => {
      state.displayedSources = action.payload
    },
    setOpenTab: (state, action: PayloadAction<number>) => {
      state.openTab = action.payload
    },
    setDefaultConfig: (state, action: PayloadAction<void>) => {
      state.config = newConfig()
    },
    setConfigNewWindowAlerted: (state, action: PayloadAction<boolean>) => {
      state.config.newWindowAlerted = action.payload
    },
    setConfigDefaultSceneBackForth: (state, action: PayloadAction<boolean>) => {
      state.config.defaultScene.backForth = action.payload
    },
    setConfigDefaultSceneBackForthBPMMulti: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.backForthBPMMulti = action.payload
    },
    setConfigDefaultSceneBackForthDuration: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.backForthDuration = action.payload
    },
    setConfigDefaultSceneBackForthDurationMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.backForthDurationMax = action.payload
    },
    setConfigDefaultSceneBackForthDurationMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.backForthDurationMin = action.payload
    },
    setConfigDefaultSceneBackForthSinRate: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.backForthSinRate = action.payload
    },
    setConfigDefaultSceneBackForthTF: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.backForthTF = action.payload
    },
    setConfigDefaultSceneBackgroundBlur: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.backgroundBlur = action.payload
    },
    setConfigDefaultSceneBackgroundColor: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.backgroundColor = action.payload
    },
    setConfigDefaultSceneBackgroundColorSet: (
      state,
      action: PayloadAction<string[]>
    ) => {
      state.config.defaultScene.backgroundColorSet = action.payload
    },
    setConfigDefaultSceneBackgroundType: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.backgroundType = action.payload
    },
    setConfigDefaultSceneImageType: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.imageType = action.payload
    },
    setConfigDefaultSceneNextSceneAllImages: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.nextSceneAllImages = action.payload
    },
    setConfigDefaultSceneNextSceneTime: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.nextSceneTime = action.payload
    },
    setConfigDefaultSceneOverlayEnabled: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.overlayEnabled = action.payload
    },
    setConfigDefaultScenePersistAudio: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.persistAudio = action.payload
    },
    setConfigDefaultScenePersistText: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.persistText = action.payload
    },
    setConfigDefaultSceneTimingBPMMulti: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.timingBPMMulti = action.payload
    },
    setConfigDefaultSceneTimingDuration: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.timingDuration = action.payload
    },
    setConfigDefaultSceneTimingDurationMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.timingDurationMax = action.payload
    },
    setConfigDefaultSceneTimingDurationMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.timingDurationMin = action.payload
    },
    setConfigDefaultSceneTimingSinRate: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.timingSinRate = action.payload
    },
    setConfigDefaultSceneTimingTF: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.timingFunction = action.payload
    },
    setConfigDefaultSceneImageTypeFilter: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.imageTypeFilter = action.payload
    },
    setConfigDefaultSceneImageOrientation: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.imageOrientation = action.payload
    },
    setConfigDefaultSceneGifOption: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.gifOption = action.payload
    },
    setConfigDefaultSceneVideoOption: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.videoOption = action.payload
    },
    setConfigDefaultSceneVideoOrientation: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.videoOrientation = action.payload
    },
    setConfigDefaultSceneRegenerate: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.regenerate = action.payload
    },
    setConfigDefaultSceneFullSource: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.fullSource = action.payload
    },
    setConfigDefaultSceneVideoSpeed: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.videoSpeed = action.payload
    },
    setConfigDefaultSceneVideoRandomSpeed: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.videoRandomSpeed = action.payload
    },
    setConfigDefaultSceneVideoSpeedMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.videoSpeedMin = action.payload
    },
    setConfigDefaultSceneVideoSpeedMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.videoSpeedMax = action.payload
    },
    setConfigDefaultSceneVideoSkip: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.videoSkip = action.payload
    },
    setConfigDefaultSceneVideoVolume: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.videoVolume = action.payload
    },
    setConfigDefaultSceneRandomVideoStart: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.randomVideoStart = action.payload
    },
    setConfigDefaultSceneContinueVideo: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.continueVideo = action.payload
    },
    setConfigDefaultScenePlayVideoClips: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.playVideoClips = action.payload
    },
    setConfigDefaultSceneForceAllSource: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.forceAllSource = action.payload
    },
    setConfigDefaultSceneForceAll: (state, action: PayloadAction<boolean>) => {
      state.config.defaultScene.forceAll = action.payload
    },
    setConfigDefaultSceneGifTimingConstant: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.gifTimingConstant = action.payload
    },
    setConfigDefaultSceneGifTimingMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.gifTimingMin = action.payload
    },
    setConfigDefaultSceneGifTimingMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.gifTimingMax = action.payload
    },
    setConfigDefaultSceneVideoTimingConstant: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.videoTimingConstant = action.payload
    },
    setConfigDefaultSceneVideoTimingMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.videoTimingMin = action.payload
    },
    setConfigDefaultSceneVideoTimingMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.videoTimingMax = action.payload
    },
    setConfigDefaultSceneSkipVideoStart: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.skipVideoStart = action.payload
    },
    setConfigDefaultSceneSkipVideoEnd: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.skipVideoEnd = action.payload
    },
    setConfigDefaultSceneWeightFunction: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.weightFunction = action.payload
    },
    setConfigDefaultSceneSourceOrderFunction: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.sourceOrderFunction = action.payload
    },
    setConfigDefaultSceneOrderFunction: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.orderFunction = action.payload
    },
    setConfigDefaultSceneFadeTF: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.orderFunction = action.payload
    },
    setConfigDefaultSceneFadeDuration: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeDuration = action.payload
    },
    setConfigDefaultSceneFadeDurationMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeDurationMin = action.payload
    },
    setConfigDefaultSceneFadeDurationMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeDurationMax = action.payload
    },
    setConfigDefaultSceneFadeSinRate: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeSinRate = action.payload
    },
    setConfigDefaultSceneFadeBPMMulti: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeBPMMulti = action.payload
    },
    setConfigDefaultSceneFadeExp: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.fadeExp = action.payload
    },
    setConfigDefaultSceneFadeOv: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.fadeOv = action.payload
    },
    setConfigDefaultSceneFadeAmp: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.fadeAmp = action.payload
    },
    setConfigDefaultSceneFadePer: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.fadePer = action.payload
    },
    setConfigDefaultSceneFadeEase: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.fadeEase = action.payload
    },
    setConfigDefaultSceneCrossFade: (state, action: PayloadAction<boolean>) => {
      state.config.defaultScene.crossFade = action.payload
    },
    setConfigDefaultSceneCrossFadeAudio: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.crossFadeAudio = action.payload
    },
    setConfigDefaultSceneSlide: (state, action: PayloadAction<boolean>) => {
      state.config.defaultScene.slide = action.payload
    },
    setConfigDefaultSceneSlideTF: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.slideTF = action.payload
    },
    setConfigDefaultSceneSlideDuration: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.slideDuration = action.payload
    },
    setConfigDefaultSceneSlideDurationMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.slideDurationMin = action.payload
    },
    setConfigDefaultSceneSlideDurationMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.slideDurationMax = action.payload
    },
    setConfigDefaultSceneSlideSinRate: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.slideSinRate = action.payload
    },
    setConfigDefaultSceneSlideBPMMulti: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.slideBPMMulti = action.payload
    },
    setConfigDefaultSceneSlideEase: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.slideEase = action.payload
    },
    setConfigDefaultSceneSlideExp: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.slideExp = action.payload
    },
    setConfigDefaultSceneSlideOv: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.slideOv = action.payload
    },
    setConfigDefaultSceneSlideAmp: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.slideAmp = action.payload
    },
    setConfigDefaultSceneSlidePer: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.slidePer = action.payload
    },
    setConfigDefaultSceneSlideType: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.slideType = action.payload
    },
    setConfigDefaultSceneSlideDistance: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.slideDistance = action.payload
    },
    setConfigDefaultSceneStrobe: (state, action: PayloadAction<boolean>) => {
      state.config.defaultScene.strobe = action.payload
    },
    setConfigDefaultSceneStrobePulse: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.strobePulse = action.payload
    },
    setConfigDefaultSceneStrobeTF: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.strobeTF = action.payload
    },
    setConfigDefaultSceneStrobeDuration: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.strobeTime = action.payload
    },
    setConfigDefaultSceneStrobeDurationMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.strobeTimeMin = action.payload
    },
    setConfigDefaultSceneStrobeDurationMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.strobeTimeMax = action.payload
    },
    setConfigDefaultSceneStrobeSinRate: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.strobeSinRate = action.payload
    },
    setConfigDefaultSceneStrobeBPMMulti: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.strobeBPMMulti = action.payload
    },
    setConfigDefaultSceneStrobeDelayTF: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.strobeDelayTF = action.payload
    },
    setConfigDefaultSceneStrobeDelayDuration: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.strobeDelay = action.payload
    },
    setConfigDefaultSceneStrobeDelayDurationMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.strobeDelayMin = action.payload
    },
    setConfigDefaultSceneStrobeDelayDurationMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.strobeDelayMax = action.payload
    },
    setConfigDefaultSceneStrobeDelaySinRate: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.strobeDelaySinRate = action.payload
    },
    setConfigDefaultSceneStrobeDelayBPMMulti: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.strobeDelayBPMMulti = action.payload
    },
    setConfigDefaultSceneStrobeEase: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.strobeEase = action.payload
    },
    setConfigDefaultSceneStrobeExp: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.strobeExp = action.payload
    },
    setConfigDefaultSceneStrobeOv: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.strobeOv = action.payload
    },
    setConfigDefaultSceneStrobeAmp: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.strobeAmp = action.payload
    },
    setConfigDefaultSceneStrobePer: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.strobePer = action.payload
    },
    setConfigDefaultSceneStrobeColorType: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.strobeColorType = action.payload
    },
    setConfigDefaultSceneStrobeLayer: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.strobeLayer = action.payload
    },
    setConfigDefaultSceneStrobeOpacity: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.strobeOpacity = action.payload
    },
    setConfigDefaultSceneStrobeColor: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.strobeColor = action.payload
    },
    setConfigDefaultSceneStrobeColorSet: (
      state,
      action: PayloadAction<string[]>
    ) => {
      state.config.defaultScene.strobeColorSet = action.payload
    },
    setConfigDefaultSceneZoomTF: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.zoomTF = action.payload
    },
    setConfigDefaultSceneZoomDuration: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.transDuration = action.payload
    },
    setConfigDefaultSceneZoomDurationMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.transDurationMin = action.payload
    },
    setConfigDefaultSceneZoomDurationMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.transDurationMax = action.payload
    },
    setConfigDefaultSceneZoomSinRate: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.transSinRate = action.payload
    },
    setConfigDefaultSceneZoomBPMMulti: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.transBPMMulti = action.payload
    },
    setConfigDefaultSceneTransEase: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.transEase = action.payload
    },
    setConfigDefaultSceneTransExp: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.transExp = action.payload
    },
    setConfigDefaultSceneTransOv: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.transOv = action.payload
    },
    setConfigDefaultSceneTransAmp: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.transAmp = action.payload
    },
    setConfigDefaultSceneTransPer: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.transPer = action.payload
    },
    setConfigDefaultSceneHorizTransType: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.horizTransType = action.payload
    },
    setConfigDefaultSceneHorizTransRandom: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.horizTransRandom = action.payload
    },
    setConfigDefaultSceneHorizTransLevel: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.horizTransLevel = action.payload
    },
    setConfigDefaultSceneHorizTransLevelMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.horizTransLevelMin = action.payload
    },
    setConfigDefaultSceneHorizTransLevelMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.horizTransLevelMax = action.payload
    },
    setConfigDefaultSceneVertTransType: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.vertTransType = action.payload
    },
    setConfigDefaultSceneVertTransRandom: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.vertTransRandom = action.payload
    },
    setConfigDefaultSceneVertTransLevel: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.vertTransLevel = action.payload
    },
    setConfigDefaultSceneVertTransLevelMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.vertTransLevelMin = action.payload
    },
    setConfigDefaultSceneVertTransLevelMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.vertTransLevelMax = action.payload
    },
    setConfigDefaultSceneZoom: (state, action: PayloadAction<boolean>) => {
      state.config.defaultScene.zoom = action.payload
    },
    setConfigDefaultSceneZoomRandom: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.zoomRandom = action.payload
    },
    setConfigDefaultSceneZoomStart: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.zoomStart = action.payload
    },
    setConfigDefaultSceneZoomEnd: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.zoomEnd = action.payload
    },
    setConfigDefaultSceneZoomStartMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.zoomStartMin = action.payload
    },
    setConfigDefaultSceneZoomStartMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.zoomStartMax = action.payload
    },
    setConfigDefaultSceneZoomEndMin: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.zoomEndMin = action.payload
    },
    setConfigDefaultSceneZoomEndMax: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.zoomEndMax = action.payload
    },
    setConfigDefaultSceneFadeInOut: (state, action: PayloadAction<boolean>) => {
      state.config.defaultScene.fadeInOut = action.payload
    },
    setConfigDefaultSceneFadeIOTF: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.fadeIOTF = action.payload
    },
    setConfigDefaultSceneFadeIODuration: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeIODuration = action.payload
    },
    setConfigDefaultSceneFadeIODurationMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeIODurationMin = action.payload
    },
    setConfigDefaultSceneFadeIODurationMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeIODurationMax = action.payload
    },
    setConfigDefaultSceneFadeIOSinRate: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeIOSinRate = action.payload
    },
    setConfigDefaultSceneFadeIOBPMMulti: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeIOBPMMulti = action.payload
    },
    setConfigDefaultSceneFadeIOStartExp: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeIOStartExp = action.payload
    },
    setConfigDefaultSceneFadeIOStartOv: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeIOStartOv = action.payload
    },
    setConfigDefaultSceneFadeIOStartAmp: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeIOStartAmp = action.payload
    },
    setConfigDefaultSceneFadeIOStartPer: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeIOStartPer = action.payload
    },
    setConfigDefaultSceneFadeIOEndExp: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeIOEndExp = action.payload
    },
    setConfigDefaultSceneFadeIOEndOv: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeIOEndOv = action.payload
    },
    setConfigDefaultSceneFadeIOEndAmp: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeIOEndAmp = action.payload
    },
    setConfigDefaultSceneFadeIOEndPer: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.fadeIOEndPer = action.payload
    },
    setConfigDefaultSceneFadeIOStartEase: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.fadeIOStartEase = action.payload
    },
    setConfigDefaultSceneFadeIOEndEase: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.fadeIOEndEase = action.payload
    },
    setConfigDefaultScenePanning: (state, action: PayloadAction<boolean>) => {
      state.config.defaultScene.panning = action.payload
    },
    setConfigDefaultScenePanTF: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.panTF = action.payload
    },
    setConfigDefaultScenePanDuration: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.panDuration = action.payload
    },
    setConfigDefaultScenePanDurationMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.panDurationMin = action.payload
    },
    setConfigDefaultScenePanDurationMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.panDurationMax = action.payload
    },
    setConfigDefaultScenePanSinRate: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.panSinRate = action.payload
    },
    setConfigDefaultScenePanBPMMulti: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.panBPMMulti = action.payload
    },
    setConfigDefaultScenePanStartEase: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.panStartEase = action.payload
    },
    setConfigDefaultScenePanStartExp: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.panStartExp = action.payload
    },
    setConfigDefaultScenePanStartOv: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.panStartOv = action.payload
    },
    setConfigDefaultScenePanStartAmp: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.panStartAmp = action.payload
    },
    setConfigDefaultScenePanStartPer: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.panStartPer = action.payload
    },
    setConfigDefaultScenePanEndEase: (state, action: PayloadAction<string>) => {
      state.config.defaultScene.panEndEase = action.payload
    },
    setConfigDefaultScenePanEndExp: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.panEndExp = action.payload
    },
    setConfigDefaultScenePanEndOv: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.panEndOv = action.payload
    },
    setConfigDefaultScenePanEndAmp: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.panEndAmp = action.payload
    },
    setConfigDefaultScenePanEndPer: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.panEndPer = action.payload
    },
    setConfigDefaultScenePanHorizTransType: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.panHorizTransType = action.payload
    },
    setConfigDefaultScenePanHorizTransRandom: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.panHorizTransRandom = action.payload
    },
    setConfigDefaultScenePanHorizTransImg: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.panHorizTransImg = action.payload
    },
    setConfigDefaultScenePanHorizTransLevel: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.panHorizTransLevel = action.payload
    },
    setConfigDefaultScenePanHorizTransLevelMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.panHorizTransLevelMin = action.payload
    },
    setConfigDefaultScenePanHorizTransLevelMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.panHorizTransLevelMax = action.payload
    },
    setConfigDefaultScenePanVertTransType: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.defaultScene.panVertTransType = action.payload
    },
    setConfigDefaultScenePanVertTransRandom: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.panVertTransRandom = action.payload
    },
    setConfigDefaultScenePanVertTransImg: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.defaultScene.panVertTransImg = action.payload
    },
    setConfigDefaultScenePanVertTransLevel: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.panVertTransLevel = action.payload
    },
    setConfigDefaultScenePanVertTransLevelMin: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.panVertTransLevelMin = action.payload
    },
    setConfigDefaultScenePanVertTransLevelMax: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.panVertTransLevelMax = action.payload
    },
    setConfigDefaultSceneAddOverlay: (state, action: PayloadAction<number>) => {
      state.config.defaultScene.overlays.push(action.payload)
    },
    setConfigDefaultSceneRemoveOverlay: (
      state,
      action: PayloadAction<number>
    ) => {
      const index = state.config.defaultScene.overlays.indexOf(action.payload)
      state.config.defaultScene.overlays.splice(index, 1)
    },
    setConfigDefaultSceneNextSceneRandoms: (
      state,
      action: PayloadAction<number[]>
    ) => {
      state.config.defaultScene.nextSceneRandoms = action.payload
    },
    setConfigDefaultSceneNextSceneID: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.defaultScene.nextSceneID = action.payload
    },
    setConfigTutorialsScenePicker: (state, action: PayloadAction<string>) => {
      state.config.tutorials.scenePicker = action.payload
    },
    setConfigTutorialsSceneGenerator: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.tutorials.sceneGenerator = action.payload
    },
    setConfigTutorialsSceneDetail: (state, action: PayloadAction<string>) => {
      state.config.tutorials.sceneDetail = action.payload
    },
    setConfigTutorialsPlayer: (state, action: PayloadAction<string>) => {
      state.config.tutorials.player = action.payload
    },
    setConfigTutorialsLibrary: (state, action: PayloadAction<string>) => {
      state.config.tutorials.library = action.payload
    },
    setConfigTutorialsAudios: (state, action: PayloadAction<string>) => {
      state.config.tutorials.audios = action.payload
    },
    setConfigTutorialsScripts: (state, action: PayloadAction<string>) => {
      state.config.tutorials.scripts = action.payload
    },
    setConfigTutorialsScriptor: (state, action: PayloadAction<string>) => {
      state.config.tutorials.scriptor = action.payload
    },
    setConfigTutorialsSceneGrid: (state, action: PayloadAction<string>) => {
      state.config.tutorials.sceneGrid = action.payload
    },
    setConfigTutorialsVideoClipper: (state, action: PayloadAction<string>) => {
      state.config.tutorials.videoClipper = action.payload
    },
    setConfigDisplaySettingsFullScreen: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.displaySettings.fullScreen = action.payload
    },
    setConfigDisplaySettingsStartImmediately: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.displaySettings.startImmediately = action.payload
    },
    setConfigDisplaySettingsClickToProgress: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.displaySettings.clickToProgress = action.payload
    },
    setConfigDisplaySettingsClickToProgressWhilePlaying: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.displaySettings.clickToProgressWhilePlaying = action.payload
    },
    setConfigDisplaySettingsEasingControls: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.displaySettings.easingControls = action.payload
    },
    setConfigDisplaySettingsAudioAlert: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.displaySettings.audioAlert = action.payload
    },
    setConfigDisplaySettingsCloneGridVideoElements: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.displaySettings.cloneGridVideoElements = action.payload
    },
    setConfigDisplaySettingsIgnoredTags: (
      state,
      action: PayloadAction<string[]>
    ) => {
      state.config.displaySettings.ignoredTags = action.payload
    },
    setConfigDisplaySettingsMinImageSize: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.displaySettings.minImageSize = action.payload
    },
    setConfigDisplaySettingsMinVideoSize: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.displaySettings.minVideoSize = action.payload
    },
    setConfigDisplaySettingsMaxInHistory: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.displaySettings.maxInHistory = action.payload
    },
    setConfigDisplaySettingsMaxInMemory: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.displaySettings.maxInMemory = action.payload
    },
    setConfigDisplaySettingsMaxLoadingAtOnce: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.displaySettings.maxLoadingAtOnce = action.payload
    },
    setConfigGeneralSettingsWatermark: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.generalSettings.watermark = action.payload
    },
    setConfigGeneralSettingsWatermarkGrid: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.generalSettings.watermarkGrid = action.payload
    },
    setConfigGeneralSettingsWatermarkCorner: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.generalSettings.watermarkCorner = action.payload
    },
    setConfigGeneralSettingsWatermarkFontFamily: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.generalSettings.watermarkFontFamily = action.payload
    },
    setConfigGeneralSettingsWatermarkColor: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.generalSettings.watermarkColor = action.payload
    },
    setConfigGeneralSettingsWatermarkText: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.generalSettings.watermarkText = action.payload
    },
    setConfigGeneralSettingsWatermarkFontSize: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.generalSettings.watermarkFontSize = action.payload
    },
    setConfigGeneralSettingsPrioritizePerformance: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.generalSettings.prioritizePerformance = action.payload
    },
    setConfigGeneralSettingsConfirmSceneDeletion: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.generalSettings.confirmSceneDeletion = action.payload
    },
    setConfigGeneralSettingsConfirmBlacklist: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.generalSettings.confirmBlacklist = action.payload
    },
    setConfigGeneralSettingsConfirmFileDeletion: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.generalSettings.confirmFileDeletion = action.payload
    },
    setConfigGeneralSettingsPortableMode: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.generalSettings.portableMode = action.payload
    },
    setConfigGeneralSettingsDisableLocalSave: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.generalSettings.disableLocalSave = action.payload
    },
    setConfigGeneralSettingsAutoBackup: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.generalSettings.autoBackup = action.payload
    },
    setConfigGeneralSettingsAutoCleanBackup: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.generalSettings.autoCleanBackup = action.payload
    },
    setConfigGeneralSettingsAutoBackupDays: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.generalSettings.autoBackupDays = action.payload
    },
    setConfigGeneralSettingsAutoCleanBackupDays: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.generalSettings.autoCleanBackupDays = action.payload
    },
    setConfigGeneralSettingsAutoCleanBackupWeeks: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.generalSettings.autoCleanBackupWeeks = action.payload
    },
    setConfigGeneralSettingsAutoCleanBackupMonths: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.generalSettings.autoCleanBackupMonths = action.payload
    },
    setConfigGeneralSettingsCleanRetain: (
      state,
      action: PayloadAction<number>
    ) => {
      state.config.generalSettings.cleanRetain = action.payload
    },
    setConfigCachingEnabled: (state, action: PayloadAction<boolean>) => {
      state.config.caching.enabled = action.payload
    },
    setConfigCachingDirectory: (state, action: PayloadAction<string>) => {
      state.config.caching.directory = action.payload
    },
    setConfigCachingMaxSize: (state, action: PayloadAction<number>) => {
      state.config.caching.maxSize = action.payload
    },
    setConfigRemoteSettingsSilenceTumblrAlert: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.config.remoteSettings.silenceTumblrAlert = action.payload
    },
    setConfigRemoteSettingsTumblrKey: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.tumblrKey = action.payload
    },
    setConfigRemoteSettingsTumblrSecret: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.tumblrSecret = action.payload
    },
    setConfigRemoteSettingsTumblrOAuthToken: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.tumblrOAuthToken = action.payload
    },
    setConfigRemoteSettingsTumblrOAuthTokenSecret: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.tumblrOAuthTokenSecret = action.payload
    },
    setConfigRemoteSettingsRedditDeviceID: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.redditDeviceID = action.payload
    },
    setConfigRemoteSettingsRedditRefreshToken: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.redditRefreshToken = action.payload
    },
    setConfigRemoteSettingsTwitterAccessTokenKey: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.twitterAccessTokenKey = action.payload
    },
    setConfigRemoteSettingsTwitterAccessTokenSecret: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.twitterAccessTokenSecret = action.payload
    },
    setConfigRemoteSettingsInstagramUsername: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.instagramUsername = action.payload
    },
    setConfigRemoteSettingsInstagramPassword: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.instagramPassword = action.payload
    },
    setConfigRemoteSettingsHydrusProtocol: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.hydrusProtocol = action.payload
    },
    setConfigRemoteSettingsHydrusDomain: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.hydrusDomain = action.payload
    },
    setConfigRemoteSettingsHydrusPort: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.hydrusPort = action.payload
    },
    setConfigRemoteSettingsHydrusAPIKey: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.hydrusAPIKey = action.payload
    },
    setConfigRemoteSettingsPiwigoProtocol: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.piwigoProtocol = action.payload
    },
    setConfigRemoteSettingsPiwigoHost: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.piwigoHost = action.payload
    },
    setConfigRemoteSettingsPiwigoUsername: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.piwigoUsername = action.payload
    },
    setConfigRemoteSettingsPiwigoPassword: (
      state,
      action: PayloadAction<string>
    ) => {
      state.config.remoteSettings.piwigoPassword = action.payload
    },
    setThemeMode: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state.theme.palette!.mode = 'dark'
        state.theme.palette!.background = {}
      } else {
        const primary = state.theme.palette!.primary as ColorPartial
        state.theme.palette!.mode = 'light'
        state.theme.palette!.background = {
          default: primary[50]
        }
      }
    },
    setThemePalettePrimary: (
      state,
      action: PayloadAction<Record<string, string>>
    ) => {
      state.theme.palette!.primary = action.payload
    },
    setThemePaletteSecondary: (
      state,
      action: PayloadAction<Record<string, string>>
    ) => {
      state.theme.palette!.secondary = action.payload
    },
    setTutorialStart: (state, action: PayloadAction<void>) => {
      if (state.config.tutorials.scenePicker == null) {
        state.tutorial = SPT.welcome
      }
    },
    setTutorialVCTStart: (state, action: PayloadAction<void>) => {
      if (state.config.tutorials.videoClipper == null) {
        state.tutorial = VCT.welcome
      }
    },
    setTutorial: (state, action: PayloadAction<string | undefined>) => {
      state.tutorial = action.payload
    },
    setSkipAllTutorials: (state, action: PayloadAction<void>) => {
      state.config.tutorials.scenePicker = DONE
      state.config.tutorials.sceneDetail = DONE
      state.config.tutorials.player = DONE
      state.config.tutorials.library = DONE
      state.config.tutorials.audios = DONE
      state.config.tutorials.scripts = DONE
      state.config.tutorials.scriptor = DONE
      state.config.tutorials.sceneGenerator = DONE
      state.config.tutorials.sceneGrid = DONE
      state.config.tutorials.videoClipper = DONE
      state.tutorial = undefined
    },
    setResetAllTutorials: (state, action: PayloadAction<void>) => {
      state.config.tutorials.scenePicker = undefined
      state.config.tutorials.sceneDetail = undefined
      state.config.tutorials.player = undefined
      state.config.tutorials.library = undefined
      state.config.tutorials.audios = undefined
      state.config.tutorials.scripts = undefined
      state.config.tutorials.scriptor = undefined
      state.config.tutorials.sceneGenerator = undefined
      state.config.tutorials.sceneGrid = undefined
      state.config.tutorials.videoClipper = undefined
      state.tutorial = undefined
    },
    closeMessage: (state, action: PayloadAction<void>) => {
      state.systemMessage = undefined
      state.systemSnack = undefined
      state.systemSnackSeverity = undefined
    },
    systemMessage: (state, action: PayloadAction<string>) => {
      state.systemMessage = action.payload
    },
    systemSnack: (
      state,
      action: PayloadAction<{ message: string; severity: string }>
    ) => {
      state.systemSnack = action.payload.message
      state.systemSnackSeverity = action.payload.severity
    },
    addRoutes: (state, action: PayloadAction<Route[]>) => {
      state.route.push(...action.payload)
    },
    setRoute: (state, action: PayloadAction<Route[]>) => {
      state.route = action.payload
    },
    setRoutePop: (state, action: PayloadAction<number>) => {
      for (let i = 0; i < action.payload; i++) {
        state.route.pop()
      }
    },
    setAppTags: (state, action: PayloadAction<number[]>) => {
      state.tags = action.payload
    },
    addToTags: (state, action: PayloadAction<number[]>) => {
      state.tags.push(...action.payload)
    },
    setAppScenes: (state, action: PayloadAction<number[]>) => {
      state.scenes = action.payload
    },
    addToScenes: (state, action: PayloadAction<number>) => {
      state.scenes.push(action.payload)
    },
    removeFromScenes: (state, action: PayloadAction<number[]>) => {
      state.scenes = state.scenes.filter((s) => !action.payload.includes(s))
    },
    addToGrids: (state, action: PayloadAction<number>) => {
      state.grids.push(action.payload)
    },
    removeFromGrids: (state, action: PayloadAction<number[]>) => {
      state.grids = state.grids.filter((s) => !action.payload.includes(s))
    },
    addToSceneGroups: (state, action: PayloadAction<number>) => {
      state.sceneGroups.push(action.payload)
    },
    removeFromSceneGroups: (state, action: PayloadAction<number>) => {
      const index = state.sceneGroups.indexOf(action.payload)
      state.sceneGroups.splice(index, 1)
    },
    setLibrary: (state, action: PayloadAction<number[]>) => {
      state.library = action.payload
    },
    addToLibrary: (state, action: PayloadAction<number[]>) => {
      state.library.push(...action.payload)
    },
    setAudiosAddAtStart: (state, action: PayloadAction<number>) => {
      state.audios.unshift(action.payload)
    },
    addToAudios: (state, action: PayloadAction<number[]>) => {
      state.audios.push(...action.payload)
    },
    addToScripts: (state, action: PayloadAction<number[]>) => {
      state.scripts.push(...action.payload)
    },
    addToScriptsAtStart: (state, action: PayloadAction<number[]>) => {
      state.scripts.unshift(...action.payload)
    },
    moveScenes: (
      state,
      action: PayloadAction<{ oldIndex: number; newIndex: number }>
    ) => {
      const { oldIndex, newIndex } = action.payload
      arrayMove(state.scenes, oldIndex, newIndex)
    },
    moveGrids: (
      state,
      action: PayloadAction<{ oldIndex: number; newIndex: number }>
    ) => {
      const { oldIndex, newIndex } = action.payload
      arrayMove(state.grids, oldIndex, newIndex)
    },
    moveSceneGroups: (
      state,
      action: PayloadAction<{ oldIndex: number; newIndex: number }>
    ) => {
      const { oldIndex, newIndex } = action.payload
      arrayMove(state.sceneGroups, oldIndex, newIndex)
    },
    setSystemSnack: (
      state,
      action: PayloadAction<{ message: string; severity: string }>
    ) => {
      state.systemSnack = action.payload.message
      state.systemSnackSeverity = action.payload.severity
      state.systemSnackOpen = true
    },
    addTracks: (state, action: PayloadAction<number>) => {
      state.route.push(newRoute({ kind: 'audios', value: action.payload }))
      state.specialMode = SP.select
      state.audioSelected = []
      state.audioOpenTab = 3
    },
    addScript: (state, action: PayloadAction<number>) => {
      state.route.push(newRoute({ kind: 'scripts', value: action.payload }))
      state.specialMode = SP.select
      state.scriptSelected = []
    },
    addScriptSingle: (state, action: PayloadAction<void>) => {
      state.route.push(newRoute({ kind: 'scripts' }))
      state.specialMode = SP.selectSingle
      state.scriptSelected = []
    },
    openLibraryImport: (state, action: PayloadAction<void>) => {
      state.route.push(newRoute({ kind: 'library' }))
      state.specialMode = SP.select
      state.librarySelected = []
    },
    setAudioFilters: (state, action: PayloadAction<string[]>) => {
      state.audioFilters = action.payload
    },
    setAudioSelected: (state, action: PayloadAction<number[]>) => {
      state.audioSelected = action.payload
    },
    setAudioOpenTab: (state, action: PayloadAction<number>) => {
      state.audioOpenTab = action.payload
    },
    setProgress: (state, action: PayloadAction<Progress>) => {
      const { current, total, mode, title, next } = action.payload
      state.progressMode = mode
      state.progressTitle = title
      state.progressCurrent = current ?? 0
      state.progressTotal = total ?? 0
      state.progressNext = next
    },
    setProgressMode: (state, action: PayloadAction<string>) => {
      state.progressMode = action.payload
    },
    setAudios: (state, action: PayloadAction<number[]>) => {
      state.audios = action.payload
      state.audioSelected = state.audioSelected.filter((id) =>
        state.audios.includes(id)
      )
    },
    setScripts: (state, action: PayloadAction<number[]>) => {
      state.scripts = action.payload
      state.scriptSelected = state.scriptSelected.filter((id) =>
        state.scripts.includes(id)
      )
    },
    removeAudios: (state, action: PayloadAction<number[]>) => {
      state.audios = state.audios.filter((id) => !action.payload.includes(id))
      state.audioSelected = state.audioSelected.filter((id) =>
        state.audios.includes(id)
      )
    },
    setPlaylists: (state, action: PayloadAction<number[]>) => {
      state.playlists = action.payload
    },
    addToPlaylist: (state, action: PayloadAction<void>) => {
      state.specialMode =
        state.specialMode !== SP.addToPlaylist ? SP.addToPlaylist : undefined
      state.audioOpenTab = 3
    },
    batchClip: (state, action: PayloadAction<void>) => {
      state.specialMode =
        state.specialMode !== SP.batchClip ? SP.batchClip : undefined
      state.audioOpenTab = 3
    },
    batchTag: (state, action: PayloadAction<void>) => {
      state.specialMode =
        state.specialMode !== SP.batchTag ? SP.batchTag : undefined
      state.audioOpenTab = 3
    },
    batchEdit: (state, action: PayloadAction<void>) => {
      state.specialMode =
        state.specialMode !== SP.batchEdit ? SP.batchEdit : undefined
      state.audioOpenTab = 3
    },
    manageTags: (state, action: PayloadAction<void>) => {
      state.route.push(newRoute({ kind: 'tags' }))
    },
    setScriptFilters: (state, action: PayloadAction<string[]>) => {
      state.scriptFilters = action.payload
    },
    setScriptSelected: (state, action: PayloadAction<number[]>) => {
      state.scriptSelected = action.payload
    },
    setScriptsRemoveAll: (state, action: PayloadAction<void>) => {
      state.scripts = []
      state.scriptSelected = []
    },
    setScriptsRemove: (state, action: PayloadAction<number[]>) => {
      state.scripts = state.scripts.filter((id) => !action.payload.includes(id))
      state.scriptSelected = state.scriptSelected.filter((id) =>
        state.scripts.includes(id)
      )
    },
    setScriptsRemoveOne: (state, action: PayloadAction<number>) => {
      const index = state.scripts.indexOf(action.payload)
      state.scripts.splice(index, 1)
      state.scriptSelected = state.scriptSelected.filter((id) =>
        state.scripts.includes(id)
      )
    },
    importScriptToScriptor: (state, action: PayloadAction<number>) => {
      state.route.splice(state.route.length - 1, 1)
      state.route[state.route.length - 1].value = action.payload
      state.specialMode = undefined
    },
    setLibraryFilters: (state, action: PayloadAction<string[]>) => {
      state.libraryFilters = action.payload
    },
    setLibrarySelected: (state, action: PayloadAction<number[]>) => {
      state.librarySelected = action.payload
    },
    setLibraryRemoveOne: (state, action: PayloadAction<number>) => {
      const index = state.library.indexOf(action.payload)
      state.library.splice(index, 1)
      state.librarySelected = state.librarySelected.filter((id) =>
        state.library.includes(id)
      )
    },
    setLibraryRemove: (state, action: PayloadAction<number[]>) => {
      state.library = state.library.filter((id) => !action.payload.includes(id))
      state.librarySelected = state.librarySelected.filter((id) =>
        state.library.includes(id)
      )
    },
    setLibraryRemoveAll: (state, action: PayloadAction<void>) => {
      state.library = []
      state.librarySelected = []
    },
    setLibraryYOffset: (state, action: PayloadAction<number>) => {
      state.libraryYOffset = action.payload
    },
    setAudioYOffset: (state, action: PayloadAction<number>) => {
      state.audioYOffset = action.payload
    },
    setScriptYOffset: (state, action: PayloadAction<number>) => {
      state.scriptYOffset = action.payload
    },
    swapLibrary: (
      state,
      action: PayloadAction<{ oldSourceID: number; newSourceID: number }>
    ) => {
      const oldLibraryIndex = state.library.indexOf(action.payload.oldSourceID)
      const newLibraryIndex = state.library.indexOf(action.payload.newSourceID)
      arrayMove(state.library, oldLibraryIndex, newLibraryIndex)
    }
  }
})

export const {
  setAppSlice,
  setSpecialMode,
  setDisplayedSources,
  setOpenTab,
  setDefaultConfig,
  setConfigNewWindowAlerted,
  setConfigDefaultSceneBackForth,
  setConfigDefaultSceneBackForthBPMMulti,
  setConfigDefaultSceneBackForthDuration,
  setConfigDefaultSceneBackForthDurationMax,
  setConfigDefaultSceneBackForthDurationMin,
  setConfigDefaultSceneBackForthSinRate,
  setConfigDefaultSceneBackForthTF,
  setConfigDefaultSceneBackgroundBlur,
  setConfigDefaultSceneBackgroundColor,
  setConfigDefaultSceneBackgroundColorSet,
  setConfigDefaultSceneBackgroundType,
  setConfigDefaultSceneImageType,
  setConfigDefaultSceneNextSceneAllImages,
  setConfigDefaultSceneNextSceneTime,
  setConfigDefaultSceneOverlayEnabled,
  setConfigDefaultScenePersistAudio,
  setConfigDefaultScenePersistText,
  setConfigDefaultSceneTimingBPMMulti,
  setConfigDefaultSceneTimingDuration,
  setConfigDefaultSceneTimingDurationMax,
  setConfigDefaultSceneTimingDurationMin,
  setConfigDefaultSceneTimingSinRate,
  setConfigDefaultSceneTimingTF,
  setConfigDefaultSceneImageTypeFilter,
  setConfigDefaultSceneImageOrientation,
  setConfigDefaultSceneGifOption,
  setConfigDefaultSceneVideoOption,
  setConfigDefaultSceneVideoOrientation,
  setConfigDefaultSceneRegenerate,
  setConfigDefaultSceneFullSource,
  setConfigDefaultSceneVideoSpeed,
  setConfigDefaultSceneVideoRandomSpeed,
  setConfigDefaultSceneVideoSpeedMin,
  setConfigDefaultSceneVideoSpeedMax,
  setConfigDefaultSceneVideoSkip,
  setConfigDefaultSceneVideoVolume,
  setConfigDefaultSceneRandomVideoStart,
  setConfigDefaultSceneContinueVideo,
  setConfigDefaultScenePlayVideoClips,
  setConfigDefaultSceneForceAllSource,
  setConfigDefaultSceneForceAll,
  setConfigDefaultSceneGifTimingConstant,
  setConfigDefaultSceneGifTimingMin,
  setConfigDefaultSceneGifTimingMax,
  setConfigDefaultSceneVideoTimingConstant,
  setConfigDefaultSceneVideoTimingMin,
  setConfigDefaultSceneVideoTimingMax,
  setConfigDefaultSceneSkipVideoStart,
  setConfigDefaultSceneSkipVideoEnd,
  setConfigDefaultSceneWeightFunction,
  setConfigDefaultSceneSourceOrderFunction,
  setConfigDefaultSceneOrderFunction,
  setConfigDefaultSceneFadeTF,
  setConfigDefaultSceneFadeDuration,
  setConfigDefaultSceneFadeDurationMin,
  setConfigDefaultSceneFadeDurationMax,
  setConfigDefaultSceneFadeSinRate,
  setConfigDefaultSceneFadeBPMMulti,
  setConfigDefaultSceneFadeExp,
  setConfigDefaultSceneFadeOv,
  setConfigDefaultSceneFadeAmp,
  setConfigDefaultSceneFadePer,
  setConfigDefaultSceneFadeEase,
  setConfigDefaultSceneCrossFade,
  setConfigDefaultSceneCrossFadeAudio,
  setConfigDefaultSceneSlide,
  setConfigDefaultSceneSlideTF,
  setConfigDefaultSceneSlideDuration,
  setConfigDefaultSceneSlideDurationMin,
  setConfigDefaultSceneSlideDurationMax,
  setConfigDefaultSceneSlideSinRate,
  setConfigDefaultSceneSlideBPMMulti,
  setConfigDefaultSceneSlideEase,
  setConfigDefaultSceneSlideExp,
  setConfigDefaultSceneSlideOv,
  setConfigDefaultSceneSlideAmp,
  setConfigDefaultSceneSlidePer,
  setConfigDefaultSceneSlideType,
  setConfigDefaultSceneSlideDistance,
  setConfigDefaultSceneStrobe,
  setConfigDefaultSceneStrobePulse,
  setConfigDefaultSceneStrobeTF,
  setConfigDefaultSceneStrobeDuration,
  setConfigDefaultSceneStrobeDurationMin,
  setConfigDefaultSceneStrobeDurationMax,
  setConfigDefaultSceneStrobeSinRate,
  setConfigDefaultSceneStrobeBPMMulti,
  setConfigDefaultSceneStrobeDelayTF,
  setConfigDefaultSceneStrobeDelayDuration,
  setConfigDefaultSceneStrobeDelayDurationMin,
  setConfigDefaultSceneStrobeDelayDurationMax,
  setConfigDefaultSceneStrobeDelaySinRate,
  setConfigDefaultSceneStrobeDelayBPMMulti,
  setConfigDefaultSceneStrobeEase,
  setConfigDefaultSceneStrobeExp,
  setConfigDefaultSceneStrobeOv,
  setConfigDefaultSceneStrobeAmp,
  setConfigDefaultSceneStrobePer,
  setConfigDefaultSceneStrobeColorType,
  setConfigDefaultSceneStrobeLayer,
  setConfigDefaultSceneStrobeOpacity,
  setConfigDefaultSceneStrobeColor,
  setConfigDefaultSceneStrobeColorSet,
  setConfigDefaultSceneZoomTF,
  setConfigDefaultSceneZoomDuration,
  setConfigDefaultSceneZoomDurationMin,
  setConfigDefaultSceneZoomDurationMax,
  setConfigDefaultSceneZoomSinRate,
  setConfigDefaultSceneZoomBPMMulti,
  setConfigDefaultSceneTransEase,
  setConfigDefaultSceneTransExp,
  setConfigDefaultSceneTransOv,
  setConfigDefaultSceneTransAmp,
  setConfigDefaultSceneTransPer,
  setConfigDefaultSceneHorizTransType,
  setConfigDefaultSceneHorizTransRandom,
  setConfigDefaultSceneHorizTransLevel,
  setConfigDefaultSceneHorizTransLevelMin,
  setConfigDefaultSceneHorizTransLevelMax,
  setConfigDefaultSceneVertTransType,
  setConfigDefaultSceneVertTransRandom,
  setConfigDefaultSceneVertTransLevel,
  setConfigDefaultSceneVertTransLevelMin,
  setConfigDefaultSceneVertTransLevelMax,
  setConfigDefaultSceneZoom,
  setConfigDefaultSceneZoomRandom,
  setConfigDefaultSceneZoomStart,
  setConfigDefaultSceneZoomEnd,
  setConfigDefaultSceneZoomStartMin,
  setConfigDefaultSceneZoomStartMax,
  setConfigDefaultSceneZoomEndMin,
  setConfigDefaultSceneZoomEndMax,
  setConfigDefaultSceneFadeInOut,
  setConfigDefaultSceneFadeIOTF,
  setConfigDefaultSceneFadeIODuration,
  setConfigDefaultSceneFadeIODurationMin,
  setConfigDefaultSceneFadeIODurationMax,
  setConfigDefaultSceneFadeIOSinRate,
  setConfigDefaultSceneFadeIOBPMMulti,
  setConfigDefaultSceneFadeIOStartExp,
  setConfigDefaultSceneFadeIOStartOv,
  setConfigDefaultSceneFadeIOStartAmp,
  setConfigDefaultSceneFadeIOStartPer,
  setConfigDefaultSceneFadeIOEndExp,
  setConfigDefaultSceneFadeIOEndOv,
  setConfigDefaultSceneFadeIOEndAmp,
  setConfigDefaultSceneFadeIOEndPer,
  setConfigDefaultSceneFadeIOStartEase,
  setConfigDefaultSceneFadeIOEndEase,
  setConfigDefaultScenePanning,
  setConfigDefaultScenePanTF,
  setConfigDefaultScenePanDuration,
  setConfigDefaultScenePanDurationMin,
  setConfigDefaultScenePanDurationMax,
  setConfigDefaultScenePanSinRate,
  setConfigDefaultScenePanBPMMulti,
  setConfigDefaultScenePanStartEase,
  setConfigDefaultScenePanStartExp,
  setConfigDefaultScenePanStartOv,
  setConfigDefaultScenePanStartAmp,
  setConfigDefaultScenePanStartPer,
  setConfigDefaultScenePanEndEase,
  setConfigDefaultScenePanEndExp,
  setConfigDefaultScenePanEndOv,
  setConfigDefaultScenePanEndAmp,
  setConfigDefaultScenePanEndPer,
  setConfigDefaultScenePanHorizTransType,
  setConfigDefaultScenePanHorizTransRandom,
  setConfigDefaultScenePanHorizTransImg,
  setConfigDefaultScenePanHorizTransLevel,
  setConfigDefaultScenePanHorizTransLevelMin,
  setConfigDefaultScenePanHorizTransLevelMax,
  setConfigDefaultScenePanVertTransType,
  setConfigDefaultScenePanVertTransRandom,
  setConfigDefaultScenePanVertTransImg,
  setConfigDefaultScenePanVertTransLevel,
  setConfigDefaultScenePanVertTransLevelMin,
  setConfigDefaultScenePanVertTransLevelMax,
  setConfigDefaultSceneAddOverlay,
  setConfigDefaultSceneRemoveOverlay,
  setConfigDefaultSceneNextSceneRandoms,
  setConfigDefaultSceneNextSceneID,
  setConfigTutorialsScenePicker,
  setConfigTutorialsSceneGenerator,
  setConfigTutorialsSceneDetail,
  setConfigTutorialsPlayer,
  setConfigTutorialsLibrary,
  setConfigTutorialsAudios,
  setConfigTutorialsScripts,
  setConfigTutorialsScriptor,
  setConfigTutorialsSceneGrid,
  setConfigTutorialsVideoClipper,
  setConfigDisplaySettingsFullScreen,
  setConfigDisplaySettingsStartImmediately,
  setConfigDisplaySettingsClickToProgress,
  setConfigDisplaySettingsClickToProgressWhilePlaying,
  setConfigDisplaySettingsEasingControls,
  setConfigDisplaySettingsAudioAlert,
  setConfigDisplaySettingsCloneGridVideoElements,
  setConfigDisplaySettingsIgnoredTags,
  setConfigDisplaySettingsMinImageSize,
  setConfigDisplaySettingsMinVideoSize,
  setConfigDisplaySettingsMaxInHistory,
  setConfigDisplaySettingsMaxInMemory,
  setConfigDisplaySettingsMaxLoadingAtOnce,
  setConfigGeneralSettingsWatermark,
  setConfigGeneralSettingsWatermarkGrid,
  setConfigGeneralSettingsWatermarkCorner,
  setConfigGeneralSettingsWatermarkFontFamily,
  setConfigGeneralSettingsWatermarkColor,
  setConfigGeneralSettingsWatermarkText,
  setConfigGeneralSettingsWatermarkFontSize,
  setConfigGeneralSettingsPrioritizePerformance,
  setConfigGeneralSettingsConfirmSceneDeletion,
  setConfigGeneralSettingsConfirmBlacklist,
  setConfigGeneralSettingsConfirmFileDeletion,
  setConfigGeneralSettingsPortableMode,
  setConfigGeneralSettingsDisableLocalSave,
  setConfigGeneralSettingsAutoBackup,
  setConfigGeneralSettingsAutoCleanBackup,
  setConfigGeneralSettingsAutoBackupDays,
  setConfigGeneralSettingsAutoCleanBackupDays,
  setConfigGeneralSettingsAutoCleanBackupWeeks,
  setConfigGeneralSettingsAutoCleanBackupMonths,
  setConfigGeneralSettingsCleanRetain,
  setConfigCachingEnabled,
  setConfigCachingDirectory,
  setConfigCachingMaxSize,
  setConfigRemoteSettingsSilenceTumblrAlert,
  setConfigRemoteSettingsTumblrKey,
  setConfigRemoteSettingsTumblrSecret,
  setConfigRemoteSettingsTumblrOAuthToken,
  setConfigRemoteSettingsTumblrOAuthTokenSecret,
  setConfigRemoteSettingsRedditDeviceID,
  setConfigRemoteSettingsRedditRefreshToken,
  setConfigRemoteSettingsTwitterAccessTokenKey,
  setConfigRemoteSettingsTwitterAccessTokenSecret,
  setConfigRemoteSettingsInstagramUsername,
  setConfigRemoteSettingsInstagramPassword,
  setConfigRemoteSettingsHydrusProtocol,
  setConfigRemoteSettingsHydrusDomain,
  setConfigRemoteSettingsHydrusPort,
  setConfigRemoteSettingsHydrusAPIKey,
  setConfigRemoteSettingsPiwigoProtocol,
  setConfigRemoteSettingsPiwigoHost,
  setConfigRemoteSettingsPiwigoUsername,
  setConfigRemoteSettingsPiwigoPassword,
  setThemeMode,
  setThemePalettePrimary,
  setThemePaletteSecondary,
  setTutorialStart,
  setTutorialVCTStart,
  setTutorial,
  setSkipAllTutorials,
  setResetAllTutorials,
  closeMessage,
  systemMessage,
  systemSnack,
  addRoutes,
  setRoute,
  setRoutePop,
  setAppTags,
  addToTags,
  setAppScenes,
  addToScenes,
  removeFromScenes,
  addToGrids,
  removeFromGrids,
  addToSceneGroups,
  removeFromSceneGroups,
  setLibrary,
  addToLibrary,
  setAudiosAddAtStart,
  addToAudios,
  addToScripts,
  addToScriptsAtStart,
  moveScenes,
  moveGrids,
  moveSceneGroups,
  setSystemSnack,
  addTracks,
  addScript,
  addScriptSingle,
  openLibraryImport,
  setAudioFilters,
  setAudioSelected,
  setAudioOpenTab,
  setProgressMode,
  setProgress,
  setAudios,
  removeAudios,
  setScripts,
  setPlaylists,
  addToPlaylist,
  batchClip,
  batchTag,
  batchEdit,
  manageTags,
  setScriptFilters,
  setScriptSelected,
  setScriptsRemove,
  setScriptsRemoveAll,
  setScriptsRemoveOne,
  importScriptToScriptor,
  setLibraryFilters,
  setLibrarySelected,
  setLibraryRemoveOne,
  setLibraryRemove,
  setLibraryRemoveAll,
  setLibraryYOffset,
  setAudioYOffset,
  setScriptYOffset,
  swapLibrary
} = appSlice.actions

export default appSlice.reducer
