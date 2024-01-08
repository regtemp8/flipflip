import React, { useEffect, useRef } from 'react'

import { Box, createTheme, CssBaseline } from '@mui/material'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'

import ErrorBoundary from './error/ErrorBoundary'
import ScenePicker from './ScenePicker'
import ConfigForm from './config/ConfigForm'
import Library from './library/Library'
import TagManager from './library/TagManager'
import GridSetup from './config/GridSetup'
import VideoClipper from './config/VideoClipper'
import Player from './player/Player'
import NewPlayer from './player/NewPlayer'
import SceneDetail from './sceneDetail/SceneDetail'
import Tutorial from './Tutorial'
import AudioLibrary from './library/AudioLibrary'
import CaptionScriptor from './sceneDetail/CaptionScriptor'
import ScriptLibrary from './library/ScriptLibrary'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  selectAppLastRoute,
  selectAppTutorial,
  selectAppTheme,
  selectAppIsInitialized
} from '../../store/app/selectors'
import type Route from '../../store/app/data/Route'
import { fetchAppStorage, saveAppStorageInterval } from '../../store/app/thunks'
import { fetchConstants } from '../../store/constants/thunks'
import { startFromScene } from '../../store/scene/thunks'
import SystemMessageDialog from './SystemMessageDialog'
import SystemSnack from './SystemSnack'
import { ThemeOptions } from '@mui/system'

// TODO Be able to change audio/script playlists during playback
//      Be able to right click on grid scenes as overlay
//      Be able to modify source tags as popup during playback
//      Generate different sources even for same scenes in grid
//      Add configurable privacy screen with shortcut and ability to set image
//      Add minimize shortcut key in same vain?
export default function Meta() {
  const dispatch = useAppDispatch()
  const initialized = useAppSelector(selectAppIsInitialized())
  const theme = useAppSelector(selectAppTheme())
  const tutorial = useAppSelector(selectAppTutorial())
  const route = useAppSelector(selectAppLastRoute())

  // START LOG COMPONENT CHANGES
  // const p_initialized = useRef<boolean>()
  // const p_theme = useRef<ThemeOptions>()
  // const p_tutorial = useRef<string>()
  // const p_route = useRef<Route>()

  // console.log('00------------------------00')
  // if(p_initialized.current !== initialized){
  //   console.log('INITIALIZED CHANGED')
  // }
  // if(p_theme.current !== theme){
  //   console.log('THEME CHANGED')
  // }
  // if(p_tutorial.current !== tutorial){
  //   console.log('TUTORIAL CHANGED')
  // }
  // if(p_route.current !== route){
  //   console.log('ROUTE CHANGED')
  // }

  // console.log('00------------------------00')
  // p_initialized.current = initialized
  // p_theme.current = theme
  // p_tutorial.current = tutorial
  // p_route.current = route
  // END LOG COMPONENT CHANGES

  useEffect(() => {
    dispatch(fetchAppStorage())
    dispatch(fetchConstants())
    window.flipflip.events.onStartScene(startScene.bind(this))

    // Disable react-sound's verbose console output
    ;(window as any).soundManager.setup({ debugMode: false })
    window.flipflip.api.getWindowId().then((id) => {
      if (id === 1) {
        dispatch(saveAppStorageInterval())
      }
    })

    return () => {
      window.flipflip.events.removeStartScene()
    }
  }, [])

  // Returns true if the last route matches the given kind
  const isRoute = (route: Route, kind: string): boolean => {
    return route && route.kind === kind
  }

  const startScene = (sceneName: string) => {
    dispatch(startFromScene(sceneName))
  }

  if (!initialized) {
    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={createTheme(theme)}>
          <ErrorBoundary>
            <Box className="Meta">
              <CssBaseline />
              <h1>LOADING...</h1>
            </Box>
          </ErrorBoundary>
        </ThemeProvider>
      </StyledEngineProvider>
    )
  }

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={createTheme(theme)}>
        <ErrorBoundary>
          <Box className="Meta">
            <CssBaseline />
            {!route && <ScenePicker />}
            {isRoute(route, 'scene') && <SceneDetail sceneID={route.value} />}
            {isRoute(route, 'library') && <Library />}
            {isRoute(route, 'audios') && <AudioLibrary />}
            {isRoute(route, 'scripts') && <ScriptLibrary />}
            {isRoute(route, 'tags') && <TagManager />}
            {isRoute(route, 'clip') && <VideoClipper />}
            {isRoute(route, 'grid') && <GridSetup gridID={route.value} />}
            {(isRoute(route, 'play') ||
              isRoute(route, 'libraryplay') ||
              isRoute(route, 'gridplay')) && (
              <Player uuid={route.value} preventSleep />
            )}
            {isRoute(route, 'config') && <ConfigForm />}
            {isRoute(route, 'scriptor') && <CaptionScriptor />}

            <SystemMessageDialog />
            <SystemSnack />
            {tutorial && <Tutorial 
              sceneID={isRoute(route, 'scene') ? route.value : undefined} 
              gridID={isRoute(route, 'grid') ? route.value : undefined} 
            />}
          </Box>
        </ErrorBoundary>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

;(Meta as any).displayName = 'Meta'
