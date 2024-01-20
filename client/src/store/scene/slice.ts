import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type Scene from './Scene'
import type WeightGroup from './WeightGroup'
import {
  type EntryState,
  type EntryUpdate,
  setEntrySlice,
  getEntry,
  setEntry,
  deleteEntry
} from '../EntryState'
import type ScriptPlaylist from './ScriptPlaylist'
import type AudioPlaylist from './AudioPlaylist'
import { RP } from 'flipflip-common'
import { arrayMove } from '../../data/utils'

export const initialSceneState: EntryState<Scene> = {
  name: 'sceneSlice',
  nextID: 1,
  entries: {}
}

export default function createSceneReducer(sceneState?: EntryState<Scene>) {
  return createSceneSlice(sceneState).reducer
}

function createSceneSlice(sceneState?: EntryState<Scene>) {
  const initialState = sceneState ?? initialSceneState
  return createSlice({
    name: 'scenes',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
      setSceneSlice: (state, action: PayloadAction<EntryState<Scene>>) => {
        setEntrySlice(state, action.payload)
      },
      setScene: (state, action: PayloadAction<Scene>) => {
        setEntry(state, action.payload)
      },
      setScenes: (state, action: PayloadAction<Scene[]>) => {
        action.payload.forEach((s) => {
          setEntry(state, s)
        })
      },
      deleteScene: (state, action: PayloadAction<number>) => {
        deleteEntry(state, action.payload)
      },
      setSceneUseWeights: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).useWeights = action.payload.value
      },
      setSceneOpenTab: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).openTab = action.payload.value
      },
      setSceneName: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).name = action.payload.value
      },
      setSceneOverrideIgnore: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).overrideIgnore = action.payload.value
      },
      setSceneAddGeneratorWeight: (
        state,
        action: PayloadAction<EntryUpdate<WeightGroup>>
      ) => {
        const scene = getEntry(state, action.payload.id)
        if (!scene.generatorWeights) {
          scene.generatorWeights = []
        }
  
        scene.generatorWeights.push(action.payload.value)
      },
      setSceneGeneratorMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).generatorMax = action.payload.value
      },
      setSceneGeneratorWeights: (
        state,
        action: PayloadAction<EntryUpdate<WeightGroup[]>>
      ) => {
        getEntry(state, action.payload.id).generatorWeights = action.payload.value
      },
      setSceneFadeTF: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).fadeTF = action.payload.value
      },
      setSceneFadeDuration: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeDuration = action.payload.value
      },
      setSceneFadeDurationMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeDurationMin = action.payload.value
      },
      setSceneFadeDurationMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeDurationMax = action.payload.value
      },
      setSceneFadeSinRate: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeSinRate = action.payload.value
      },
      setSceneFadeBPMMulti: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeBPMMulti = action.payload.value
      },
      setSceneFadeExp: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).fadeExp = action.payload.value
      },
      setSceneFadeOv: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).fadeOv = action.payload.value
      },
      setSceneFadeAmp: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).fadeAmp = action.payload.value
      },
      setSceneFadePer: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).fadePer = action.payload.value
      },
      setSceneFadeInOut: (state, action: PayloadAction<EntryUpdate<boolean>>) => {
        getEntry(state, action.payload.id).fadeInOut = action.payload.value
      },
      setSceneFadeIOTF: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).fadeIOTF = action.payload.value
      },
      setSceneFadeIODuration: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeIODuration = action.payload.value
      },
      setSceneFadeIODurationMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeIODurationMin =
          action.payload.value
      },
      setSceneFadeIODurationMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeIODurationMax =
          action.payload.value
      },
      setSceneFadeIOSinRate: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeIOSinRate = action.payload.value
      },
      setSceneFadeIOBPMMulti: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeIOBPMMulti = action.payload.value
      },
      setSceneFadeIOStartExp: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeIOStartExp = action.payload.value
      },
      setSceneFadeIOStartOv: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeIOStartOv = action.payload.value
      },
      setSceneFadeIOStartAmp: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeIOStartAmp = action.payload.value
      },
      setSceneFadeIOStartPer: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeIOStartPer = action.payload.value
      },
      setSceneFadeIOEndExp: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeIOEndExp = action.payload.value
      },
      setSceneFadeIOEndOv: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeIOEndOv = action.payload.value
      },
      setSceneFadeIOEndAmp: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeIOEndAmp = action.payload.value
      },
      setSceneFadeIOEndPer: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).fadeIOEndPer = action.payload.value
      },
      setScenePanning: (state, action: PayloadAction<EntryUpdate<boolean>>) => {
        getEntry(state, action.payload.id).panning = action.payload.value
      },
      setScenePanTF: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).panTF = action.payload.value
      },
      setScenePanDuration: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).panDuration = action.payload.value
      },
      setScenePanDurationMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).panDurationMin = action.payload.value
      },
      setScenePanDurationMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).panDurationMax = action.payload.value
      },
      setScenePanSinRate: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).panSinRate = action.payload.value
      },
      setScenePanBPMMulti: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).panBPMMulti = action.payload.value
      },
      setSceneTimingTF: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).timingFunction = action.payload.value
      },
      setSceneTimingDuration: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).timingConstant = action.payload.value
      },
      setSceneTimingDurationMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).timingMin = action.payload.value
      },
      setSceneTimingDurationMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).timingMax = action.payload.value
      },
      setSceneTimingSinRate: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).timingSinRate = action.payload.value
      },
      setSceneTimingBPMMulti: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).timingBPMMulti = action.payload.value
      },
      setSceneBackForth: (state, action: PayloadAction<EntryUpdate<boolean>>) => {
        getEntry(state, action.payload.id).backForth = action.payload.value
      },
      setSceneBackForthTF: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).backForthTF = action.payload.value
      },
      setSceneBackForthDuration: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).backForthConstant =
          action.payload.value
      },
      setSceneBackForthDurationMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).backForthMin = action.payload.value
      },
      setSceneBackForthDurationMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).backForthMax = action.payload.value
      },
      setSceneBackForthSinRate: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).backForthSinRate = action.payload.value
      },
      setSceneBackForthBPMMulti: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).backForthBPMMulti =
          action.payload.value
      },
      setSceneSlide: (state, action: PayloadAction<EntryUpdate<boolean>>) => {
        getEntry(state, action.payload.id).slide = action.payload.value
      },
      setSceneSlideTF: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).slideTF = action.payload.value
      },
      setSceneSlideDuration: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).slideDuration = action.payload.value
      },
      setSceneSlideDurationMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).slideDurationMin = action.payload.value
      },
      setSceneSlideDurationMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).slideDurationMax = action.payload.value
      },
      setSceneSlideSinRate: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).slideSinRate = action.payload.value
      },
      setSceneSlideBPMMulti: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).slideBPMMulti = action.payload.value
      },
      setSceneStrobe: (state, action: PayloadAction<EntryUpdate<boolean>>) => {
        getEntry(state, action.payload.id).strobe = action.payload.value
      },
      setSceneStrobePulse: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).strobePulse = action.payload.value
      },
      setSceneStrobeTF: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).strobeTF = action.payload.value
      },
      setSceneStrobeDuration: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).strobeTime = action.payload.value
      },
      setSceneStrobeDurationMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).strobeTimeMin = action.payload.value
      },
      setSceneStrobeDurationMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).strobeTimeMax = action.payload.value
      },
      setSceneStrobeSinRate: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).strobeSinRate = action.payload.value
      },
      setSceneStrobeBPMMulti: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).strobeBPMMulti = action.payload.value
      },
      setSceneStrobeDelayTF: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).strobeDelayTF = action.payload.value
      },
      setSceneStrobeDelayDuration: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).strobeDelay = action.payload.value
      },
      setSceneStrobeDelayDurationMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).strobeDelayMin = action.payload.value
      },
      setSceneStrobeDelayDurationMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).strobeDelayMax = action.payload.value
      },
      setSceneStrobeDelaySinRate: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).strobeDelaySinRate =
          action.payload.value
      },
      setSceneStrobeDelayBPMMulti: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).strobeDelayBPMMulti =
          action.payload.value
      },
      setSceneZoomTF: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).transTF = action.payload.value
      },
      setSceneZoomDuration: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).transDuration = action.payload.value
      },
      setSceneZoomDurationMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).transDurationMin = action.payload.value
      },
      setSceneZoomDurationMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).transDurationMax = action.payload.value
      },
      setSceneZoomSinRate: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).transSinRate = action.payload.value
      },
      setSceneZoomBPMMulti: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).transBPMMulti = action.payload.value
      },
      setSceneFadeEase: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).fadeEase = action.payload.value
      },
      setSceneFadeIOStartEase: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).fadeIOStartEase = action.payload.value
      },
      setSceneFadeIOEndEase: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).fadeIOEndEase = action.payload.value
      },
      setScenePanStartEase: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).panStartEase = action.payload.value
      },
      setScenePanStartExp: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).panStartExp = action.payload.value
      },
      setScenePanStartOv: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).panStartOv = action.payload.value
      },
      setScenePanStartAmp: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).panStartAmp = action.payload.value
      },
      setScenePanStartPer: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).panStartPer = action.payload.value
      },
      setScenePanEndEase: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).panEndEase = action.payload.value
      },
      setScenePanEndExp: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).panEndExp = action.payload.value
      },
      setScenePanEndOv: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).panEndOv = action.payload.value
      },
      setScenePanEndAmp: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).panEndAmp = action.payload.value
      },
      setScenePanEndPer: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).panEndPer = action.payload.value
      },
      setSceneSlideEase: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).slideEase = action.payload.value
      },
      setSceneSlideExp: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).slideExp = action.payload.value
      },
      setSceneSlideOv: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).slideOv = action.payload.value
      },
      setSceneSlideAmp: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).slideAmp = action.payload.value
      },
      setSceneSlidePer: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).slidePer = action.payload.value
      },
      setSceneStrobeEase: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).strobeEase = action.payload.value
      },
      setSceneStrobeExp: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).strobeExp = action.payload.value
      },
      setSceneStrobeOv: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).strobeOv = action.payload.value
      },
      setSceneStrobeAmp: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).strobeAmp = action.payload.value
      },
      setSceneStrobePer: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).strobePer = action.payload.value
      },
      setSceneTransEase: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).transEase = action.payload.value
      },
      setSceneTransExp: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).transExp = action.payload.value
      },
      setSceneTransOv: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).transOv = action.payload.value
      },
      setSceneTransAmp: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).transAmp = action.payload.value
      },
      setSceneTransPer: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).transPer = action.payload.value
      },
      setScenePanHorizTransType: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).panHorizTransType =
          action.payload.value
      },
      setScenePanHorizTransRandom: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).panHorizTransRandom =
          action.payload.value
      },
      setScenePanHorizTransImg: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).panHorizTransImg = action.payload.value
      },
      setScenePanHorizTransLevel: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).panHorizTransLevel =
          action.payload.value
      },
      setScenePanHorizTransLevelMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).panHorizTransLevelMin =
          action.payload.value
      },
      setScenePanHorizTransLevelMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).panHorizTransLevelMax =
          action.payload.value
      },
      setScenePanVertTransType: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).panVertTransType = action.payload.value
      },
      setScenePanVertTransRandom: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).panVertTransRandom =
          action.payload.value
      },
      setScenePanVertTransImg: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).panVertTransImg = action.payload.value
      },
      setScenePanVertTransLevel: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).panVertTransLevel =
          action.payload.value
      },
      setScenePanVertTransLevelMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).panVertTransLevelMin =
          action.payload.value
      },
      setScenePanVertTransLevelMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).panVertTransLevelMax =
          action.payload.value
      },
      setSceneHorizTransType: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).horizTransType = action.payload.value
      },
      setSceneHorizTransRandom: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).horizTransRandom = action.payload.value
      },
      setSceneHorizTransLevel: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).horizTransLevel = action.payload.value
      },
      setSceneHorizTransLevelMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).horizTransLevelMin =
          action.payload.value
      },
      setSceneHorizTransLevelMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).horizTransLevelMax =
          action.payload.value
      },
      setSceneVertTransType: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).vertTransType = action.payload.value
      },
      setSceneVertTransRandom: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).vertTransRandom = action.payload.value
      },
      setSceneVertTransLevel: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).vertTransLevel = action.payload.value
      },
      setSceneVertTransLevelMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).vertTransLevelMin =
          action.payload.value
      },
      setSceneVertTransLevelMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).vertTransLevelMax =
          action.payload.value
      },
      setSceneZoom: (state, action: PayloadAction<EntryUpdate<boolean>>) => {
        getEntry(state, action.payload.id).zoom = action.payload.value
      },
      setSceneZoomRandom: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).zoomRandom = action.payload.value
      },
      setSceneZoomStart: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).zoomStart = action.payload.value
      },
      setSceneZoomEnd: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).zoomEnd = action.payload.value
      },
      setSceneZoomStartMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).zoomStartMin = action.payload.value
      },
      setSceneZoomStartMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).zoomStartMax = action.payload.value
      },
      setSceneZoomEndMin: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).zoomEndMin = action.payload.value
      },
      setSceneZoomEndMax: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).zoomEndMax = action.payload.value
      },
      setSceneImageTypeFilter: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).imageTypeFilter = action.payload.value
      },
      setSceneImageOrientation: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).imageOrientation = action.payload.value
      },
      setSceneGifOption: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).gifOption = action.payload.value
      },
      setSceneVideoOption: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).videoOption = action.payload.value
      },
      setSceneVideoOrientation: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).videoOrientation = action.payload.value
      },
      setSceneImageType: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).imageType = action.payload.value
      },
      setSceneBackgroundType: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).backgroundType = action.payload.value
      },
      setSceneBackgroundColor: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).backgroundColor = action.payload.value
      },
      setSceneBackgroundColorSet: (
        state,
        action: PayloadAction<EntryUpdate<string[]>>
      ) => {
        getEntry(state, action.payload.id).backgroundColorSet =
          action.payload.value
      },
      setSceneSlideType: (state, action: PayloadAction<EntryUpdate<string>>) => {
        getEntry(state, action.payload.id).slideType = action.payload.value
      },
      setSceneSlideDistance: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).slideDistance = action.payload.value
      },
      setSceneStrobeColorType: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).strobeColorType = action.payload.value
      },
      setSceneStrobeLayer: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).strobeLayer = action.payload.value
      },
      setSceneStrobeOpacity: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).strobeOpacity = action.payload.value
      },
      setSceneStrobeColor: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).strobeColor = action.payload.value
      },
      setSceneStrobeColorSet: (
        state,
        action: PayloadAction<EntryUpdate<string[]>>
      ) => {
        getEntry(state, action.payload.id).strobeColorSet = action.payload.value
      },
      setSceneNextSceneAllImages: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).nextSceneAllImages =
          action.payload.value
      },
      setScenePersistAudio: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).persistAudio = action.payload.value
      },
      setScenePersistText: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).persistText = action.payload.value
      },
      setSceneOverlayEnabled: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).overlayEnabled = action.payload.value
      },
      setSceneNextSceneTime: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).nextSceneTime = action.payload.value
      },
      setSceneBackgroundBlur: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).backgroundBlur = action.payload.value
      },
      setSceneRegenerate: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).regenerate = action.payload.value
      },
      setSceneFullSource: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).fullSource = action.payload.value
      },
      setSceneVideoSpeed: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).videoSpeed = action.payload.value
      },
      setSceneVideoRandomSpeed: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).videoRandomSpeed = action.payload.value
      },
      setSceneVideoSpeedMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).videoSpeedMin = action.payload.value
      },
      setSceneVideoSpeedMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).videoSpeedMax = action.payload.value
      },
      setSceneVideoSkip: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).videoSkip = action.payload.value
      },
      setSceneVideoVolume: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).videoVolume = action.payload.value
      },
      setSceneRandomVideoStart: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).randomVideoStart = action.payload.value
      },
      setSceneContinueVideo: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).continueVideo = action.payload.value
      },
      setScenePlayVideoClips: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).playVideoClips = action.payload.value
      },
      setSceneForceAllSource: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).forceAllSource = action.payload.value
      },
      setSceneForceAll: (state, action: PayloadAction<EntryUpdate<boolean>>) => {
        getEntry(state, action.payload.id).forceAll = action.payload.value
      },
      setSceneGifTimingConstant: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).gifTimingConstant =
          action.payload.value
      },
      setSceneGifTimingMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).gifTimingMin = action.payload.value
      },
      setSceneGifTimingMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).gifTimingMax = action.payload.value
      },
      setSceneVideoTimingConstant: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).videoTimingConstant =
          action.payload.value
      },
      setSceneVideoTimingMin: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).videoTimingMin = action.payload.value
      },
      setSceneVideoTimingMax: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).videoTimingMax = action.payload.value
      },
      setSceneSkipVideoStart: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).skipVideoStart = action.payload.value
      },
      setSceneSkipVideoEnd: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).skipVideoEnd = action.payload.value
      },
      setSceneWeightFunction: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).weightFunction = action.payload.value
      },
      setSceneSourceOrderFunction: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).sourceOrderFunction =
          action.payload.value
      },
      setSceneOrderFunction: (
        state,
        action: PayloadAction<EntryUpdate<string>>
      ) => {
        getEntry(state, action.payload.id).orderFunction = action.payload.value
      },
      setSceneCrossFade: (state, action: PayloadAction<EntryUpdate<boolean>>) => {
        getEntry(state, action.payload.id).crossFade = action.payload.value
      },
      setSceneCrossFadeAudio: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).crossFadeAudio = action.payload.value
      },
      setSceneNextSceneID: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).nextSceneID = action.payload.value
      },
      setSceneAudioEnabled: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).audioEnabled = action.payload.value
      },
      setPlayerSceneAudioEnabled: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).audioEnabled = action.payload.value
      },
      setSceneTextEnabled: (
        state,
        action: PayloadAction<EntryUpdate<boolean>>
      ) => {
        getEntry(state, action.payload.id).textEnabled = action.payload.value
      },
      setSceneNextSceneRandoms: (
        state,
        action: PayloadAction<EntryUpdate<number[]>>
      ) => {
        getEntry(state, action.payload.id).nextSceneRandoms = action.payload.value
      },
      setSceneAddOverlay: (state, action: PayloadAction<EntryUpdate<number>>) => {
        const scene = getEntry(state, action.payload.id)
        if (!scene.overlays) {
          scene.overlays = []
        }
  
        scene.overlays.push(action.payload.value)
      },
      setSceneRemoveOverlay: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const scene = getEntry(state, action.payload.id)
        scene.overlays = scene.overlays.filter(
          (overlayID) => overlayID !== action.payload.value
        )
      },
      setSceneScriptPlaylists: (
        state,
        action: PayloadAction<EntryUpdate<ScriptPlaylist[]>>
      ) => {
        const scene = getEntry(state, action.payload.id)
        scene.scriptPlaylists = action.payload.value
      },
      setSceneAddAudioPlaylist: (
        state,
        action: PayloadAction<EntryUpdate<AudioPlaylist>>
      ) => {
        getEntry(state, action.payload.id).audioPlaylists.push(
          action.payload.value
        )
      },
      setSceneAudioPlaylistToggleShuffle: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const playlist = getEntry(state, action.payload.id).audioPlaylists[
          action.payload.value
        ]
        playlist.shuffle = !playlist.shuffle
      },
      setSceneAudioPlaylistChangeRepeat: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const playlist = getEntry(state, action.payload.id).audioPlaylists[
          action.payload.value
        ]
        switch (playlist.repeat) {
          case RP.none:
            playlist.repeat = RP.all
            break
          case RP.all:
            playlist.repeat = RP.one
            break
          case RP.one:
            playlist.repeat = RP.none
            break
        }
      },
      setSceneRemoveAudioPlaylist: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).audioPlaylists.splice(
          action.payload.value,
          1
        )
      },
      setSceneAudioPlaylistRemoveAudio: (
        state,
        action: PayloadAction<
          EntryUpdate<{ playlistIndex: number; audioIndex: number }>
        >
      ) => {
        const { playlistIndex, audioIndex } = action.payload.value
        getEntry(state, action.payload.id).audioPlaylists[
          playlistIndex
        ].audios.splice(audioIndex, 1)
      },
      setSceneAudioPlaylistSwapAudios: (
        state,
        action: PayloadAction<
          EntryUpdate<{
            playlistIndex: number
            oldIndex: number
            newIndex: number
          }>
        >
      ) => {
        const { playlistIndex, oldIndex, newIndex } = action.payload.value
        const audios = getEntry(state, action.payload.id).audioPlaylists[
          playlistIndex
        ].audios
        arrayMove(audios, oldIndex, newIndex)
      },
      setSceneAddScriptPlaylist: (
        state,
        action: PayloadAction<EntryUpdate<ScriptPlaylist>>
      ) => {
        getEntry(state, action.payload.id).scriptPlaylists.push(
          action.payload.value
        )
      },
      setSceneScriptPlaylistToggleShuffle: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const playlist = getEntry(state, action.payload.id).scriptPlaylists[
          action.payload.value
        ]
        playlist.shuffle = !playlist.shuffle
      },
      setSceneScriptPlaylistChangeRepeat: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        const playlist = getEntry(state, action.payload.id).scriptPlaylists[
          action.payload.value
        ]
        const repeat = playlist.repeat
        switch (repeat) {
          case RP.none:
            playlist.repeat = RP.all
            break
          case RP.all:
            playlist.repeat = RP.one
            break
          case RP.one:
            playlist.repeat = RP.none
            break
        }
      },
      setSceneRemoveScriptPlaylist: (
        state,
        action: PayloadAction<EntryUpdate<number>>
      ) => {
        getEntry(state, action.payload.id).scriptPlaylists.splice(
          action.payload.value,
          1
        )
      },
      setSceneScriptPlaylistRemoveScript: (
        state,
        action: PayloadAction<
          EntryUpdate<{ playlistIndex: number; scriptIndex: number }>
        >
      ) => {
        const { playlistIndex, scriptIndex } = action.payload.value
        getEntry(state, action.payload.id).scriptPlaylists[
          playlistIndex
        ].scripts.splice(scriptIndex, 1)
      },
      setSceneScriptPlaylistSortScripts: (
        state,
        action: PayloadAction<
          EntryUpdate<{
            playlistIndex: number
            oldIndex: number
            newIndex: number
          }>
        >
      ) => {
        const { playlistIndex, oldIndex, newIndex } = action.payload.value
        const scripts = getEntry(state, action.payload.id).scriptPlaylists[
          playlistIndex
        ].scripts
        arrayMove(scripts, oldIndex, newIndex)
      },
      setSceneSources: (state, action: PayloadAction<EntryUpdate<number[]>>) => {
        getEntry(state, action.payload.id).sources = action.payload.value
      },
      setSceneAddSource: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).sources.push(action.payload.value)
      },
      setSceneAddSources: (
        state,
        action: PayloadAction<EntryUpdate<number[]>>
      ) => {
        getEntry(state, action.payload.id).sources.push(...action.payload.value)
      },
      setSceneRemoveSources: (
        state,
        action: PayloadAction<EntryUpdate<number[]>>
      ) => {
        const scene = state.entries[action.payload.id]
        scene.sources = scene.sources.filter(
          (id) => !action.payload.value.includes(id)
        )
      },
      setSceneRemoveAllSources: (state, action: PayloadAction<number>) => {
        state.entries[action.payload].sources = []
      },
      changeAudioRoute: (state, action: PayloadAction<EntryUpdate<number>>) => {
        getEntry(state, action.payload.id).libraryID = action.payload.value
      },
      setSceneAudioPlaylistAddAudios: (
        state,
        action: PayloadAction<{
          sceneID: number
          playlistIndex: number
          audios: number[]
        }>
      ) => {
        const { sceneID, playlistIndex, audios } = action.payload
        state.entries[sceneID].audioPlaylists[playlistIndex].audios.push(
          ...audios
        )
      },
      setSceneScriptPlaylistScripts: (
        state,
        action: PayloadAction<{
          sceneID: number
          playlistIndex: number
          scripts: number[]
        }>
      ) => {
        const { sceneID, playlistIndex, scripts } = action.payload
        state.entries[sceneID].scriptPlaylists[playlistIndex].scripts = scripts
      }
    }
  })
}

