import { FontSettingsType } from 'flipflip-common'
import {
  useGetCacheSettingsQuery,
  useGetClipQuery,
  useGetContentSourceQuery,
  useGetDisplayQuery,
  useGetDisplaySettingsQuery,
  useGetGeneralSettingsQuery,
  useGetRemoteSettingsQuery,
  useGetSceneQuery,
  useGetThemeQuery,
  useGetDisplayViewQuery,
  useGetCaptionScriptFontSettingsQuery,
  useGetCaptionScriptQuery,
  useGetAudioQuery,
  flipflipApi
} from './slice'
import { createSelector } from '@reduxjs/toolkit'

export const useGetAudioHasBPMQuery = (id: number) => {
  return useGetAudioQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.bpm != null })
  })
}

export const useGetAudioTickTFQuery = (id: number) => {
  return useGetAudioQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.tickMode })
  })
}

export const useGetAudioTickDurationQuery = (id: number) => {
  return useGetAudioQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.tickDelay })
  })
}

export const useGetAudioTickDurationMinQuery = (id: number) => {
  return useGetAudioQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.tickMinDelay })
  })
}

export const useGetAudioTickDurationMaxQuery = (id: number) => {
  return useGetAudioQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.tickMaxDelay })
  })
}

export const useGetAudioTickSinRateQuery = (id: number) => {
  return useGetAudioQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.tickSinRate })
  })
}

export const useGetAudioTickBPMMultiQuery = (id: number) => {
  return useGetAudioQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.tickBPMMulti })
  })
}

export const useGetAudioStopAtEndQuery = (id: number) => {
  return useGetAudioQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.stopAtEnd })
  })
}

export const useGetAudioNextSceneAtEndQuery = (id: number) => {
  return useGetAudioQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.nextSceneAtEnd })
  })
}

export const useGetAudioTickQuery = (id: number) => {
  return useGetAudioQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.tick })
  })
}

export const useGetAudioSpeedQuery = (id: number) => {
  return useGetAudioQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.speed })
  })
}

export const useGetAudioUrlQuery = (id: number) => {
  return useGetAudioQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.url })
  })
}

export const useGetAudioBPMQuery = (id: number) => {
  return useGetAudioQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.bpm })
  })
}

export const useGetCaptionScriptStopAtEndQuery = (id: number) => {
  return useGetCaptionScriptQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.stopAtEnd })
  })
}

export const useGetCaptionScriptNextSceneAtEndQuery = (id: number) => {
  return useGetCaptionScriptQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.nextSceneAtEnd })
  })
}

export const useGetCaptionScriptSyncWithAudioQuery = (id: number) => {
  return useGetCaptionScriptQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.syncWithAudio })
  })
}

export const useGetCaptionScriptOpacityQuery = (id: number) => {
  return useGetCaptionScriptQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.opacity })
  })
}

export const useGetCaptionScriptFontSettingsBorderQuery = (
  id: number,
  type: FontSettingsType
) => {
  return useGetCaptionScriptFontSettingsQuery(
    { id, type },
    {
      selectFromResult: ({ data }) => ({ data: data?.border })
    }
  )
}

export const useGetCaptionScriptFontSettingsColorQuery = (
  id: number,
  type: FontSettingsType
) => {
  return useGetCaptionScriptFontSettingsQuery(
    { id, type },
    {
      selectFromResult: ({ data }) => ({ data: data?.color })
    }
  )
}

export const useGetCaptionScriptFontSettingsBorderColorQuery = (
  id: number,
  type: FontSettingsType
) => {
  return useGetCaptionScriptFontSettingsQuery(
    { id, type },
    {
      selectFromResult: ({ data }) => ({ data: data?.borderColor })
    }
  )
}

export const useGetCaptionScriptFontSettingsFontFamilyQuery = (
  id: number,
  type: FontSettingsType
) => {
  return useGetCaptionScriptFontSettingsQuery(
    { id, type },
    {
      selectFromResult: ({ data }) => ({ data: data?.fontFamily })
    }
  )
}

