import React, { useCallback, useEffect } from 'react'

import { Box, createTheme, CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import ErrorBoundary from './error/ErrorBoundary'
import ScenePicker from './ScenePicker'
import ConfigForm from './config/ConfigForm'
import Library from './library/Library'
import TagManager from './library/TagManager'
import VideoClipper from './config/VideoClipper'
import SceneDetail from './sceneDetail/SceneDetail'
import Tutorial from './Tutorial'
import AudioLibrary from './library/AudioLibrary'
import CaptionScriptor from './sceneDetail/CaptionScriptor'
import ScriptLibrary from './library/ScriptLibrary'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  selectAppLastRoute,
  selectAppTutorial,
  selectAppTheme
} from '../store/app/selectors'
import type Route from '../store/app/data/Route'
import { saveAppStorageInterval } from '../store/app/thunks'
import { startFromScene } from '../store/scene/thunks'
import SystemMessageDialog from './SystemMessageDialog'
import SystemSnack from './SystemSnack'
import flipflip from '../FlipFlipService'
import { CacheProvider, EmotionCache } from '@emotion/react'
import DisplaySetup from './config/DisplaySetup'
import PlaylistSetup from './config/PlaylistSetup'
import DisplayManager from './player/DisplayManager'

export interface MetaProps {
  cache: EmotionCache
}

// TODO Be able to change audio/script playlists during playback
//      Be able to modify source tags as popup during playback
//      Generate different sources even for same scenes
//      Add configurable privacy screen with shortcut and ability to set image
export default function Meta(props: MetaProps) {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectAppTheme())
  const tutorial = useAppSelector(selectAppTutorial())
  const route = useAppSelector(selectAppLastRoute())

  const startScene = useCallback(
    (sceneName: string) => {
      dispatch(startFromScene(sceneName))
    },
    [dispatch]
  )

  useEffect(() => {
    const abortController = new AbortController()
    flipflip().events.onStartScene(startScene, abortController)

    // Disable react-sound's verbose console output
    ;(window as any).soundManager.setup({ debugMode: false })
    flipflip()
      .api.getWindowId()
      .then((id) => {
        if (id === 1) {
          dispatch(saveAppStorageInterval())
        } else {
          document.title += '*'
        }
      })

    return () => {
      abortController.abort()
    }
  }, [dispatch, startScene])

  // Returns true if the last route matches the given kind
  const isRoute = (route: Route, kind: string): boolean => {
    return route.kind === kind
  }

  const renderRoute = (route?: Route) => {
    if (route == null) {
      return <ScenePicker />
    } else if (isRoute(route, 'scene')) {
      return <SceneDetail sceneID={route.value as number} />
    } else if (isRoute(route, 'library')) {
      return <Library />
    } else if (isRoute(route, 'audios')) {
      return <AudioLibrary />
    } else if (isRoute(route, 'scripts')) {
      return <ScriptLibrary />
    } else if (isRoute(route, 'tags')) {
      return <TagManager />
    } else if (isRoute(route, 'clip')) {
      return <VideoClipper />
    } else if (isRoute(route, 'display')) {
      return <DisplaySetup displayID={route.value as number} />
    } else if (isRoute(route, 'playlist')) {
      return <PlaylistSetup playlistID={route.value as number} />
    } else if (
      isRoute(route, 'play') ||
      isRoute(route, 'libraryplay') ||
      isRoute(route, 'playdisplay')
    ) {
      return <DisplayManager displayID={route.value as number} />
    } else if (isRoute(route, 'config')) {
      return <ConfigForm />
    } else if (isRoute(route, 'scriptor')) {
      return <CaptionScriptor />
    } else {
      return <ScenePicker />
    }
  }

  return (
    <CacheProvider value={props.cache}>
      <ThemeProvider theme={createTheme(theme)}>
        <ErrorBoundary>
          <Box className="Meta">
            <CssBaseline />
            {renderRoute(route)}
            <SystemMessageDialog />
            <SystemSnack />
            {tutorial && (
              <Tutorial
                sceneID={
                  route != null && isRoute(route, 'scene')
                    ? (route.value as number)
                    : undefined
                }
              />
            )}
          </Box>
        </ErrorBoundary>
      </ThemeProvider>
    </CacheProvider>
  )
}

;(Meta as any).displayName = 'Meta'
