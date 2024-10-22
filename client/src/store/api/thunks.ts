import debounce from 'debounce'
import { AppDispatch } from '../store'
import { flipflipApi } from './slice'
import {
  Audio,
  CacheSettings,
  CaptionScript,
  Clip,
  ContentSource,
  Display,
  DisplaySettings,
  DisplayView,
  FontSettings,
  FontSettingsType,
  GeneralSettings,
  Playlist,
  RemoteSettings,
  Scene,
  ThemeSettings
} from 'flipflip-common'

export const refreshConnectToken = () => {
  return (dispatch: AppDispatch): void => {
    dispatch(
      flipflipApi.endpoints.getConnectToken.initiate(undefined, {
        forceRefetch: true
      })
    )
  }
}

const updateLocalAudio = (update: Pick<Audio, 'id'> & Partial<Audio>) => {
  return flipflipApi.util.updateQueryData('getAudio', update.id, (draft) => {
    Object.assign(draft, update)
  })
}

const updateRemoteAudio = debounce(
  (update: Pick<Audio, 'id'> & Partial<Audio>, dispatch: AppDispatch) => {
    dispatch(flipflipApi.endpoints.updateAudio.initiate(update))
  },
  250
)

const updateAudio = (update: Pick<Audio, 'id'> & Partial<Audio>) => {
  return (dispatch: AppDispatch) => {
    dispatch(updateLocalAudio(update))
    updateRemoteAudio(update, dispatch)
  }
}

export const setAudioTickTF = (id: number) => {
  return (tickMode: string) => {
    return updateAudio({ id, tickMode })
  }
}

export const setAudioTickDuration = (id: number) => {
  return (tickDelay: number) => {
    return updateAudio({ id, tickDelay })
  }
}

export const setAudioTickDurationMin = (id: number) => {
  return (tickMinDelay: number) => {
    return updateAudio({ id, tickMinDelay })
  }
}

export const setAudioTickDurationMax = (id: number) => {
  return (tickMaxDelay: number) => {
    return updateAudio({ id, tickMaxDelay })
  }
}

export const setAudioTickSinRate = (id: number) => {
  return (tickSinRate: number) => {
    return updateAudio({ id, tickSinRate })
  }
}

export const setAudioTickBPMMulti = (id: number) => {
  return (tickBPMMulti: number) => {
    return updateAudio({ id, tickBPMMulti })
  }
}

export const setAudioStopAtEnd = (id: number) => {
  return (stopAtEnd: boolean) => {
    return updateAudio({ id, stopAtEnd })
  }
}

export const setAudioNextSceneAtEnd = (id: number) => {
  return (nextSceneAtEnd: boolean) => {
    return updateAudio({ id, nextSceneAtEnd })
  }
}

export const setAudioTick = (id: number) => {
  return (tick: boolean) => {
    return updateAudio({ id, tick })
  }
}

export const setAudioSpeed = (id: number) => {
  return (speed: number) => {
    return updateAudio({ id, speed })
  }
}

export const setAudioVolume = (id: number) => {
  return (volume: number) => {
    return updateAudio({ id, volume })
  }
}

export const setAudioUrl = (id: number) => {
  return (url: string) => {
    return updateAudio({ id, url })
  }
}

export const setAudioBPM = (id: number) => {
  return (bpm: number) => {
    return updateAudio({ id, bpm })
  }
}

const updateLocalCaptionScript = (
  update: Pick<CaptionScript, 'id'> & Partial<CaptionScript>
) => {
  return flipflipApi.util.updateQueryData(
    'getCaptionScript',
    update.id,
    (draft) => {
      Object.assign(draft, update)
    }
  )
}

const updateRemoteCaptionScript = debounce(
  (
    update: Pick<CaptionScript, 'id'> & Partial<CaptionScript>,
    dispatch: AppDispatch
  ) => {
    dispatch(flipflipApi.endpoints.updateCaptionScript.initiate(update))
  },
  250
)

const updateCaptionScript = (
  update: Pick<CaptionScript, 'id'> & Partial<CaptionScript>
) => {
  return (dispatch: AppDispatch) => {
    dispatch(updateLocalCaptionScript(update))
    updateRemoteCaptionScript(update, dispatch)
  }
}

export const setCaptionScriptStopAtEnd = (id: number) => {
  return (stopAtEnd: boolean) => {
    return updateCaptionScript({ id, stopAtEnd })
  }
}

export const setCaptionScriptNextSceneAtEnd = (id: number) => {
  return (nextSceneAtEnd: boolean) => {
    return updateCaptionScript({ id, nextSceneAtEnd })
  }
}

export const setCaptionScriptSyncWithAudio = (id: number) => {
  return (syncWithAudio: boolean) => {
    return updateCaptionScript({ id, syncWithAudio })
  }
}

export const setCaptionScriptOpacity = (id: number) => {
  return (opacity: number) => {
    return updateCaptionScript({ id, opacity })
  }
}

const updateLocalCaptionScriptFontSettings = (
  update: { id: number; type: FontSettingsType } & Partial<FontSettings>
) => {
  const { id, type } = update
  return flipflipApi.util.updateQueryData(
    'getCaptionScriptFontSettings',
    { id, type },
    (draft) => {
      Object.assign(draft, update)
    }
  )
}

const updateRemoteCaptionScriptFontSettings = debounce(
  (
    update: { id: number; type: FontSettingsType } & Partial<FontSettings>,
    dispatch: AppDispatch
  ) => {
    dispatch(
      flipflipApi.endpoints.updateCaptionScriptFontSettings.initiate(update)
    )
  },
  250
)

const updateCaptionScriptFontSettings = (
  update: { id: number; type: FontSettingsType } & Partial<FontSettings>
) => {
  return (dispatch: AppDispatch) => {
    dispatch(updateLocalCaptionScriptFontSettings(update))
    updateRemoteCaptionScriptFontSettings(update, dispatch)
  }
}

export const setCaptionScriptFontSettingsBorder = (
  id: number,
  type: FontSettingsType
) => {
  return (border: boolean) => {
    return updateCaptionScriptFontSettings({ id, type, border })
  }
}

export const setCaptionScriptFontSettingsColor = (
  id: number,
  type: FontSettingsType
) => {
  return (color: string) => {
    return updateCaptionScriptFontSettings({ id, type, color })
  }
}

export const setCaptionScriptFontSettingsBorderColor = (
  id: number,
  type: FontSettingsType
) => {
  return (borderColor: string) => {
    return updateCaptionScriptFontSettings({ id, type, borderColor })
  }
}

export const setCaptionScriptFontSettingsFontFamily = (
  id: number,
  type: FontSettingsType
) => {
  return (fontFamily: string) => {
    return updateCaptionScriptFontSettings({ id, type, fontFamily })
  }
}