export const useGetCaptionScriptFontSettingsFontSizeQuery = (
  id: number,
  type: FontSettingsType
) => {
  return useGetCaptionScriptFontSettingsQuery(
    { id, type },
    {
      selectFromResult: ({ data }) => ({ data: data?.fontSize })
    }
  )
}

export const useGetCaptionScriptFontSettingsBorderPxQuery = (
  id: number,
  type: FontSettingsType
) => {
  return useGetCaptionScriptFontSettingsQuery(
    { id, type },
    {
      selectFromResult: ({ data }) => ({ data: data?.borderpx })
    }
  )
}

export const useGetDisplayViewColorQuery = (id: number) => {
  return useGetDisplayViewQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.color })
  })
}

export const useGetDisplayViewHeightQuery = (id: number) => {
  return useGetDisplayViewQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.height })
  })
}

export const useGetDisplayViewOpacityQuery = (id: number) => {
  return useGetDisplayViewQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.opacity })
  })
}

export const useGetDisplayViewSyncQuery = (id: number) => {
  return useGetDisplayViewQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.sync })
  })
}

export const useGetDisplayViewMirrorSyncedViewQuery = (id: number) => {
  return useGetDisplayViewQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.mirrorSyncedView })
  })
}

export const useGetDisplayViewSyncWithViewQuery = (id: number) => {
  return useGetDisplayViewQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.syncWithView?.toString() })
  })
}

export const useGetDisplayViewWidthQuery = (id: number) => {
  return useGetDisplayViewQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.width })
  })
}

export const useGetDisplayViewXQuery = (id: number) => {
  return useGetDisplayViewQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.x })
  })
}

export const useGetDisplayViewYQuery = (id: number) => {
  return useGetDisplayViewQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.y })
  })
}

export const useGetDisplayViewZQuery = (id: number) => {
  return useGetDisplayViewQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.z })
  })
}

export const useGetDisplayViewScenePlaylistIDQuery = (id: number) => {
  return useGetDisplayViewQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.playlistID?.toString() })
  })
}

export const useGetDisplayNameQuery = (id: number) => {
  return useGetDisplayQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.name })
  })
}

export const useGetClipEnabledQuery = (id: number) => {
  return useGetClipQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.disabled === false })
  })
}

export const useGetContentSourceDirOfSourcesQuery = (id: number) => {
  return useGetContentSourceQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.dirOfSources })
  })
}
export const useGetContentSourceSubtitleFileQuery = (id: number) => {
  return useGetContentSourceQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.subtitleFile })
  })
}
export const useGetContentSourceRedditFuncQuery = (id: number) => {
  return useGetContentSourceQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.redditFunc })
  })
}
export const useGetContentSourceRedditTimeQuery = (id: number) => {
  return useGetContentSourceQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.redditTime })
  })
}
export const useGetContentSourceIncludeRepliesQuery = (id: number) => {
  return useGetContentSourceQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.includeReplies })
  })
}
export const useGetContentSourceIncludeRetweetsQuery = (id: number) => {
  return useGetContentSourceQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.includeRetweets })
  })
}
export const useGetContentSourceWeightQuery = (id: number) => {
  return useGetContentSourceQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.weight })
  })
}

