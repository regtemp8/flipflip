import * as slice from './slice'
import * as app from '../app/slice'
import { type PayloadAction } from '@reduxjs/toolkit'
import { type EntryUpdate } from '../EntryState'

export const setSceneBackForth =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneBackForth({ id, value })
      : app.setConfigDefaultSceneBackForth(value)
export const setSceneBackForthBPMMulti =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneBackForthBPMMulti({ id, value })
      : app.setConfigDefaultSceneBackForthBPMMulti(value)
export const setSceneBackForthDuration =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneBackForthDuration({ id, value })
      : app.setConfigDefaultSceneBackForthDuration(value)
export const setSceneBackForthDurationMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneBackForthDurationMax({ id, value })
      : app.setConfigDefaultSceneBackForthDurationMax(value)
export const setSceneBackForthDurationMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneBackForthDurationMin({ id, value })
      : app.setConfigDefaultSceneBackForthDurationMin(value)
export const setSceneBackForthSinRate =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneBackForthSinRate({ id, value })
      : app.setConfigDefaultSceneBackForthSinRate(value)
export const setSceneBackForthTF =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneBackForthTF({ id, value })
      : app.setConfigDefaultSceneBackForthTF(value)
export const setSceneBackgroundBlur =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneBackgroundBlur({ id, value })
      : app.setConfigDefaultSceneBackgroundBlur(value)
export const setSceneBackgroundColor =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneBackgroundColor({ id, value })
      : app.setConfigDefaultSceneBackgroundColor(value)
export const setSceneBackgroundColorSet =
  (id?: number) =>
  (value: string[]): PayloadAction<EntryUpdate<string[]> | string[]> =>
    id !== undefined
      ? slice.setSceneBackgroundColorSet({ id, value })
      : app.setConfigDefaultSceneBackgroundColorSet(value)
export const setSceneBackgroundType =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneBackgroundType({ id, value })
      : app.setConfigDefaultSceneBackgroundType(value)
export const setSceneImageType =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneImageType({ id, value })
      : app.setConfigDefaultSceneImageType(value)
export const setSceneNextSceneAllImages =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneNextSceneAllImages({ id, value })
      : app.setConfigDefaultSceneNextSceneAllImages(value)
export const setSceneNextSceneTime =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneNextSceneTime({ id, value })
      : app.setConfigDefaultSceneNextSceneTime(value)
export const setSceneOverlayEnabled =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneOverlayEnabled({ id, value })
      : app.setConfigDefaultSceneOverlayEnabled(value)
export const setScenePersistAudio =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setScenePersistAudio({ id, value })
      : app.setConfigDefaultScenePersistAudio(value)
export const setScenePersistText =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setScenePersistText({ id, value })
      : app.setConfigDefaultScenePersistText(value)
export const setSceneTimingBPMMulti =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneTimingBPMMulti({ id, value })
      : app.setConfigDefaultSceneTimingBPMMulti(value)
export const setSceneTimingDuration =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneTimingDuration({ id, value })
      : app.setConfigDefaultSceneTimingDuration(value)
export const setSceneTimingDurationMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneTimingDurationMax({ id, value })
      : app.setConfigDefaultSceneTimingDurationMax(value)
export const setSceneTimingDurationMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneTimingDurationMin({ id, value })
      : app.setConfigDefaultSceneTimingDurationMin(value)
export const setSceneTimingSinRate =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneTimingSinRate({ id, value })
      : app.setConfigDefaultSceneTimingSinRate(value)
export const setSceneTimingTF =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneTimingTF({ id, value })
      : app.setConfigDefaultSceneTimingTF(value)
export const setSceneImageTypeFilter =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneImageTypeFilter({ id, value })
      : app.setConfigDefaultSceneImageTypeFilter(value)
export const setSceneImageOrientation =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneImageOrientation({ id, value })
      : app.setConfigDefaultSceneImageOrientation(value)