export const setCaptionScriptFontSettingsFontSize = (
  id: number,
  type: FontSettingsType
) => {
  return (fontSize: number) => {
    return updateCaptionScriptFontSettings({ id, type, fontSize })
  }
}

export const setCaptionScriptFontSettingsBorderPx = (
  id: number,
  type: FontSettingsType
) => {
  return (borderpx: number) => {
    return updateCaptionScriptFontSettings({ id, type, borderpx })
  }
}

const updateLocalPlaylist = (
  update: Pick<Playlist, 'id'> & Partial<Playlist>
) => {
  return flipflipApi.util.updateQueryData('getPlaylist', update.id, (draft) => {
    Object.assign(draft, update)
  })
}

const updateRemotePlaylist = debounce(
  (update: Pick<Playlist, 'id'> & Partial<Playlist>, dispatch: AppDispatch) => {
    dispatch(flipflipApi.endpoints.updatePlaylist.initiate(update))
  },
  250
)

const updatePlaylist = (update: Pick<Playlist, 'id'> & Partial<Playlist>) => {
  return (dispatch: AppDispatch) => {
    dispatch(updateLocalPlaylist(update))
    updateRemotePlaylist(update, dispatch)
  }
}

export const setPlaylistName = (id: number, name: string) => {
  return updatePlaylist({ id, name })
}

const updateLocalDisplayView = (
  update: Pick<DisplayView, 'id'> & Partial<DisplayView>
) => {
  return flipflipApi.util.updateQueryData(
    'getDisplayView',
    update.id,
    (draft) => {
      Object.assign(draft, update)
    }
  )
}

const updateRemoteDisplayView = debounce(
  (
    update: Pick<DisplayView, 'id'> & Partial<DisplayView>,
    dispatch: AppDispatch
  ) => {
    dispatch(flipflipApi.endpoints.updateDisplayView.initiate(update))
  },
  250
)

const updateDisplayView = (
  update: Pick<DisplayView, 'id'> & Partial<DisplayView>
) => {
  return (dispatch: AppDispatch) => {
    dispatch(updateLocalDisplayView(update))
    updateRemoteDisplayView(update, dispatch)
  }
}

export const setDisplayViewColor = (id: number) => {
  return (color: string) => {
    return updateDisplayView({ id, color })
  }
}

export const setDisplayViewHeight = (id: number) => {
  return (height: number) => {
    return updateDisplayView({ id, height })
  }
}

export const setDisplayViewX = (id: number) => {
  return (x: number) => {
    return updateDisplayView({ id, x })
  }
}

export const setDisplayViewY = (id: number) => {
  return (y: number) => {
    return updateDisplayView({ id, y })
  }
}

export const setDisplayViewWidth = (id: number) => {
  return (width: number) => {
    return updateDisplayView({ id, width })
  }
}

export const setDisplayViewOpacity = (id: number) => {
  return (opacity: number) => {
    return updateDisplayView({ id, opacity })
  }
}

export const setDisplayViewZ = (id: number) => {
  return (z: number) => {
    return updateDisplayView({ id, z })
  }
}

export const setDisplayViewSync = (id: number) => {
  return (sync: boolean) => {
    return updateDisplayView({ id, sync })
  }
}

export const setDisplayViewMirrorSyncedView = (id: number) => {
  return (mirrorSyncedView: string) => {
    return updateDisplayView({ id, mirrorSyncedView })
  }
}

export const setDisplayViewSyncWithView = (id: number) => {
  return (syncWithView: string) => {
    return updateDisplayView({ id, syncWithView: Number(syncWithView) })
  }
}

export const setDisplayViewScenePlaylistID = (id: number) => {
  return (playlistID: string) => {
    return updateDisplayView({ id, playlistID: Number(playlistID) })
  }
}

export const setDisplayViewName = (id: number, name: string) => {
  return updateDisplayView({ id, name })
}

export const setDisplayViewVisible = (id: number, visible: boolean) => {
  return updateDisplayView({ id, visible })
}

const updateLocalDisplay = (update: Pick<Display, 'id'> & Partial<Display>) => {
  return flipflipApi.util.updateQueryData('getDisplay', update.id, (draft) => {
    Object.assign(draft, update)
  })
}

const updateRemoteDisplay = debounce(
  (update: Pick<Display, 'id'> & Partial<Display>, dispatch: AppDispatch) => {
    dispatch(flipflipApi.endpoints.updateDisplay.initiate(update))
  },
  250
)

const updateDisplay = (update: Pick<Display, 'id'> & Partial<Display>) => {
  return (dispatch: AppDispatch) => {
    dispatch(updateLocalDisplay(update))
    updateRemoteDisplay(update, dispatch)
  }
}

export const setDisplayName = (id: number) => {
  return (name: string) => {
    return updateDisplay({ id, name })
  }
}

const updateLocalClip = (update: Pick<Clip, 'id'> & Partial<Clip>) => {
  return flipflipApi.util.updateQueryData('getClip', update.id, (draft) => {
    Object.assign(draft, update)
  })
}

const updateRemoteClip = debounce(
  (update: Pick<Clip, 'id'> & Partial<Clip>, dispatch: AppDispatch) => {
    dispatch(flipflipApi.endpoints.updateClip.initiate(update))
  },
  250
)

const updateClip = (update: Pick<Clip, 'id'> & Partial<Clip>) => {
  return (dispatch: AppDispatch) => {
    dispatch(updateLocalClip(update))
    updateRemoteClip(update, dispatch)
  }
}

export const setClipEnabled = (id: number) => {
  return (enabled: boolean) => {
    return updateClip({ id, disabled: !enabled })
  }
}

const updateLocalContentSource = (
  update: Pick<ContentSource, 'id'> & Partial<ContentSource>
) => {
  return flipflipApi.util.updateQueryData(
    'getContentSource',
    update.id,
    (draft) => {
      Object.assign(draft, update)
    }
  )
}

const updateRemoteContentSource = debounce(
  (
    update: Pick<ContentSource, 'id'> & Partial<ContentSource>,
    dispatch: AppDispatch
  ) => {
    dispatch(flipflipApi.endpoints.updateContentSource.initiate(update))
  },
  250
)

const updateContentSource = (
  update: Pick<ContentSource, 'id'> & Partial<ContentSource>
) => {
  return (dispatch: AppDispatch) => {
    dispatch(updateLocalContentSource(update))
    updateRemoteContentSource(update, dispatch)
  }
}

export const setContentSourceDirOfSources = (id: number) => {
  return (dirOfSources: boolean) => {
    return updateContentSource({ id, dirOfSources })
  }
}

export const setContentSourceSubtitleFile = (id: number) => {
  return (subtitleFile: string) => {
    return updateContentSource({ id, subtitleFile })
  }
}