export const useGetSceneGeneratorMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.generatorMax })
  })
}
export const useGetSceneAudioEnabledQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.audioEnabled })
  })
}
export const useGetSceneTextEnabledQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.textEnabled })
  })
}
export const useGetSceneBackForthQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.backForth })
  })
}
export const useGetSceneBackForthBPMMultiQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.backForthBPMMulti })
  })
}
export const useGetSceneBackForthDurationQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.backForthConstant })
  })
}
export const useGetSceneBackForthDurationMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.backForthMax })
  })
}
export const useGetSceneBackForthDurationMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.backForthMin })
  })
}
export const useGetSceneBackForthSinRateQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.backForthSinRate })
  })
}
export const useGetSceneBackForthTFQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.backForthTF })
  })
}
export const useGetSceneBackgroundBlurQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.backgroundBlur })
  })
}
export const useGetSceneBackgroundColorQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.backgroundColor })
  })
}
export const useGetSceneBackgroundColorSetQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.backgroundColorSet })
  })
}
export const useGetSceneBackgroundTypeQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.backgroundType })
  })
}
export const useGetSceneContinueVideoQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.continueVideo })
  })
}
export const useGetSceneCrossFadeQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.crossFade })
  })
}
export const useGetSceneCrossFadeAudioQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.crossFadeAudio })
  })
}
export const useGetSceneFadeAmpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeAmp })
  })
}
export const useGetSceneFadeBPMMultiQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeBPMMulti })
  })
}
export const useGetSceneFadeDurationQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeDuration })
  })
}
export const useGetSceneFadeDurationMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeDurationMax })
  })
}
export const useGetSceneFadeDurationMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeDurationMin })
  })
}
export const useGetSceneFadeEaseQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeEase })
  })
}
export const useGetSceneFadeExpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeExp })
  })
}
export const useGetSceneFadeInOutQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeInOut })
  })
}
export const useGetSceneFadeIOBPMMultiQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIOBPMMulti })
  })
}
export const useGetSceneFadeIODurationQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIODuration })
  })
}
export const useGetSceneFadeIODurationMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIODurationMax })
  })
}
export const useGetSceneFadeIODurationMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIODurationMin })
  })
}
export const useGetSceneFadeIOEndAmpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIOEndAmp })
  })
}
export const useGetSceneFadeIOEndEaseQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIOEndEase })
  })
}
export const useGetSceneFadeIOEndExpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIOEndExp })
  })
}
export const useGetSceneFadeIOEndOvQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIOEndOv })
  })
}
export const useGetSceneFadeIOEndPerQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIOEndPer })
  })
}
export const useGetSceneFadeIOSinRateQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIOSinRate })
  })
}
export const useGetSceneFadeIOStartAmpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIOStartAmp })
  })
}
export const useGetSceneFadeIOStartEaseQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIOStartEase })
  })
}
export const useGetSceneFadeIOStartExpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIOStartExp })
  })
}
export const useGetSceneFadeIOStartOvQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIOStartOv })
  })
}
export const useGetSceneFadeIOStartPerQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIOStartPer })
  })
}
export const useGetSceneFadeIOTFQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeIOTF })
  })
}
export const useGetSceneFadeOvQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeOv })
  })
}
export const useGetSceneFadePerQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadePer })
  })
}
export const useGetSceneFadeSinRateQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeSinRate })
  })
}
export const useGetSceneFadeTFQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fadeTF })
  })
}
export const useGetSceneForceAllQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.forceAll })
  })
}
export const useGetSceneForceAllSourceQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.forceAllSource })
  })
}
export const useGetSceneFullSourceQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.fullSource })
  })
}
export const useGetSceneGifOptionQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.gifOption })
  })
}
export const useGetSceneGifTimingConstantQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.gifTimingConstant })
  })
}
export const useGetSceneGifTimingMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.gifTimingMax })
  })
}
export const useGetSceneGifTimingMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.gifTimingMin })
  })
}
export const useGetSceneHasGeneratorWeightsQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.generatorWeights != null })
  })
}
export const useGetSceneHorizTransLevelQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.horizTransLevel })
  })
}
export const useGetSceneHorizTransLevelMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.horizTransLevelMax })
  })
}
export const useGetSceneHorizTransLevelMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.horizTransLevelMin })
  })
}
export const useGetSceneHorizTransRandomQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.horizTransRandom })
  })
}
export const useGetSceneHorizTransTypeQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.horizTransType })
  })
}
export const useGetSceneImageOrientationQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.imageOrientation })
  })
}
export const useGetSceneImageTypeQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.imageType })
  })
}
export const useGetSceneImageTypeFilterQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.imageTypeFilter })
  })
}
export const useGetSceneOrderFunctionQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.orderFunction })
  })
}

export const useGetScenePanBPMMultiQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panBPMMulti })
  })
}
export const useGetScenePanDurationQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panDuration })
  })
}
export const useGetScenePanDurationMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panDurationMax })
  })
}
export const useGetScenePanDurationMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panDurationMin })
  })
}
export const useGetScenePanEndAmpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panEndAmp })
  })
}
export const useGetScenePanEndEaseQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panEndEase })
  })
}
export const useGetScenePanEndExpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panEndExp })
  })
}
export const useGetScenePanEndOvQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panEndOv })
  })
}
export const useGetScenePanEndPerQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panEndPer })
  })
}
export const useGetScenePanHorizTransImgQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panHorizTransImg })
  })
}
export const useGetScenePanHorizTransLevelQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panHorizTransLevel })
  })
}
export const useGetScenePanHorizTransLevelMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panHorizTransLevelMax })
  })
}
export const useGetScenePanHorizTransLevelMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panHorizTransLevelMin })
  })
}
export const useGetScenePanHorizTransRandomQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panHorizTransRandom })
  })
}
export const useGetScenePanHorizTransTypeQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panHorizTransType })
  })
}
export const useGetScenePanningQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panning })
  })
}
export const useGetScenePanSinRateQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panSinRate })
  })
}
export const useGetScenePanStartAmpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panStartAmp })
  })
}
export const useGetScenePanStartEaseQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panStartEase })
  })
}
export const useGetScenePanStartExpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panStartExp })
  })
}
export const useGetScenePanStartOvQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panStartOv })
  })
}
export const useGetScenePanStartPerQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panStartPer })
  })
}
export const useGetScenePanTFQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panTF })
  })
}
export const useGetScenePanVertTransImgQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panVertTransImg })
  })
}
export const useGetScenePanVertTransLevelQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panVertTransLevel })
  })
}
export const useGetScenePanVertTransLevelMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panVertTransLevelMax })
  })
}
export const useGetScenePanVertTransLevelMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panVertTransLevelMin })
  })
}
export const useGetScenePanVertTransRandomQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panVertTransRandom })
  })
}
export const useGetScenePanVertTransTypeQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.panVertTransType })
  })
}
export const useGetScenePlayVideoClipsQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.playVideoClips })
  })
}
export const useGetSceneRandomVideoStartQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.randomVideoStart })
  })
}
export const useGetSceneRegenerateQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.regenerate })
  })
}
export const useGetSceneSkipVideoEndQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.skipVideoEnd })
  })
}
export const useGetSceneSkipVideoStartQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.skipVideoStart })
  })
}