export const setSceneGifOption =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneGifOption({ id, value })
      : app.setConfigDefaultSceneGifOption(value)
export const setSceneVideoOption =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneVideoOption({ id, value })
      : app.setConfigDefaultSceneVideoOption(value)
export const setSceneVideoOrientation =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneVideoOrientation({ id, value })
      : app.setConfigDefaultSceneVideoOrientation(value)
export const setSceneRegenerate =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneRegenerate({ id, value })
      : app.setConfigDefaultSceneRegenerate(value)
export const setSceneFullSource =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneFullSource({ id, value })
      : app.setConfigDefaultSceneFullSource(value)
export const setSceneVideoSpeed =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneVideoSpeed({ id, value })
      : app.setConfigDefaultSceneVideoSpeed(value)
export const setSceneVideoRandomSpeed =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneVideoRandomSpeed({ id, value })
      : app.setConfigDefaultSceneVideoRandomSpeed(value)
export const setSceneVideoSpeedMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneVideoSpeedMin({ id, value })
      : app.setConfigDefaultSceneVideoSpeedMin(value)
export const setSceneVideoSpeedMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneVideoSpeedMax({ id, value })
      : app.setConfigDefaultSceneVideoSpeedMax(value)
export const setSceneVideoSkip =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneVideoSkip({ id, value })
      : app.setConfigDefaultSceneVideoSkip(value)
export const setSceneVideoVolume =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneVideoVolume({ id, value })
      : app.setConfigDefaultSceneVideoVolume(value)
export const setSceneRandomVideoStart =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneRandomVideoStart({ id, value })
      : app.setConfigDefaultSceneRandomVideoStart(value)
export const setSceneContinueVideo =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneContinueVideo({ id, value })
      : app.setConfigDefaultSceneContinueVideo(value)
export const setScenePlayVideoClips =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setScenePlayVideoClips({ id, value })
      : app.setConfigDefaultScenePlayVideoClips(value)
export const setSceneForceAllSource =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneForceAllSource({ id, value })
      : app.setConfigDefaultSceneForceAllSource(value)
export const setSceneForceAll =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneForceAll({ id, value })
      : app.setConfigDefaultSceneForceAll(value)
export const setSceneGifTimingConstant =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneGifTimingConstant({ id, value })
      : app.setConfigDefaultSceneGifTimingConstant(value)
export const setSceneGifTimingMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneGifTimingMin({ id, value })
      : app.setConfigDefaultSceneGifTimingMin(value)
export const setSceneGifTimingMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneGifTimingMax({ id, value })
      : app.setConfigDefaultSceneGifTimingMax(value)
export const setSceneVideoTimingConstant =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneVideoTimingConstant({ id, value })
      : app.setConfigDefaultSceneVideoTimingConstant(value)
export const setSceneVideoTimingMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneVideoTimingMin({ id, value })
      : app.setConfigDefaultSceneVideoTimingMin(value)
export const setSceneVideoTimingMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneVideoTimingMax({ id, value })
      : app.setConfigDefaultSceneVideoTimingMax(value)
export const setSceneSkipVideoStart =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneSkipVideoStart({ id, value })
      : app.setConfigDefaultSceneSkipVideoStart(value)
export const setSceneSkipVideoEnd =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneSkipVideoEnd({ id, value })
      : app.setConfigDefaultSceneSkipVideoEnd(value)
export const setSceneWeightFunction =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneWeightFunction({ id, value })
      : app.setConfigDefaultSceneWeightFunction(value)
export const setSceneSourceOrderFunction =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneSourceOrderFunction({ id, value })
      : app.setConfigDefaultSceneSourceOrderFunction(value)
export const setSceneOrderFunction =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneOrderFunction({ id, value })
      : app.setConfigDefaultSceneOrderFunction(value)
export const setSceneFadeTF =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneFadeTF({ id, value })
      : app.setConfigDefaultSceneFadeTF(value)