export const setContentSourceRedditFunc = (id: number) => {
  return (redditFunc: string) => {
    return updateContentSource({ id, redditFunc })
  }
}

export const setContentSourceRedditTime = (id: number) => {
  return (redditTime: string) => {
    return updateContentSource({ id, redditTime })
  }
}

export const setContentSourceIncludeReplies = (id: number) => {
  return (includeReplies: boolean) => {
    return updateContentSource({ id, includeReplies })
  }
}

export const setContentSourceIncludeRetweets = (id: number) => {
  return (includeRetweets: boolean) => {
    return updateContentSource({ id, includeRetweets })
  }
}

export const setContentSourceWeight = (id: number) => {
  return (weight: number) => {
    return updateContentSource({ id, weight })
  }
}

const updateLocalScene = (update: Pick<Scene, 'id'> & Partial<Scene>) => {
  return flipflipApi.util.updateQueryData('getScene', update.id, (draft) => {
    Object.assign(draft, update)
  })
}

const updateRemoteScene = debounce(
  (update: Pick<Scene, 'id'> & Partial<Scene>, dispatch: AppDispatch) => {
    dispatch(flipflipApi.endpoints.updateScene.initiate(update))
  },
  250
)

const updateScene = (update: Pick<Scene, 'id'> & Partial<Scene>) => {
  return (dispatch: AppDispatch) => {
    dispatch(updateLocalScene(update))
    updateRemoteScene(update, dispatch)
  }
}

export const setSceneGeneratorMax = (id: number) => {
  return (generatorMax: number) => {
    return updateScene({ id, generatorMax })
  }
}

export const setSceneTextEnabled = (id: number) => {
  return (textEnabled: boolean) => {
    return updateScene({ id, textEnabled })
  }
}

export const setSceneAudioEnabled = (id: number) => {
  return (audioEnabled: boolean) => {
    return updateScene({ id, audioEnabled })
  }
}

export const setSceneBackForth = (id: number) => {
  return (backForth: boolean) => {
    return updateScene({ id, backForth })
  }
}

export const setSceneBackForthBPMMulti = (id: number) => {
  return (backForthBPMMulti: number) => {
    return updateScene({ id, backForthBPMMulti })
  }
}

export const setSceneBackForthDuration = (id: number) => {
  return (backForthConstant: number) => {
    return updateScene({ id, backForthConstant })
  }
}

export const setSceneBackForthDurationMax = (id: number) => {
  return (backForthMax: number) => {
    return updateScene({ id, backForthMax })
  }
}

export const setSceneBackForthDurationMin = (id: number) => {
  return (backForthMin: number) => {
    return updateScene({ id, backForthMin })
  }
}

export const setSceneBackForthSinRate = (id: number) => {
  return (backForthSinRate: number) => {
    return updateScene({ id, backForthSinRate })
  }
}

export const setSceneBackForthTF = (id: number) => {
  return (backForthTF: string) => {
    return updateScene({ id, backForthTF })
  }
}

export const setSceneBackgroundBlur = (id: number) => {
  return (backgroundBlur: number) => {
    return updateScene({ id, backgroundBlur })
  }
}

export const setSceneBackgroundColor = (id: number) => {
  return (backgroundColor: string) => {
    return updateScene({ id, backgroundColor })
  }
}

export const setSceneBackgroundColorSet = (id: number) => {
  return (backgroundColorSet: string[]) => {
    return updateScene({ id, backgroundColorSet })
  }
}

export const setSceneBackgroundType = (id: number) => {
  return (backgroundType: string) => {
    return updateScene({ id, backgroundType })
  }
}

export const setSceneContinueVideo = (id: number) => {
  return (continueVideo: boolean) => {
    return updateScene({ id, continueVideo })
  }
}

export const setSceneCrossFade = (id: number) => {
  return (crossFade: boolean) => {
    return updateScene({ id, crossFade })
  }
}

export const setSceneCrossFadeAudio = (id: number) => {
  return (crossFadeAudio: boolean) => {
    return updateScene({ id, crossFadeAudio })
  }
}

export const setSceneFadeAmp = (id: number) => {
  return (fadeAmp: number) => {
    return updateScene({ id, fadeAmp })
  }
}

export const setSceneFadeBPMMulti = (id: number) => {
  return (fadeBPMMulti: number) => {
    return updateScene({ id, fadeBPMMulti })
  }
}

export const setSceneFadeDuration = (id: number) => {
  return (fadeDuration: number) => {
    return updateScene({ id, fadeDuration })
  }
}

export const setSceneFadeDurationMax = (id: number) => {
  return (fadeDurationMax: number) => {
    return updateScene({ id, fadeDurationMax })
  }
}

export const setSceneFadeDurationMin = (id: number) => {
  return (fadeDurationMin: number) => {
    return updateScene({ id, fadeDurationMin })
  }
}

export const setSceneFadeEase = (id: number) => {
  return (fadeEase: string) => {
    return updateScene({ id, fadeEase })
  }
}

export const setSceneFadeExp = (id: number) => {
  return (fadeExp: number) => {
    return updateScene({ id, fadeExp })
  }
}

export const setSceneFadeInOut = (id: number) => {
  return (fadeInOut: boolean) => {
    return updateScene({ id, fadeInOut })
  }
}

export const setSceneFadeIOBPMMulti = (id: number) => {
  return (fadeIOBPMMulti: number) => {
    return updateScene({ id, fadeIOBPMMulti })
  }
}

export const setSceneFadeIODuration = (id: number) => {
  return (fadeIODuration: number) => {
    return updateScene({ id, fadeIODuration })
  }
}

export const setSceneFadeIODurationMax = (id: number) => {
  return (fadeIODurationMax: number) => {
    return updateScene({ id, fadeIODurationMax })
  }
}

export const setSceneFadeIODurationMin = (id: number) => {
  return (fadeIODurationMin: number) => {
    return updateScene({ id, fadeIODurationMin })
  }
}

export const setSceneFadeIOEndAmp = (id: number) => {
  return (fadeIOEndAmp: number) => {
    return updateScene({ id, fadeIOEndAmp })
  }
}

export const setSceneFadeIOEndEase = (id: number) => {
  return (fadeIOEndEase: string) => {
    return updateScene({ id, fadeIOEndEase })
  }
}

export const setSceneFadeIOEndExp = (id: number) => {
  return (fadeIOEndExp: number) => {
    return updateScene({ id, fadeIOEndExp })
  }
}

export const setSceneFadeIOEndOv = (id: number) => {
  return (fadeIOEndOv: number) => {
    return updateScene({ id, fadeIOEndOv })
  }
}