export const useGetSceneSlideQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.slide })
  })
}
export const useGetSceneSlideAmpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.slideAmp })
  })
}
export const useGetSceneSlideBPMMultiQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.slideBPMMulti })
  })
}
export const useGetSceneSlideDistanceQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.slideDistance })
  })
}
export const useGetSceneSlideDurationQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.slideDuration })
  })
}
export const useGetSceneSlideDurationMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.slideDurationMax })
  })
}
export const useGetSceneSlideDurationMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.slideDurationMin })
  })
}
export const useGetSceneSlideEaseQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.slideEase })
  })
}
export const useGetSceneSlideExpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.slideExp })
  })
}
export const useGetSceneSlideOvQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.slideOv })
  })
}
export const useGetSceneSlidePerQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.slidePer })
  })
}
export const useGetSceneSlideSinRateQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.slideSinRate })
  })
}
export const useGetSceneSlideTFQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.slideTF })
  })
}
export const useGetSceneSlideTypeQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.slideType })
  })
}
export const useGetSceneSourceOrderFunctionQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.sourceOrderFunction })
  })
}
export const useGetSceneStrobeQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobe })
  })
}
export const useGetSceneStrobeAmpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeAmp })
  })
}
export const useGetSceneStrobeBPMMultiQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeBPMMulti })
  })
}
export const useGetSceneStrobeColorQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeColor })
  })
}
export const useGetSceneStrobeColorSetQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeColorSet })
  })
}
export const useGetSceneStrobeColorTypeQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeColorType })
  })
}
export const useGetSceneStrobeDelayBPMMultiQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeDelayBPMMulti })
  })
}
export const useGetSceneStrobeDelayDurationQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeDelay })
  })
}
export const useGetSceneStrobeDelayDurationMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeDelayMax })
  })
}
export const useGetSceneStrobeDelayDurationMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeDelayMin })
  })
}
export const useGetSceneStrobeDelaySinRateQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeDelaySinRate })
  })
}
export const useGetSceneStrobeDelayTFQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeDelayTF })
  })
}
export const useGetSceneStrobeDurationQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeTime })
  })
}
export const useGetSceneStrobeDurationMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeTimeMax })
  })
}
export const useGetSceneStrobeDurationMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeTimeMin })
  })
}
export const useGetSceneStrobeEaseQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeEase })
  })
}
export const useGetSceneStrobeExpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeExp })
  })
}
export const useGetSceneStrobeLayerQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeLayer })
  })
}
export const useGetSceneStrobeOpacityQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeOpacity })
  })
}
export const useGetSceneStrobeOvQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeOv })
  })
}
export const useGetSceneStrobePerQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobePer })
  })
}
export const useGetSceneStrobePulseQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobePulse })
  })
}
export const useGetSceneStrobeSinRateQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeSinRate })
  })
}
export const useGetSceneStrobeTFQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.strobeTF })
  })
}
export const useGetSceneTimingBPMMultiQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.timingBPMMulti })
  })
}
export const useGetSceneTimingDurationQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.timingConstant })
  })
}
export const useGetSceneTimingDurationMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.timingMax })
  })
}
export const useGetSceneTimingDurationMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.timingMin })
  })
}
export const useGetSceneTimingSinRateQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.timingSinRate })
  })
}
export const useGetSceneTimingTFQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.timingFunction })
  })
}
export const useGetSceneTransAmpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.transAmp })
  })
}
export const useGetSceneTransEaseQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.transEase })
  })
}
export const useGetSceneTransExpQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.transExp })
  })
}
export const useGetSceneTransOvQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.transOv })
  })
}
export const useGetSceneTransPerQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.transPer })
  })
}
export const useGetSceneVertTransLevelQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.vertTransLevel })
  })
}
export const useGetSceneVertTransLevelMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.vertTransLevelMax })
  })
}
export const useGetSceneVertTransLevelMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.vertTransLevelMin })
  })
}
export const useGetSceneVertTransRandomQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.vertTransRandom })
  })
}
export const useGetSceneVertTransTypeQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.vertTransType })
  })
}
export const useGetSceneVideoOptionQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.videoOption })
  })
}
export const useGetSceneVideoOrientationQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.videoOrientation })
  })
}
export const useGetSceneVideoRandomSpeedQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.videoRandomSpeed })
  })
}
export const useGetSceneVideoSkipQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.videoSkip })
  })
}
export const useGetSceneVideoSpeedQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.videoSpeed })
  })
}
export const useGetSceneVideoSpeedMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.videoSpeedMax })
  })
}
export const useGetSceneVideoSpeedMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.videoSpeedMin })
  })
}
export const useGetSceneVideoTimingConstantQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.videoTimingConstant })
  })
}
export const useGetSceneVideoTimingMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.videoTimingMax })
  })
}
export const useGetSceneVideoTimingMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.videoTimingMin })
  })
}
export const useGetSceneVideoVolumeQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.videoVolume })
  })
}
export const useGetSceneWeightFunctionQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.weightFunction })
  })
}
export const useGetSceneZoomQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.zoom })
  })
}
export const useGetSceneZoomBPMMultiQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.transBPMMulti })
  })
}
export const useGetSceneZoomDurationQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.transDuration })
  })
}
export const useGetSceneZoomDurationMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.transDurationMax })
  })
}
export const useGetSceneZoomDurationMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.transDurationMin })
  })
}
export const useGetSceneZoomEndQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.zoomEnd })
  })
}
export const useGetSceneZoomEndMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.zoomEndMax })
  })
}
export const useGetSceneZoomEndMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.zoomEndMin })
  })
}
export const useGetSceneZoomRandomQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.zoomRandom })
  })
}
export const useGetSceneZoomSinRateQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.transSinRate })
  })
}
export const useGetSceneZoomStartQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.zoomStart })
  })
}
export const useGetSceneZoomStartMaxQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.zoomStartMax })
  })
}
export const useGetSceneZoomStartMinQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.zoomStartMin })
  })
}
export const useGetSceneZoomTFQuery = (id: number) => {
  return useGetSceneQuery(id, {
    selectFromResult: ({ data }) => ({ data: data?.transTF })
  })
}