export const setSceneFadeDuration =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeDuration({ id, value })
      : app.setConfigDefaultSceneFadeDuration(value)
export const setSceneFadeDurationMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeDurationMin({ id, value })
      : app.setConfigDefaultSceneFadeDurationMin(value)
export const setSceneFadeDurationMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeDurationMax({ id, value })
      : app.setConfigDefaultSceneFadeDurationMax(value)
export const setSceneFadeSinRate =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeSinRate({ id, value })
      : app.setConfigDefaultSceneFadeSinRate(value)
export const setSceneFadeBPMMulti =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeBPMMulti({ id, value })
      : app.setConfigDefaultSceneFadeBPMMulti(value)
export const setSceneFadeExp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeExp({ id, value })
      : app.setConfigDefaultSceneFadeExp(value)
export const setSceneFadeOv =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeOv({ id, value })
      : app.setConfigDefaultSceneFadeOv(value)
export const setSceneFadeAmp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeAmp({ id, value })
      : app.setConfigDefaultSceneFadeAmp(value)
export const setSceneFadePer =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadePer({ id, value })
      : app.setConfigDefaultSceneFadePer(value)
export const setSceneFadeEase =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneFadeEase({ id, value })
      : app.setConfigDefaultSceneFadeEase(value)
export const setSceneCrossFade =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneCrossFade({ id, value })
      : app.setConfigDefaultSceneCrossFade(value)
export const setSceneCrossFadeAudio =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneCrossFadeAudio({ id, value })
      : app.setConfigDefaultSceneCrossFadeAudio(value)
export const setSceneSlide =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneSlide({ id, value })
      : app.setConfigDefaultSceneSlide(value)
export const setSceneSlideTF =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneSlideTF({ id, value })
      : app.setConfigDefaultSceneSlideTF(value)
export const setSceneSlideDuration =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneSlideDuration({ id, value })
      : app.setConfigDefaultSceneSlideDuration(value)
export const setSceneSlideDurationMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneSlideDurationMin({ id, value })
      : app.setConfigDefaultSceneSlideDurationMin(value)
export const setSceneSlideDurationMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneSlideDurationMax({ id, value })
      : app.setConfigDefaultSceneSlideDurationMax(value)
export const setSceneSlideSinRate =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneSlideSinRate({ id, value })
      : app.setConfigDefaultSceneSlideSinRate(value)
export const setSceneSlideBPMMulti =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneSlideBPMMulti({ id, value })
      : app.setConfigDefaultSceneSlideBPMMulti(value)
export const setSceneSlideEase =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneSlideEase({ id, value })
      : app.setConfigDefaultSceneSlideEase(value)
export const setSceneSlideExp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneSlideExp({ id, value })
      : app.setConfigDefaultSceneSlideExp(value)
export const setSceneSlideOv =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneSlideOv({ id, value })
      : app.setConfigDefaultSceneSlideOv(value)
export const setSceneSlideAmp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneSlideAmp({ id, value })
      : app.setConfigDefaultSceneSlideAmp(value)
export const setSceneSlidePer =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneSlidePer({ id, value })
      : app.setConfigDefaultSceneSlidePer(value)
export const setSceneSlideType =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneSlideType({ id, value })
      : app.setConfigDefaultSceneSlideType(value)
export const setSceneSlideDistance =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneSlideDistance({ id, value })
      : app.setConfigDefaultSceneSlideDistance(value)
export const setSceneStrobe =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneStrobe({ id, value })
      : app.setConfigDefaultSceneStrobe(value)
export const setSceneStrobePulse =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneStrobePulse({ id, value })
      : app.setConfigDefaultSceneStrobePulse(value)
export const setSceneStrobeTF =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneStrobeTF({ id, value })
      : app.setConfigDefaultSceneStrobeTF(value)
export const setSceneStrobeDuration =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobeDuration({ id, value })
      : app.setConfigDefaultSceneStrobeDuration(value)