export const setSceneFadeIOEndPer = (id: number) => {
  return (fadeIOEndPer: number) => {
    return updateScene({ id, fadeIOEndPer })
  }
}

export const setSceneFadeIOSinRate = (id: number) => {
  return (fadeIOSinRate: number) => {
    return updateScene({ id, fadeIOSinRate })
  }
}

export const setSceneFadeIOStartAmp = (id: number) => {
  return (fadeIOStartAmp: number) => {
    return updateScene({ id, fadeIOStartAmp })
  }
}

export const setSceneFadeIOStartEase = (id: number) => {
  return (fadeIOStartEase: string) => {
    return updateScene({ id, fadeIOStartEase })
  }
}

export const setSceneFadeIOStartExp = (id: number) => {
  return (fadeIOStartExp: number) => {
    return updateScene({ id, fadeIOStartExp })
  }
}

export const setSceneFadeIOStartOv = (id: number) => {
  return (fadeIOStartOv: number) => {
    return updateScene({ id, fadeIOStartOv })
  }
}

export const setSceneFadeIOStartPer = (id: number) => {
  return (fadeIOStartPer: number) => {
    return updateScene({ id, fadeIOStartPer })
  }
}

export const setSceneFadeIOTF = (id: number) => {
  return (fadeIOTF: string) => {
    return updateScene({ id, fadeIOTF })
  }
}

export const setSceneFadeOv = (id: number) => {
  return (fadeOv: number) => {
    return updateScene({ id, fadeOv })
  }
}

export const setSceneFadePer = (id: number) => {
  return (fadePer: number) => {
    return updateScene({ id, fadePer })
  }
}

export const setSceneFadeSinRate = (id: number) => {
  return (fadeSinRate: number) => {
    return updateScene({ id, fadeSinRate })
  }
}

export const setSceneFadeTF = (id: number) => {
  return (fadeTF: string) => {
    return updateScene({ id, fadeTF })
  }
}

export const setSceneForceAll = (id: number) => {
  return (forceAll: boolean) => {
    return updateScene({ id, forceAll })
  }
}

export const setSceneForceAllSource = (id: number) => {
  return (forceAllSource: boolean) => {
    return updateScene({ id, forceAllSource })
  }
}

export const setSceneFullSource = (id: number) => {
  return (fullSource: boolean) => {
    return updateScene({ id, fullSource })
  }
}

export const setSceneGifOption = (id: number) => {
  return (gifOption: string) => {
    return updateScene({ id, gifOption })
  }
}

export const setSceneGifTimingConstant = (id: number) => {
  return (gifTimingConstant: number) => {
    return updateScene({ id, gifTimingConstant })
  }
}

export const setSceneGifTimingMax = (id: number) => {
  return (gifTimingMax: number) => {
    return updateScene({ id, gifTimingMax })
  }
}

export const setSceneGifTimingMin = (id: number) => {
  return (gifTimingMin: number) => {
    return updateScene({ id, gifTimingMin })
  }
}

export const setSceneHorizTransLevel = (id: number) => {
  return (horizTransLevel: number) => {
    return updateScene({ id, horizTransLevel })
  }
}

export const setSceneHorizTransLevelMax = (id: number) => {
  return (horizTransLevelMax: number) => {
    return updateScene({ id, horizTransLevelMax })
  }
}

export const setSceneHorizTransLevelMin = (id: number) => {
  return (horizTransLevelMin: number) => {
    return updateScene({ id, horizTransLevelMin })
  }
}

export const setSceneHorizTransRandom = (id: number) => {
  return (horizTransRandom: boolean) => {
    return updateScene({ id, horizTransRandom })
  }
}

export const setSceneHorizTransType = (id: number) => {
  return (horizTransType: string) => {
    return updateScene({ id, horizTransType })
  }
}

export const setSceneImageOrientation = (id: number) => {
  return (imageOrientation: string) => {
    return updateScene({ id, imageOrientation })
  }
}

export const setSceneImageType = (id: number) => {
  return (imageType: string) => {
    return updateScene({ id, imageType })
  }
}

export const setSceneImageTypeFilter = (id: number) => {
  return (imageTypeFilter: string) => {
    return updateScene({ id, imageTypeFilter })
  }
}

export const setSceneOrderFunction = (id: number) => {
  return (orderFunction: string) => {
    return updateScene({ id, orderFunction })
  }
}

export const setScenePanBPMMulti = (id: number) => {
  return (panBPMMulti: number) => {
    return updateScene({ id, panBPMMulti })
  }
}

export const setScenePanDuration = (id: number) => {
  return (panDuration: number) => {
    return updateScene({ id, panDuration })
  }
}

export const setScenePanDurationMax = (id: number) => {
  return (panDurationMax: number) => {
    return updateScene({ id, panDurationMax })
  }
}

export const setScenePanDurationMin = (id: number) => {
  return (panDurationMin: number) => {
    return updateScene({ id, panDurationMin })
  }
}

export const setScenePanEndAmp = (id: number) => {
  return (panEndAmp: number) => {
    return updateScene({ id, panEndAmp })
  }
}

export const setScenePanEndEase = (id: number) => {
  return (panEndEase: string) => {
    return updateScene({ id, panEndEase })
  }
}

export const setScenePanEndExp = (id: number) => {
  return (panEndExp: number) => {
    return updateScene({ id, panEndExp })
  }
}

export const setScenePanEndOv = (id: number) => {
  return (panEndOv: number) => {
    return updateScene({ id, panEndOv })
  }
}

export const setScenePanEndPer = (id: number) => {
  return (panEndPer: number) => {
    return updateScene({ id, panEndPer })
  }
}

export const setScenePanHorizTransImg = (id: number) => {
  return (panHorizTransImg: boolean) => {
    return updateScene({ id, panHorizTransImg })
  }
}

export const setScenePanHorizTransLevel = (id: number) => {
  return (panHorizTransLevel: number) => {
    return updateScene({ id, panHorizTransLevel })
  }
}

export const setScenePanHorizTransLevelMax = (id: number) => {
  return (panHorizTransLevelMax: number) => {
    return updateScene({ id, panHorizTransLevelMax })
  }
}

export const setScenePanHorizTransLevelMin = (id: number) => {
  return (panHorizTransLevelMin: number) => {
    return updateScene({ id, panHorizTransLevelMin })
  }
}

export const setScenePanHorizTransRandom = (id: number) => {
  return (panHorizTransRandom: boolean) => {
    return updateScene({ id, panHorizTransRandom })
  }
}

export const setScenePanHorizTransType = (id: number) => {
  return (panHorizTransType: string) => {
    return updateScene({ id, panHorizTransType })
  }
}

export const setScenePanning = (id: number) => {
  return (panning: boolean) => {
    return updateScene({ id, panning })
  }
}