export const useGetThemeModeQuery = () => {
  return useGetThemeQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.mode === 'dark' })
  })
}
export const useGetThemePrimaryColorQuery = () => {
  return useGetThemeQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.primaryColor })
  })
}
export const useGetThemeSecondaryColorQuery = () => {
  return useGetThemeQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.secondaryColor })
  })
}
export const useGetCachingEnabledQuery = () => {
  return useGetCacheSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.enabled })
  })
}
export const useGetCachingDirectoryQuery = () => {
  return useGetCacheSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.directory })
  })
}
export const useGetCachingMaxSizeQuery = () => {
  return useGetCacheSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.maxSize })
  })
}
export const useGetGeneralSettingsCleanRetainQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.cleanRetain })
  })
}
export const useGetGeneralSettingsAutoCleanBackupMonthsQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.autoCleanBackupMonths })
  })
}
export const useGetGeneralSettingsAutoCleanBackupWeeksQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.autoCleanBackupWeeks })
  })
}
export const useGetGeneralSettingsAutoCleanBackupDaysQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.autoCleanBackupDays })
  })
}
export const useGetGeneralSettingsAutoCleanBackupQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.autoCleanBackup })
  })
}
export const useGetGeneralSettingsAutoBackupDaysQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.autoBackupDays })
  })
}
export const useGetGeneralSettingsAutoBackupQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.autoBackup })
  })
}
export const useGetGeneralSettingsWatermarkQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.watermark })
  })
}
export const useGetGeneralSettingsWatermarkDisplayQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.watermarkDisplay })
  })
}
export const useGetGeneralSettingsWatermarkCornerQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.watermarkCorner })
  })
}
export const useGetGeneralSettingsWatermarkFontFamilyQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.watermarkFontFamily })
  })
}
export const useGetGeneralSettingsWatermarkColorQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.watermarkColor })
  })
}
export const useGetGeneralSettingsWatermarkTextQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.watermarkText })
  })
}
export const useGetGeneralSettingsWatermarkFontSizeQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.watermarkFontSize })
  })
}
export const useGetRemoteSettingsSilenceTumblrAlertQuery = () => {
  return useGetRemoteSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.silenceTumblrAlert })
  })
}
export const useGetRemoteSettingsHydrusConfiguredQuery = () => {
  return useGetRemoteSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: !!data?.hydrusAPIKey?.length })
  })
}
export const useGetRemoteSettingsInstagramConfiguredQuery = () => {
  return useGetRemoteSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data:
        !!data?.instagramUsername?.length && !!data?.instagramPassword?.length
    })
  })
}
export const useGetRemoteSettingsPiwigoConfiguredQuery = () => {
  return useGetRemoteSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data:
        !!data?.piwigoProtocol?.length &&
        !!data?.piwigoHost?.length &&
        !!data?.piwigoUsername?.length &&
        !!data?.piwigoPassword?.length
    })
  })
}
export const useGetRemoteSettingsRedditAuthorizedQuery = () => {
  return useGetRemoteSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data: !!data?.redditRefreshToken?.length
    })
  })
}
export const useGetRemoteSettingsTumblrAuthorizedQuery = () => {
  return useGetRemoteSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data:
        !!data?.tumblrOAuthToken?.length &&
        !!data?.tumblrOAuthTokenSecret?.length
    })
  })
}
export const useGetRemoteSettingsTwitterAuthorizedQuery = () => {
  return useGetRemoteSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data:
        !!data?.twitterAccessTokenKey?.length &&
        !!data?.twitterAccessTokenSecret?.length
    })
  })
}
export const useGetDisplaySettingsMinImageSizeQuery = () => {
  return useGetDisplaySettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.minImageSize })
  })
}
export const useGetDisplaySettingsMinVideoSizeQuery = () => {
  return useGetDisplaySettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.minVideoSize })
  })
}
export const useGetDisplaySettingsMaxInHistoryQuery = () => {
  return useGetDisplaySettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.maxInHistory })
  })
}
export const useGetDisplaySettingsMaxInMemoryQuery = () => {
  return useGetDisplaySettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.maxInMemory })
  })
}
export const useGetDisplaySettingsMaxLoadingAtOnceQuery = () => {
  return useGetDisplaySettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.maxLoadingAtOnce })
  })
}
export const useGetGeneralSettingsPrioritizePerformanceQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.prioritizePerformance })
  })
}
export const useGetGeneralSettingsConfirmSceneDeletionQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.confirmSceneDeletion })
  })
}
export const useGetGeneralSettingsConfirmBlacklistQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.confirmBlacklist })
  })
}
export const useGetGeneralSettingsConfirmFileDeletionQuery = () => {
  return useGetGeneralSettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.confirmFileDeletion })
  })
}
export const useGetDisplaySettingsFullScreenQuery = () => {
  return useGetDisplaySettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.fullScreen })
  })
}
export const useGetDisplaySettingsStartImmediatelyQuery = () => {
  return useGetDisplaySettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.startImmediately })
  })
}
export const useGetDisplaySettingsClickToProgressQuery = () => {
  return useGetDisplaySettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.clickToProgress })
  })
}
export const useGetDisplaySettingsClickToProgressWhilePlayingQuery = () => {
  return useGetDisplaySettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data: data?.clickToProgressWhilePlaying
    })
  })
}
export const useGetDisplaySettingsEasingControlsQuery = () => {
  return useGetDisplaySettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.easingControls })
  })
}
export const useGetDisplaySettingsAudioAlertQuery = () => {
  return useGetDisplaySettingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.audioAlert })
  })
}