export const setSceneStrobeDurationMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobeDurationMin({ id, value })
      : app.setConfigDefaultSceneStrobeDurationMin(value)
export const setSceneStrobeDurationMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobeDurationMax({ id, value })
      : app.setConfigDefaultSceneStrobeDurationMax(value)
export const setSceneStrobeSinRate =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobeSinRate({ id, value })
      : app.setConfigDefaultSceneStrobeSinRate(value)
export const setSceneStrobeBPMMulti =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobeBPMMulti({ id, value })
      : app.setConfigDefaultSceneStrobeBPMMulti(value)
export const setSceneStrobeDelayTF =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneStrobeDelayTF({ id, value })
      : app.setConfigDefaultSceneStrobeDelayTF(value)
export const setSceneStrobeDelayDuration =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobeDelayDuration({ id, value })
      : app.setConfigDefaultSceneStrobeDelayDuration(value)
export const setSceneStrobeDelayDurationMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobeDelayDurationMin({ id, value })
      : app.setConfigDefaultSceneStrobeDelayDurationMin(value)
export const setSceneStrobeDelayDurationMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobeDelayDurationMax({ id, value })
      : app.setConfigDefaultSceneStrobeDelayDurationMax(value)
export const setSceneStrobeDelaySinRate =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobeDelaySinRate({ id, value })
      : app.setConfigDefaultSceneStrobeDelaySinRate(value)
export const setSceneStrobeDelayBPMMulti =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobeDelayBPMMulti({ id, value })
      : app.setConfigDefaultSceneStrobeDelayBPMMulti(value)
export const setSceneStrobeEase =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneStrobeEase({ id, value })
      : app.setConfigDefaultSceneStrobeEase(value)
export const setSceneStrobeExp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobeExp({ id, value })
      : app.setConfigDefaultSceneStrobeExp(value)
export const setSceneStrobeOv =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobeOv({ id, value })
      : app.setConfigDefaultSceneStrobeOv(value)
export const setSceneStrobeAmp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobeAmp({ id, value })
      : app.setConfigDefaultSceneStrobeAmp(value)
export const setSceneStrobePer =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobePer({ id, value })
      : app.setConfigDefaultSceneStrobePer(value)
export const setSceneStrobeColorType =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneStrobeColorType({ id, value })
      : app.setConfigDefaultSceneStrobeColorType(value)
export const setSceneStrobeLayer =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneStrobeLayer({ id, value })
      : app.setConfigDefaultSceneStrobeLayer(value)
export const setSceneStrobeOpacity =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneStrobeOpacity({ id, value })
      : app.setConfigDefaultSceneStrobeOpacity(value)
export const setSceneStrobeColor =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneStrobeColor({ id, value })
      : app.setConfigDefaultSceneStrobeColor(value)
export const setSceneStrobeColorSet =
  (id?: number) =>
  (value: string[]): PayloadAction<EntryUpdate<string[]> | string[]> =>
    id !== undefined
      ? slice.setSceneStrobeColorSet({ id, value })
      : app.setConfigDefaultSceneStrobeColorSet(value)
export const setSceneZoomTF =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneZoomTF({ id, value })
      : app.setConfigDefaultSceneZoomTF(value)
export const setSceneZoomDuration =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneZoomDuration({ id, value })
      : app.setConfigDefaultSceneZoomDuration(value)
export const setSceneZoomDurationMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneZoomDurationMin({ id, value })
      : app.setConfigDefaultSceneZoomDurationMin(value)
export const setSceneZoomDurationMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneZoomDurationMax({ id, value })
      : app.setConfigDefaultSceneZoomDurationMax(value)
export const setSceneZoomSinRate =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneZoomSinRate({ id, value })
      : app.setConfigDefaultSceneZoomSinRate(value)
export const setSceneZoomBPMMulti =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneZoomBPMMulti({ id, value })
      : app.setConfigDefaultSceneZoomBPMMulti(value)