export const setScenePanSinRate = (id: number) => {
  return (panSinRate: number) => {
    return updateScene({ id, panSinRate })
  }
}

export const setScenePanStartAmp = (id: number) => {
  return (panStartAmp: number) => {
    return updateScene({ id, panStartAmp })
  }
}

export const setScenePanStartEase = (id: number) => {
  return (panStartEase: string) => {
    return updateScene({ id, panStartEase })
  }
}

export const setScenePanStartExp = (id: number) => {
  return (panStartExp: number) => {
    return updateScene({ id, panStartExp })
  }
}

export const setScenePanStartOv = (id: number) => {
  return (panStartOv: number) => {
    return updateScene({ id, panStartOv })
  }
}

export const setScenePanStartPer = (id: number) => {
  return (panStartPer: number) => {
    return updateScene({ id, panStartPer })
  }
}

export const setScenePanTF = (id: number) => {
  return (panTF: string) => {
    return updateScene({ id, panTF })
  }
}

export const setScenePanVertTransImg = (id: number) => {
  return (panVertTransImg: boolean) => {
    return updateScene({ id, panVertTransImg })
  }
}

export const setScenePanVertTransLevel = (id: number) => {
  return (panVertTransLevel: number) => {
    return updateScene({ id, panVertTransLevel })
  }
}

export const setScenePanVertTransLevelMax = (id: number) => {
  return (panVertTransLevelMax: number) => {
    return updateScene({ id, panVertTransLevelMax })
  }
}

export const setScenePanVertTransLevelMin = (id: number) => {
  return (panVertTransLevelMin: number) => {
    return updateScene({ id, panVertTransLevelMin })
  }
}

export const setScenePanVertTransRandom = (id: number) => {
  return (panVertTransRandom: boolean) => {
    return updateScene({ id, panVertTransRandom })
  }
}

export const setScenePanVertTransType = (id: number) => {
  return (panVertTransType: string) => {
    return updateScene({ id, panVertTransType })
  }
}

export const setScenePlayVideoClips = (id: number) => {
  return (playVideoClips: boolean) => {
    return updateScene({ id, playVideoClips })
  }
}

export const setSceneRandomVideoStart = (id: number) => {
  return (randomVideoStart: boolean) => {
    return updateScene({ id, randomVideoStart })
  }
}

export const setSceneRegenerate = (id: number) => {
  return (regenerate: boolean) => {
    return updateScene({ id, regenerate })
  }
}

export const setSceneSkipVideoEnd = (id: number) => {
  return (skipVideoEnd: number) => {
    return updateScene({ id, skipVideoEnd })
  }
}

export const setSceneSkipVideoStart = (id: number) => {
  return (skipVideoStart: number) => {
    return updateScene({ id, skipVideoStart })
  }
}

export const setSceneSlide = (id: number) => {
  return (slide: boolean) => {
    return updateScene({ id, slide })
  }
}

export const setSceneSlideAmp = (id: number) => {
  return (slideAmp: number) => {
    return updateScene({ id, slideAmp })
  }
}

export const setSceneSlideBPMMulti = (id: number) => {
  return (slideBPMMulti: number) => {
    return updateScene({ id, slideBPMMulti })
  }
}

export const setSceneSlideDistance = (id: number) => {
  return (slideDistance: number) => {
    return updateScene({ id, slideDistance })
  }
}

export const setSceneSlideDuration = (id: number) => {
  return (slideDuration: number) => {
    return updateScene({ id, slideDuration })
  }
}

export const setSceneSlideDurationMax = (id: number) => {
  return (slideDurationMax: number) => {
    return updateScene({ id, slideDurationMax })
  }
}

export const setSceneSlideDurationMin = (id: number) => {
  return (slideDurationMin: number) => {
    return updateScene({ id, slideDurationMin })
  }
}

export const setSceneSlideEase = (id: number) => {
  return (slideEase: string) => {
    return updateScene({ id, slideEase })
  }
}

export const setSceneSlideExp = (id: number) => {
  return (slideExp: number) => {
    return updateScene({ id, slideExp })
  }
}

export const setSceneSlideOv = (id: number) => {
  return (slideOv: number) => {
    return updateScene({ id, slideOv })
  }
}

export const setSceneSlidePer = (id: number) => {
  return (slidePer: number) => {
    return updateScene({ id, slidePer })
  }
}

export const setSceneSlideSinRate = (id: number) => {
  return (slideSinRate: number) => {
    return updateScene({ id, slideSinRate })
  }
}

export const setSceneSlideTF = (id: number) => {
  return (slideTF: string) => {
    return updateScene({ id, slideTF })
  }
}

export const setSceneSlideType = (id: number) => {
  return (slideType: string) => {
    return updateScene({ id, slideType })
  }
}

export const setSceneSourceOrderFunction = (id: number) => {
  return (sourceOrderFunction: string) => {
    return updateScene({ id, sourceOrderFunction })
  }
}

export const setSceneStrobe = (id: number) => {
  return (strobe: boolean) => {
    return updateScene({ id, strobe })
  }
}

export const setSceneStrobeAmp = (id: number) => {
  return (strobeAmp: number) => {
    return updateScene({ id, strobeAmp })
  }
}

export const setSceneStrobeBPMMulti = (id: number) => {
  return (strobeBPMMulti: number) => {
    return updateScene({ id, strobeBPMMulti })
  }
}

export const setSceneStrobeColor = (id: number) => {
  return (strobeColor: string) => {
    return updateScene({ id, strobeColor })
  }
}

export const setSceneStrobeColorSet = (id: number) => {
  return (strobeColorSet: string[]) => {
    return updateScene({ id, strobeColorSet })
  }
}

export const setSceneStrobeColorType = (id: number) => {
  return (strobeColorType: string) => {
    return updateScene({ id, strobeColorType })
  }
}

export const setSceneStrobeDelayBPMMulti = (id: number) => {
  return (strobeDelayBPMMulti: number) => {
    return updateScene({ id, strobeDelayBPMMulti })
  }
}

export const setSceneStrobeDelayDuration = (id: number) => {
  return (strobeDelay: number) => {
    return updateScene({ id, strobeDelay })
  }
}

export const setSceneStrobeDelayDurationMax = (id: number) => {
  return (strobeDelayMax: number) => {
    return updateScene({ id, strobeDelayMax })
  }
}

export const setSceneStrobeDelayDurationMin = (id: number) => {
  return (strobeDelayMin: number) => {
    return updateScene({ id, strobeDelayMin })
  }
}

export const setSceneStrobeDelaySinRate = (id: number) => {
  return (strobeDelaySinRate: number) => {
    return updateScene({ id, strobeDelaySinRate })
  }
}

export const setSceneStrobeDelayTF = (id: number) => {
  return (strobeDelayTF: string) => {
    return updateScene({ id, strobeDelayTF })
  }
}