export const {
  setSceneSlice,
  setScene,
  setScenes,
  deleteScene,
  setSceneUseWeights,
  setSceneOpenTab,
  setSceneName,
  setSceneOverrideIgnore,
  setSceneAddGeneratorWeight,
  setSceneGeneratorMax,
  setSceneGeneratorWeights,
  setSceneFadeTF,
  setSceneFadeDuration,
  setSceneFadeDurationMin,
  setSceneFadeDurationMax,
  setSceneFadeSinRate,
  setSceneFadeBPMMulti,
  setSceneFadeExp,
  setSceneFadeOv,
  setSceneFadeAmp,
  setSceneFadePer,
  setSceneFadeInOut,
  setSceneFadeIOTF,
  setSceneFadeIODuration,
  setSceneFadeIODurationMin,
  setSceneFadeIODurationMax,
  setSceneFadeIOSinRate,
  setSceneFadeIOBPMMulti,
  setSceneFadeIOStartExp,
  setSceneFadeIOStartOv,
  setSceneFadeIOStartAmp,
  setSceneFadeIOStartPer,
  setSceneFadeIOEndExp,
  setSceneFadeIOEndOv,
  setSceneFadeIOEndAmp,
  setSceneFadeIOEndPer,
  setScenePanning,
  setScenePanTF,
  setScenePanDuration,
  setScenePanDurationMin,
  setScenePanDurationMax,
  setScenePanSinRate,
  setScenePanBPMMulti,
  setSceneTimingTF,
  setSceneTimingDuration,
  setSceneTimingDurationMin,
  setSceneTimingDurationMax,
  setSceneTimingSinRate,
  setSceneTimingBPMMulti,
  setSceneBackForth,
  setSceneBackForthTF,
  setSceneBackForthDuration,
  setSceneBackForthDurationMin,
  setSceneBackForthDurationMax,
  setSceneBackForthSinRate,
  setSceneBackForthBPMMulti,
  setSceneSlide,
  setSceneSlideTF,
  setSceneSlideDuration,
  setSceneSlideDurationMin,
  setSceneSlideDurationMax,
  setSceneSlideSinRate,
  setSceneSlideBPMMulti,
  setSceneStrobe,
  setSceneStrobePulse,
  setSceneStrobeTF,
  setSceneStrobeDuration,
  setSceneStrobeDurationMin,
  setSceneStrobeDurationMax,
  setSceneStrobeSinRate,
  setSceneStrobeBPMMulti,
  setSceneStrobeDelayTF,
  setSceneStrobeDelayDuration,
  setSceneStrobeDelayDurationMin,
  setSceneStrobeDelayDurationMax,
  setSceneStrobeDelaySinRate,
  setSceneStrobeDelayBPMMulti,
  setSceneZoomTF,
  setSceneZoomDuration,
  setSceneZoomDurationMin,
  setSceneZoomDurationMax,
  setSceneZoomSinRate,
  setSceneZoomBPMMulti,
  setSceneFadeEase,
  setSceneFadeIOStartEase,
  setSceneFadeIOEndEase,
  setScenePanStartEase,
  setScenePanStartExp,
  setScenePanStartOv,
  setScenePanStartAmp,
  setScenePanStartPer,
  setScenePanEndEase,
  setScenePanEndExp,
  setScenePanEndOv,
  setScenePanEndAmp,
  setScenePanEndPer,
  setSceneSlideEase,
  setSceneSlideExp,
  setSceneSlideOv,
  setSceneSlideAmp,
  setSceneSlidePer,
  setSceneStrobeEase,
  setSceneStrobeExp,
  setSceneStrobeOv,
  setSceneStrobeAmp,
  setSceneStrobePer,
  setSceneTransEase,
  setSceneTransExp,
  setSceneTransOv,
  setSceneTransAmp,
  setSceneTransPer,
  setScenePanHorizTransType,
  setScenePanHorizTransRandom,
  setScenePanHorizTransImg,
  setScenePanHorizTransLevel,
  setScenePanHorizTransLevelMin,
  setScenePanHorizTransLevelMax,
  setScenePanVertTransType,
  setScenePanVertTransRandom,
  setScenePanVertTransImg,
  setScenePanVertTransLevel,
  setScenePanVertTransLevelMin,
  setScenePanVertTransLevelMax,
  setSceneHorizTransType,
  setSceneHorizTransRandom,
  setSceneHorizTransLevel,
  setSceneHorizTransLevelMin,
  setSceneHorizTransLevelMax,
  setSceneVertTransType,
  setSceneVertTransRandom,
  setSceneVertTransLevel,
  setSceneVertTransLevelMin,
  setSceneVertTransLevelMax,
  setSceneZoom,
  setSceneZoomRandom,
  setSceneZoomStart,
  setSceneZoomEnd,
  setSceneZoomStartMin,
  setSceneZoomStartMax,
  setSceneZoomEndMin,
  setSceneZoomEndMax,
  setSceneImageTypeFilter,
  setSceneImageOrientation,
  setSceneGifOption,
  setSceneVideoOption,
  setSceneVideoOrientation,
  setSceneImageType,
  setSceneBackgroundType,
  setSceneBackgroundColor,
  setSceneBackgroundColorSet,
  setSceneSlideType,
  setSceneSlideDistance,
  setSceneStrobeColorType,
  setSceneStrobeLayer,
  setSceneStrobeOpacity,
  setSceneStrobeColor,
  setSceneStrobeColorSet,
  setSceneNextSceneAllImages,
  setScenePersistAudio,
  setScenePersistText,
  setSceneOverlayEnabled,
  setSceneNextSceneTime,
  setSceneBackgroundBlur,
  setSceneRegenerate,
  setSceneFullSource,
  setSceneVideoSpeed,
  setSceneVideoRandomSpeed,
  setSceneVideoSpeedMin,
  setSceneVideoSpeedMax,
  setSceneVideoSkip,
  setSceneVideoVolume,
  setSceneRandomVideoStart,
  setSceneContinueVideo,
  setScenePlayVideoClips,
  setSceneForceAllSource,
  setSceneForceAll,
  setSceneGifTimingConstant,
  setSceneGifTimingMin,
  setSceneGifTimingMax,
  setSceneVideoTimingConstant,
  setSceneVideoTimingMin,
  setSceneVideoTimingMax,
  setSceneSkipVideoStart,
  setSceneSkipVideoEnd,
  setSceneWeightFunction,
  setSceneSourceOrderFunction,
  setSceneOrderFunction,
  setSceneCrossFade,
  setSceneCrossFadeAudio,
  setSceneNextSceneID,
  setSceneAudioEnabled,
  setPlayerSceneAudioEnabled,
  setSceneTextEnabled,
  setSceneNextSceneRandoms,
  setSceneAddOverlay,
  setSceneRemoveOverlay,
  setSceneScriptPlaylists,
  setSceneAddAudioPlaylist,
  setSceneAudioPlaylistToggleShuffle,
  setSceneAudioPlaylistChangeRepeat,
  setSceneRemoveAudioPlaylist,
  setSceneAudioPlaylistRemoveAudio,
  setSceneAudioPlaylistSwapAudios,
  setSceneAddScriptPlaylist,
  setSceneScriptPlaylistToggleShuffle,
  setSceneScriptPlaylistChangeRepeat,
  setSceneRemoveScriptPlaylist,
  setSceneScriptPlaylistRemoveScript,
  setSceneScriptPlaylistSortScripts,
  setSceneSources,
  setSceneAddSource,
  setSceneAddSources,
  setSceneRemoveSources,
  setSceneRemoveAllSources,
  changeAudioRoute,
  setSceneAudioPlaylistAddAudios,
  setSceneScriptPlaylistScripts
} = createSceneSlice().actions