export const setSceneTransEase =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneTransEase({ id, value })
      : app.setConfigDefaultSceneTransEase(value)
export const setSceneTransExp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneTransExp({ id, value })
      : app.setConfigDefaultSceneTransExp(value)
export const setSceneTransOv =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneTransOv({ id, value })
      : app.setConfigDefaultSceneTransOv(value)
export const setSceneTransAmp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneTransAmp({ id, value })
      : app.setConfigDefaultSceneTransAmp(value)
export const setSceneTransPer =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneTransPer({ id, value })
      : app.setConfigDefaultSceneTransPer(value)
export const setSceneHorizTransType =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneHorizTransType({ id, value })
      : app.setConfigDefaultSceneHorizTransType(value)
export const setSceneHorizTransRandom =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneHorizTransRandom({ id, value })
      : app.setConfigDefaultSceneHorizTransRandom(value)
export const setSceneHorizTransLevel =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneHorizTransLevel({ id, value })
      : app.setConfigDefaultSceneHorizTransLevel(value)
export const setSceneHorizTransLevelMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneHorizTransLevelMin({ id, value })
      : app.setConfigDefaultSceneHorizTransLevelMin(value)
export const setSceneHorizTransLevelMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneHorizTransLevelMax({ id, value })
      : app.setConfigDefaultSceneHorizTransLevelMax(value)
export const setSceneVertTransType =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneVertTransType({ id, value })
      : app.setConfigDefaultSceneVertTransType(value)
export const setSceneVertTransRandom =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneVertTransRandom({ id, value })
      : app.setConfigDefaultSceneVertTransRandom(value)
export const setSceneVertTransLevel =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneVertTransLevel({ id, value })
      : app.setConfigDefaultSceneVertTransLevel(value)
export const setSceneVertTransLevelMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneVertTransLevelMin({ id, value })
      : app.setConfigDefaultSceneVertTransLevelMin(value)
export const setSceneVertTransLevelMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneVertTransLevelMax({ id, value })
      : app.setConfigDefaultSceneVertTransLevelMax(value)
export const setSceneZoom =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneZoom({ id, value })
      : app.setConfigDefaultSceneZoom(value)
export const setSceneZoomRandom =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneZoomRandom({ id, value })
      : app.setConfigDefaultSceneZoomRandom(value)
export const setSceneZoomStart =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneZoomStart({ id, value })
      : app.setConfigDefaultSceneZoomStart(value)
export const setSceneZoomEnd =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneZoomEnd({ id, value })
      : app.setConfigDefaultSceneZoomEnd(value)
export const setSceneZoomStartMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneZoomStartMin({ id, value })
      : app.setConfigDefaultSceneZoomStartMin(value)
export const setSceneZoomStartMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneZoomStartMax({ id, value })
      : app.setConfigDefaultSceneZoomStartMax(value)
export const setSceneZoomEndMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneZoomEndMin({ id, value })
      : app.setConfigDefaultSceneZoomEndMin(value)
export const setSceneZoomEndMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneZoomEndMax({ id, value })
      : app.setConfigDefaultSceneZoomEndMax(value)
export const setSceneFadeInOut =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setSceneFadeInOut({ id, value })
      : app.setConfigDefaultSceneFadeInOut(value)
export const setSceneFadeIOTF =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneFadeIOTF({ id, value })
      : app.setConfigDefaultSceneFadeIOTF(value)
export const setSceneFadeIODuration =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeIODuration({ id, value })
      : app.setConfigDefaultSceneFadeIODuration(value)
export const setSceneFadeIODurationMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeIODurationMin({ id, value })
      : app.setConfigDefaultSceneFadeIODurationMin(value)
export const setSceneFadeIODurationMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeIODurationMax({ id, value })
      : app.setConfigDefaultSceneFadeIODurationMax(value)
export const setSceneFadeIOSinRate =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeIOSinRate({ id, value })
      : app.setConfigDefaultSceneFadeIOSinRate(value)