export const setSceneStrobeDuration = (id: number) => {
  return (strobeTime: number) => {
    return updateScene({ id, strobeTime })
  }
}

export const setSceneStrobeDurationMax = (id: number) => {
  return (strobeTimeMax: number) => {
    return updateScene({ id, strobeTimeMax })
  }
}

export const setSceneStrobeDurationMin = (id: number) => {
  return (strobeTimeMin: number) => {
    return updateScene({ id, strobeTimeMin })
  }
}

export const setSceneStrobeEase = (id: number) => {
  return (strobeEase: string) => {
    return updateScene({ id, strobeEase })
  }
}

export const setSceneStrobeExp = (id: number) => {
  return (strobeExp: number) => {
    return updateScene({ id, strobeExp })
  }
}

export const setSceneStrobeLayer = (id: number) => {
  return (strobeLayer: string) => {
    return updateScene({ id, strobeLayer })
  }
}

export const setSceneStrobeOpacity = (id: number) => {
  return (strobeOpacity: number) => {
    return updateScene({ id, strobeOpacity })
  }
}

export const setSceneStrobeOv = (id: number) => {
  return (strobeOv: number) => {
    return updateScene({ id, strobeOv })
  }
}

export const setSceneStrobePer = (id: number) => {
  return (strobePer: number) => {
    return updateScene({ id, strobePer })
  }
}

export const setSceneStrobePulse = (id: number) => {
  return (strobePulse: boolean) => {
    return updateScene({ id, strobePulse })
  }
}

export const setSceneStrobeSinRate = (id: number) => {
  return (strobeSinRate: number) => {
    return updateScene({ id, strobeSinRate })
  }
}

export const setSceneStrobeTF = (id: number) => {
  return (strobeTF: string) => {
    return updateScene({ id, strobeTF })
  }
}

export const setSceneTimingBPMMulti = (id: number) => {
  return (timingBPMMulti: number) => {
    return updateScene({ id, timingBPMMulti })
  }
}

export const setSceneTimingDuration = (id: number) => {
  return (timingConstant: number) => {
    return updateScene({ id, timingConstant })
  }
}

export const setSceneTimingDurationMax = (id: number) => {
  return (timingMax: number) => {
    return updateScene({ id, timingMax })
  }
}

export const setSceneTimingDurationMin = (id: number) => {
  return (timingMin: number) => {
    return updateScene({ id, timingMin })
  }
}

export const setSceneTimingSinRate = (id: number) => {
  return (timingSinRate: number) => {
    return updateScene({ id, timingSinRate })
  }
}

export const setSceneTimingTF = (id: number) => {
  return (timingFunction: string) => {
    return updateScene({ id, timingFunction })
  }
}

export const setSceneTransAmp = (id: number) => {
  return (transAmp: number) => {
    return updateScene({ id, transAmp })
  }
}

export const setSceneTransEase = (id: number) => {
  return (transEase: string) => {
    return updateScene({ id, transEase })
  }
}

export const setSceneTransExp = (id: number) => {
  return (transExp: number) => {
    return updateScene({ id, transExp })
  }
}

export const setSceneTransOv = (id: number) => {
  return (transOv: number) => {
    return updateScene({ id, transOv })
  }
}

export const setSceneTransPer = (id: number) => {
  return (transPer: number) => {
    return updateScene({ id, transPer })
  }
}

export const setSceneVertTransLevel = (id: number) => {
  return (vertTransLevel: number) => {
    return updateScene({ id, vertTransLevel })
  }
}

export const setSceneVertTransLevelMax = (id: number) => {
  return (vertTransLevelMax: number) => {
    return updateScene({ id, vertTransLevelMax })
  }
}

export const setSceneVertTransLevelMin = (id: number) => {
  return (vertTransLevelMin: number) => {
    return updateScene({ id, vertTransLevelMin })
  }
}

export const setSceneVertTransRandom = (id: number) => {
  return (vertTransRandom: boolean) => {
    return updateScene({ id, vertTransRandom })
  }
}

export const setSceneVertTransType = (id: number) => {
  return (vertTransType: string) => {
    return updateScene({ id, vertTransType })
  }
}

export const setSceneVideoOption = (id: number) => {
  return (videoOption: string) => {
    return updateScene({ id, videoOption })
  }
}

export const setSceneVideoOrientation = (id: number) => {
  return (videoOrientation: string) => {
    return updateScene({ id, videoOrientation })
  }
}

export const setSceneVideoRandomSpeed = (id: number) => {
  return (videoRandomSpeed: boolean) => {
    return updateScene({ id, videoRandomSpeed })
  }
}

export const setSceneVideoSkip = (id: number) => {
  return (videoSkip: number) => {
    return updateScene({ id, videoSkip })
  }
}

export const setSceneVideoSpeed = (id: number) => {
  return (videoSpeed: number) => {
    return updateScene({ id, videoSpeed })
  }
}

export const setSceneVideoSpeedMax = (id: number) => {
  return (videoSpeedMax: number) => {
    return updateScene({ id, videoSpeedMax })
  }
}

export const setSceneVideoSpeedMin = (id: number) => {
  return (videoSpeedMin: number) => {
    return updateScene({ id, videoSpeedMin })
  }
}

export const setSceneVideoTimingConstant = (id: number) => {
  return (videoTimingConstant: number) => {
    return updateScene({ id, videoTimingConstant })
  }
}

export const setSceneVideoTimingMax = (id: number) => {
  return (videoTimingMax: number) => {
    return updateScene({ id, videoTimingMax })
  }
}

export const setSceneVideoTimingMin = (id: number) => {
  return (videoTimingMin: number) => {
    return updateScene({ id, videoTimingMin })
  }
}

export const setSceneVideoVolume = (id: number) => {
  return (videoVolume: number) => {
    return updateScene({ id, videoVolume })
  }
}

export const setSceneWeightFunction = (id: number) => {
  return (weightFunction: string) => {
    return updateScene({ id, weightFunction })
  }
}

export const setSceneZoom = (id: number) => {
  return (zoom: boolean) => {
    return updateScene({ id, zoom })
  }
}

export const setSceneZoomBPMMulti = (id: number) => {
  return (transBPMMulti: number) => {
    return updateScene({ id, transBPMMulti })
  }
}

export const setSceneZoomDuration = (id: number) => {
  return (transDuration: number) => {
    return updateScene({ id, transDuration })
  }
}

export const setSceneZoomDurationMax = (id: number) => {
  return (transDurationMax: number) => {
    return updateScene({ id, transDurationMax })
  }
}

export const setSceneZoomDurationMin = (id: number) => {
  return (transDurationMin: number) => {
    return updateScene({ id, transDurationMin })
  }
}

