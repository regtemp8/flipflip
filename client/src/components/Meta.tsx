import React, { useCallback, useEffect } from 'react'

import { Box, createTheme, CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import ErrorBoundary from './error/ErrorBoundary'
import ScenePicker from './ScenePicker'
import ConfigForm from './config/ConfigForm'
import Library from './library/Library'
import TagManager from './library/TagManager'
import GridSetup from './config/GridSetup'
import VideoClipper from './config/VideoClipper'
import Player from './player/Player'
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

export interface MetaProps {
  cache: EmotionCache
}

// TODO Be able to change audio/script playlists during playback
//      Be able to right click on grid scenes as overlay
//      Be able to modify source tags as popup during playback
//      Generate different sources even for same scenes in grid
//      Add configurable privacy screen with shortcut and ability to set image
//      Add minimize shortcut key in same vain?
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
    return route && route.kind === kind
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
    } else if (isRoute(route, 'grid')) {
      return <GridSetup gridID={route.value as number} />
    } else if (
      isRoute(route, 'play') ||
      isRoute(route, 'libraryplay') ||
      isRoute(route, 'gridplay')
    ) {
      return <Player uuid={route.value as string} preventSleep />
    } else if (isRoute(route, 'config')) {
      return <ConfigForm />
    } else if (isRoute(route, 'scriptor')) {
      return <CaptionScriptor />
    } else {
      return null // never reached
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
                gridID={
                  route != null && isRoute(route, 'grid')
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