export const setSceneFadeIOBPMMulti =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeIOBPMMulti({ id, value })
      : app.setConfigDefaultSceneFadeIOBPMMulti(value)
export const setSceneFadeIOStartExp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeIOStartExp({ id, value })
      : app.setConfigDefaultSceneFadeIOStartExp(value)
export const setSceneFadeIOStartOv =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeIOStartOv({ id, value })
      : app.setConfigDefaultSceneFadeIOStartOv(value)
export const setSceneFadeIOStartAmp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeIOStartAmp({ id, value })
      : app.setConfigDefaultSceneFadeIOStartAmp(value)
export const setSceneFadeIOStartPer =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeIOStartPer({ id, value })
      : app.setConfigDefaultSceneFadeIOStartPer(value)
export const setSceneFadeIOEndExp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeIOEndExp({ id, value })
      : app.setConfigDefaultSceneFadeIOEndExp(value)
export const setSceneFadeIOEndOv =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeIOEndOv({ id, value })
      : app.setConfigDefaultSceneFadeIOEndOv(value)
export const setSceneFadeIOEndAmp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeIOEndAmp({ id, value })
      : app.setConfigDefaultSceneFadeIOEndAmp(value)
export const setSceneFadeIOEndPer =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setSceneFadeIOEndPer({ id, value })
      : app.setConfigDefaultSceneFadeIOEndPer(value)
export const setSceneFadeIOStartEase =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneFadeIOStartEase({ id, value })
      : app.setConfigDefaultSceneFadeIOStartEase(value)
export const setSceneFadeIOEndEase =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setSceneFadeIOEndEase({ id, value })
      : app.setConfigDefaultSceneFadeIOEndEase(value)
export const setScenePanning =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setScenePanning({ id, value })
      : app.setConfigDefaultScenePanning(value)
export const setScenePanTF =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setScenePanTF({ id, value })
      : app.setConfigDefaultScenePanTF(value)
export const setScenePanDuration =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanDuration({ id, value })
      : app.setConfigDefaultScenePanDuration(value)
export const setScenePanDurationMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanDurationMin({ id, value })
      : app.setConfigDefaultScenePanDurationMin(value)
export const setScenePanDurationMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanDurationMax({ id, value })
      : app.setConfigDefaultScenePanDurationMax(value)
export const setScenePanSinRate =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanSinRate({ id, value })
      : app.setConfigDefaultScenePanSinRate(value)
export const setScenePanBPMMulti =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanBPMMulti({ id, value })
      : app.setConfigDefaultScenePanBPMMulti(value)
export const setScenePanStartEase =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setScenePanStartEase({ id, value })
      : app.setConfigDefaultScenePanStartEase(value)
export const setScenePanStartExp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanStartExp({ id, value })
      : app.setConfigDefaultScenePanStartExp(value)
export const setScenePanStartOv =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanStartOv({ id, value })
      : app.setConfigDefaultScenePanStartOv(value)
export const setScenePanStartAmp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanStartAmp({ id, value })
      : app.setConfigDefaultScenePanStartAmp(value)
export const setScenePanStartPer =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanStartPer({ id, value })
      : app.setConfigDefaultScenePanStartPer(value)
export const setScenePanEndEase =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setScenePanEndEase({ id, value })
      : app.setConfigDefaultScenePanEndEase(value)
export const setScenePanEndExp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanEndExp({ id, value })
      : app.setConfigDefaultScenePanEndExp(value)
export const setScenePanEndOv =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanEndOv({ id, value })
      : app.setConfigDefaultScenePanEndOv(value)
export const setScenePanEndAmp =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanEndAmp({ id, value })
      : app.setConfigDefaultScenePanEndAmp(value)
export const setScenePanEndPer =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanEndPer({ id, value })
      : app.setConfigDefaultScenePanEndPer(value)
export const setScenePanHorizTransType =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setScenePanHorizTransType({ id, value })
      : app.setConfigDefaultScenePanHorizTransType(value)