export const setSceneZoomEnd = (id: number) => {
  return (zoomEnd: number) => {
    return updateScene({ id, zoomEnd })
  }
}

export const setSceneZoomEndMax = (id: number) => {
  return (zoomEndMax: number) => {
    return updateScene({ id, zoomEndMax })
  }
}

export const setSceneZoomEndMin = (id: number) => {
  return (zoomEndMin: number) => {
    return updateScene({ id, zoomEndMin })
  }
}

export const setSceneZoomRandom = (id: number) => {
  return (zoomRandom: boolean) => {
    return updateScene({ id, zoomRandom })
  }
}

export const setSceneZoomSinRate = (id: number) => {
  return (transSinRate: number) => {
    return updateScene({ id, transSinRate })
  }
}

export const setSceneZoomStart = (id: number) => {
  return (zoomStart: number) => {
    return updateScene({ id, zoomStart })
  }
}

export const setSceneZoomStartMax = (id: number) => {
  return (zoomStartMax: number) => {
    return updateScene({ id, zoomStartMax })
  }
}

export const setSceneZoomStartMin = (id: number) => {
  return (zoomStartMin: number) => {
    return updateScene({ id, zoomStartMin })
  }
}

export const setSceneZoomTF = (id: number) => {
  return (transTF: string) => {
    return updateScene({ id, transTF })
  }
}

const updateLocalTheme = (update: Partial<ThemeSettings>) => {
  return flipflipApi.util.updateQueryData('getTheme', undefined, (draft) => {
    Object.assign(draft, update)
  })
}

const updateRemoteTheme = debounce(
  (update: Partial<ThemeSettings>, dispatch: AppDispatch) => {
    dispatch(flipflipApi.endpoints.updateTheme.initiate(update))
  },
  250
)

const updateTheme = (update: Partial<ThemeSettings>) => {
  return (dispatch: AppDispatch) => {
    dispatch(updateLocalTheme(update))
    updateRemoteTheme(update, dispatch)
  }
}

export const setThemeMode = () => {
  return (dark: boolean) => {
    return updateTheme({ mode: dark ? 'dark' : 'light' })
  }
}

export const setThemePrimaryColor = () => {
  return (primaryColor: string) => {
    return updateTheme({ primaryColor })
  }
}

export const setThemeSecondaryColor = () => {
  return (secondaryColor: string) => {
    return updateTheme({ secondaryColor })
  }
}

const updateLocalCacheSettings = (update: Partial<CacheSettings>) => {
  return flipflipApi.util.updateQueryData(
    'getCacheSettings',
    undefined,
    (draft) => {
      Object.assign(draft, update)
    }
  )
}

const updateRemoteCacheSettings = debounce(
  (update: Partial<CacheSettings>, dispatch: AppDispatch) => {
    dispatch(flipflipApi.endpoints.updateCacheSettings.initiate(update))
  },
  250
)

const updateCacheSettings = (update: Partial<CacheSettings>) => {
  return (dispatch: AppDispatch) => {
    dispatch(updateLocalCacheSettings(update))
    updateRemoteCacheSettings(update, dispatch)
  }
}

export const setConfigCachingEnabled = (enabled: boolean) => {
  return updateCacheSettings({ enabled })
}

export const setConfigCachingDirectory = (directory: string) => {
  return updateCacheSettings({ directory })
}

export const setConfigCachingMaxSize = (maxSize: string) => {
  return updateCacheSettings({ maxSize: Number(maxSize) })
}

const updateLocalGeneralSettings = (update: Partial<GeneralSettings>) => {
  return flipflipApi.util.updateQueryData(
    'getGeneralSettings',
    undefined,
    (draft) => {
      Object.assign(draft, update)
    }
  )
}

const updateRemoteGeneralSettings = debounce(
  (update: Partial<GeneralSettings>, dispatch: AppDispatch) => {
    dispatch(flipflipApi.endpoints.updateGeneralSettings.initiate(update))
  },
  250
)

const updateGeneralSettings = (update: Partial<GeneralSettings>) => {
  return (dispatch: AppDispatch) => {
    dispatch(updateLocalGeneralSettings(update))
    updateRemoteGeneralSettings(update, dispatch)
  }
}

export const setConfigGeneralSettingsCleanRetain = (cleanRetain: number) => {
  return updateGeneralSettings({ cleanRetain })
}

export const setConfigGeneralSettingsAutoCleanBackupMonths = (
  autoCleanBackupMonths: number
) => {
  return updateGeneralSettings({ autoCleanBackupMonths })
}

export const setConfigGeneralSettingsAutoCleanBackupWeeks = (
  autoCleanBackupWeeks: number
) => {
  return updateGeneralSettings({ autoCleanBackupWeeks })
}

export const setConfigGeneralSettingsAutoCleanBackupDays = (
  autoCleanBackupDays: number
) => {
  return updateGeneralSettings({ autoCleanBackupDays })
}

export const setConfigGeneralSettingsAutoCleanBackup = (
  autoCleanBackup: boolean
) => {
  return updateGeneralSettings({ autoCleanBackup })
}

export const setConfigGeneralSettingsAutoBackupDays = (
  autoBackupDays: number
) => {
  return updateGeneralSettings({ autoBackupDays })
}

export const setConfigGeneralSettingsAutoBackup = (autoBackup: boolean) => {
  return updateGeneralSettings({ autoBackup })
}

export const setConfigGeneralSettingsWatermark = (watermark: boolean) => {
  return updateGeneralSettings({ watermark })
}

export const setConfigGeneralSettingsWatermarkDisplay = (
  watermarkDisplay: boolean
) => {
  return updateGeneralSettings({ watermarkDisplay })
}

export const setConfigGeneralSettingsWatermarkCorner = (
  watermarkCorner: string
) => {
  return updateGeneralSettings({ watermarkCorner })
}

export const setConfigGeneralSettingsWatermarkFontFamily = (
  watermarkFontFamily: string
) => {
  return updateGeneralSettings({ watermarkFontFamily })
}

export const setConfigGeneralSettingsWatermarkColor = (
  watermarkColor: string
) => {
  return updateGeneralSettings({ watermarkColor })
}

export const setConfigGeneralSettingsWatermarkText = (
  watermarkText: string
) => {
  return updateGeneralSettings({ watermarkText })
}

export const setConfigGeneralSettingsWatermarkFontSize = (
  watermarkFontSize: number
) => {
  return updateGeneralSettings({ watermarkFontSize })
}

export const setConfigGeneralSettingsPrioritizePerformance = (
  prioritizePerformance: boolean
) => {
  return updateGeneralSettings({ prioritizePerformance })
}

export const setConfigGeneralSettingsConfirmSceneDeletion = (
  confirmSceneDeletion: boolean
) => {
  return updateGeneralSettings({ confirmSceneDeletion })
}

