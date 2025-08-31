import { Route, Routes } from 'react-router'
import { CssBaseline, IconButton } from '@mui/material'

import ErrorBoundary from './error/ErrorBoundary'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import store from '../store/store'
import { Provider } from 'react-redux'
import PrivateRoute from './common/PrivateRoute'
import SceneDetail from './sceneDetail/SceneDetail'
import ScenePicker from './scenePicker/ScenePicker'
import ConfigForm from './config/ConfigForm'
import DisplaySetup from './config/DisplaySetup'
import PlaylistSetup from './config/PlaylistSetup'
import Library from './library/Library'
import AudioLibrary from './library/AudioLibrary'
import ScriptLibrary from './library/ScriptLibrary'
import TagManager from './library/TagManager'
import CaptionScriptor from './sceneDetail/CaptionScriptor'
import AppThemeProvider from './AppThemeProvider'
import ScriptOptions from './library/ScriptOptions'
import AudioOptions from './library/AudioOptions'
import { SnackbarKey, SnackbarProvider, closeSnackbar } from 'notistack'
import CloseIcon from '@mui/icons-material/Close'
import { AUTO_HIDE_DURATION, MAX_SNACKS } from '../data/Snackbar'
import DisplayManager from './player/DisplayManager'

const CloseSnackBarAction = (key: SnackbarKey) => {
  return (
    <IconButton onClick={() => closeSnackbar(key)} size="small">
      <CloseIcon />
    </IconButton>
  )
}

const App = () => {
  return (
    <Provider store={store}>
      <CacheProvider value={createCache({ key: 'css' })}>
        <PrivateRoute>
          <AppThemeProvider>
            <ErrorBoundary>
              <SnackbarProvider
                maxSnack={MAX_SNACKS}
                autoHideDuration={AUTO_HIDE_DURATION}
                action={CloseSnackBarAction}
              >
                <CssBaseline />
                <AudioOptions />
                <Routes>
                  <Route path="/settings/*" element={<ConfigForm />} />
                  <Route path="/scenes/:id/*" element={<SceneDetail />} />
                  <Route path="/displays/:id/*" element={<DisplaySetup />} />
                  <Route path="/playlists/:id/*" element={<PlaylistSetup />} />
                  <Route path="/content-library" element={<Library />} />
                  <Route path="/audio-library/*" element={<AudioLibrary />} />
                  <Route path="/script-library" element={<ScriptLibrary />} />
                  <Route
                    path="/scripts/:id/options"
                    element={<ScriptOptions />}
                  />
                  <Route path="/tags" element={<TagManager />} />
                  <Route path="/scriptor/:id?" element={<CaptionScriptor />} />
                  <Route path="/player/:id" element={<DisplayManager />} />
                  <Route path="/*" element={<ScenePicker />} />
                </Routes>
              </SnackbarProvider>
            </ErrorBoundary>
          </AppThemeProvider>
        </PrivateRoute>
      </CacheProvider>
    </Provider>
  )
}
export default App