const createGetCaptionScriptSelector = createSelector(
  (id: number) => id,
  (id) => flipflipApi.endpoints.getCaptionScript.select(id)
)

export const selectScriptLibrarySelectedTagIDs = (ids: number[]) => {
  const inputs = ids.map((id) => createGetCaptionScriptSelector(id))
  return createSelector(inputs, (...outputs) => {
    const counts = new Map<number, number>()
    outputs
      .flatMap((output) => output?.data?.tags ?? [])
      .forEach((tag: number) => counts.set(tag, (counts.get(tag) ?? 0) + 1))
    const tagIDs: number[] = []
    counts.forEach((value, key) => {
      if (value === outputs.length) {
        tagIDs.push(key)
      }
    })

    return tagIDs
  })
}

const createGetAudioSelector = createSelector(
  (id: number) => id,
  (id) => flipflipApi.endpoints.getAudio.select(id)
)

export const selectAudioLibrarySelectedTagIDs = (ids: number[]) => {
  const inputs = ids.map((id) => createGetAudioSelector(id))
  return createSelector(inputs, (...outputs) => {
    const counts = new Map<number, number>()
    outputs
      .flatMap((output) => output?.data?.tags ?? [])
      .forEach((tag: number) => counts.set(tag, (counts.get(tag) ?? 0) + 1))
    const tagIDs: number[] = []
    counts.forEach((value, key) => {
      if (value === outputs.length) {
        tagIDs.push(key)
      }
    })

    return tagIDs
  })
}

const createGetTagSelector = createSelector(
  (id: number) => id,
  (id) => flipflipApi.endpoints.getTag.select(id)
)

export const selectLibrarySelectedTagNames = (ids: number[]) => {
  const inputs = ids.map((id) => createGetTagSelector(id))
  return createSelector(inputs, (...outputs) =>
    outputs.map((output) => output?.data?.name ?? '').sort()
  )
}