export const setConfigGeneralSettingsConfirmBlacklist = (
  confirmBlacklist: boolean
) => {
  return updateGeneralSettings({ confirmBlacklist })
}

export const setConfigGeneralSettingsConfirmFileDeletion = (
  confirmFileDeletion: boolean
) => {
  return updateGeneralSettings({ confirmFileDeletion })
}

const updateLocalRemoteSettings = (update: Partial<RemoteSettings>) => {
  return flipflipApi.util.updateQueryData(
    'getRemoteSettings',
    undefined,
    (draft) => {
      Object.assign(draft, update)
    }
  )
}

const updateRemoteRemoteSettings = debounce(
  (update: Partial<RemoteSettings>, dispatch: AppDispatch) => {
    dispatch(flipflipApi.endpoints.updateRemoteSettings.initiate(update))
  },
  250
)

const updateRemoteSettings = (update: Partial<RemoteSettings>) => {
  return (dispatch: AppDispatch) => {
    dispatch(updateLocalRemoteSettings(update))
    updateRemoteRemoteSettings(update, dispatch)
  }
}

export const setConfigRemoteSettingsSilenceTumblrAlert = (
  silenceTumblrAlert: boolean
) => {
  return updateRemoteSettings({ silenceTumblrAlert })
}

export const setConfigRemoteSettingsTumblrKey = (tumblrKey: string) => {
  return updateRemoteSettings({ tumblrKey })
}

export const setConfigRemoteSettingsTumblrSecret = (tumblrSecret: string) => {
  return updateRemoteSettings({ tumblrSecret })
}

export const setConfigRemoteSettingsTumblrOAuthToken = (
  tumblrOAuthToken: string
) => {
  return updateRemoteSettings({ tumblrOAuthToken })
}

export const setConfigRemoteSettingsTumblrOAuthTokenSecret = (
  tumblrOAuthTokenSecret: string
) => {
  return updateRemoteSettings({ tumblrOAuthTokenSecret })
}

export const setConfigRemoteSettingsRedditDeviceID = (
  redditDeviceID: string
) => {
  return updateRemoteSettings({ redditDeviceID })
}

export const setConfigRemoteSettingsRedditRefreshToken = (
  redditRefreshToken: string
) => {
  return updateRemoteSettings({ redditRefreshToken })
}

export const setConfigRemoteSettingsTwitterAccessTokenKey = (
  twitterAccessTokenKey: string
) => {
  return updateRemoteSettings({ twitterAccessTokenKey })
}

export const setConfigRemoteSettingsTwitterAccessTokenSecret = (
  twitterAccessTokenSecret: string
) => {
  return updateRemoteSettings({ twitterAccessTokenSecret })
}

export const setConfigRemoteSettingsInstagramUsername = (
  instagramUsername: string
) => {
  return updateRemoteSettings({ instagramUsername })
}

export const setConfigRemoteSettingsInstagramPassword = (
  instagramPassword: string
) => {
  return updateRemoteSettings({ instagramPassword })
}

export const setConfigRemoteSettingsHydrusProtocol = (
  hydrusProtocol: string
) => {
  return updateRemoteSettings({ hydrusProtocol })
}

export const setConfigRemoteSettingsHydrusDomain = (hydrusDomain: string) => {
  return updateRemoteSettings({ hydrusDomain })
}

export const setConfigRemoteSettingsHydrusPort = (hydrusPort: string) => {
  return updateRemoteSettings({ hydrusPort })
}

export const setConfigRemoteSettingsHydrusAPIKey = (hydrusAPIKey: string) => {
  return updateRemoteSettings({ hydrusAPIKey })
}

export const setConfigRemoteSettingsPiwigoProtocol = (
  piwigoProtocol: string
) => {
  return updateRemoteSettings({ piwigoProtocol })
}

export const setConfigRemoteSettingsPiwigoHost = (piwigoHost: string) => {
  return updateRemoteSettings({ piwigoHost })
}

export const setConfigRemoteSettingsPiwigoUsername = (
  piwigoUsername: string
) => {
  return updateRemoteSettings({ piwigoUsername })
}

export const setConfigRemoteSettingsPiwigoPassword = (
  piwigoPassword: string
) => {
  return updateRemoteSettings({ piwigoPassword })
}

const updateLocalDisplaySettings = (update: Partial<DisplaySettings>) => {
  return flipflipApi.util.updateQueryData(
    'getDisplaySettings',
    undefined,
    (draft) => {
      Object.assign(draft, update)
    }
  )
}

const updateRemoteDisplaySettings = debounce(
  (update: Partial<DisplaySettings>, dispatch: AppDispatch) => {
    dispatch(flipflipApi.endpoints.updateDisplaySettings.initiate(update))
  },
  250
)

const updateDisplaySettings = (update: Partial<DisplaySettings>) => {
  return (dispatch: AppDispatch) => {
    dispatch(updateLocalDisplaySettings(update))
    updateRemoteDisplaySettings(update, dispatch)
  }
}

export const setConfigDisplaySettingsMaxLoadingAtOnce = (
  maxLoadingAtOnce: number
) => {
  return updateDisplaySettings({ maxLoadingAtOnce })
}

export const setConfigDisplaySettingsMaxInMemory = (maxInMemory: number) => {
  return updateDisplaySettings({ maxInMemory })
}

export const setConfigDisplaySettingsMaxInHistory = (maxInHistory: number) => {
  return updateDisplaySettings({ maxInHistory })
}

export const setConfigDisplaySettingsMinVideoSize = (minVideoSize: number) => {
  return updateDisplaySettings({ minVideoSize })
}

export const setConfigDisplaySettingsMinImageSize = (minImageSize: number) => {
  return updateDisplaySettings({ minImageSize })
}

export const setConfigDisplaySettingsFullScreen = (fullScreen: boolean) => {
  return updateDisplaySettings({ fullScreen })
}

export const setConfigDisplaySettingsStartImmediately = (
  startImmediately: boolean
) => {
  return updateDisplaySettings({ startImmediately })
}

export const setConfigDisplaySettingsClickToProgress = (
  clickToProgress: boolean
) => {
  return updateDisplaySettings({ clickToProgress })
}

export const setConfigDisplaySettingsClickToProgressWhilePlaying = (
  clickToProgressWhilePlaying: boolean
) => {
  return updateDisplaySettings({ clickToProgressWhilePlaying })
}

export const setConfigDisplaySettingsEasingControls = (
  easingControls: boolean
) => {
  return updateDisplaySettings({ easingControls })
}

export const setConfigDisplaySettingsAudioAlert = (audioAlert: boolean) => {
  return updateDisplaySettings({ audioAlert })
}