export const setScenePanHorizTransRandom =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setScenePanHorizTransRandom({ id, value })
      : app.setConfigDefaultScenePanHorizTransRandom(value)
export const setScenePanHorizTransImg =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setScenePanHorizTransImg({ id, value })
      : app.setConfigDefaultScenePanHorizTransImg(value)
export const setScenePanHorizTransLevel =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanHorizTransLevel({ id, value })
      : app.setConfigDefaultScenePanHorizTransLevel(value)
export const setScenePanHorizTransLevelMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanHorizTransLevelMin({ id, value })
      : app.setConfigDefaultScenePanHorizTransLevelMin(value)
export const setScenePanHorizTransLevelMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanHorizTransLevelMax({ id, value })
      : app.setConfigDefaultScenePanHorizTransLevelMax(value)
export const setScenePanVertTransType =
  (id?: number) =>
  (value: string): PayloadAction<EntryUpdate<string> | string> =>
    id !== undefined
      ? slice.setScenePanVertTransType({ id, value })
      : app.setConfigDefaultScenePanVertTransType(value)
export const setScenePanVertTransRandom =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setScenePanVertTransRandom({ id, value })
      : app.setConfigDefaultScenePanVertTransRandom(value)
export const setScenePanVertTransImg =
  (id?: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    id !== undefined
      ? slice.setScenePanVertTransImg({ id, value })
      : app.setConfigDefaultScenePanVertTransImg(value)
export const setScenePanVertTransLevel =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanVertTransLevel({ id, value })
      : app.setConfigDefaultScenePanVertTransLevel(value)
export const setScenePanVertTransLevelMin =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanVertTransLevelMin({ id, value })
      : app.setConfigDefaultScenePanVertTransLevelMin(value)
export const setScenePanVertTransLevelMax =
  (id?: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    id !== undefined
      ? slice.setScenePanVertTransLevelMax({ id, value })
      : app.setConfigDefaultScenePanVertTransLevelMax(value)
export const setSceneAddOverlay = (
  overlayID: number,
  sceneID?: number
): PayloadAction<EntryUpdate<number> | number> =>
  sceneID !== undefined
    ? slice.setSceneAddOverlay({ id: sceneID, value: overlayID })
    : app.setConfigDefaultSceneAddOverlay(overlayID)
export const setSceneRemoveOverlay = (
  overlayID: number,
  sceneID?: number
): PayloadAction<EntryUpdate<number> | number> =>
  sceneID !== undefined
    ? slice.setSceneRemoveOverlay({ id: sceneID, value: overlayID })
    : app.setConfigDefaultSceneRemoveOverlay(overlayID)
export const setSceneNextSceneRandoms = (
  nextSceneRandoms: number[],
  sceneID?: number
): PayloadAction<EntryUpdate<number[]> | number[]> =>
  sceneID !== undefined
    ? slice.setSceneNextSceneRandoms({ id: sceneID, value: nextSceneRandoms })
    : app.setConfigDefaultSceneNextSceneRandoms(nextSceneRandoms)
export const setSceneNextSceneID = (
  nextSceneID: number,
  sceneID?: number
): PayloadAction<EntryUpdate<number> | number> =>
  sceneID !== undefined
    ? slice.setSceneNextSceneID({ id: sceneID, value: nextSceneID })
    : app.setConfigDefaultSceneNextSceneID(nextSceneID)
export const setSceneAudioEnabled =
  (id: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    slice.setSceneAudioEnabled({ id, value })
export const setSceneTextEnabled =
  (id: number) =>
  (value: boolean): PayloadAction<EntryUpdate<boolean> | boolean> =>
    slice.setSceneTextEnabled({ id, value })
export const setSceneGeneratorMax =
  (id: number) =>
  (value: number): PayloadAction<EntryUpdate<number> | number> =>
    slice.setSceneGeneratorMax({ id, value })
