import { Route, Routes } from 'react-router-dom'
import { CssBaseline, IconButton } from '@mui/material'

import ErrorBoundary from './error/ErrorBoundary'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import store from '../store/store'
import { Provider } from 'react-redux'
import PrivateRoute from './common/PrivateRoute'
import Login from './login/Login'
import Account from './account/Account'
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
import {SnackbarKey, SnackbarProvider, closeSnackbar} from 'notistack'
import CloseIcon from '@mui/icons-material/Close'

const CloseSnackBarAction = (key: SnackbarKey) => {
  return(<IconButton onClick={() => closeSnackbar(key)} size="small">
    <CloseIcon />
  </IconButton>)
}

const App = () => {
  return (
    <Provider store={store}>
      <CacheProvider value={createCache({ key: 'css' })}>
        <AppThemeProvider>
          <ErrorBoundary>
            <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} autoHideDuration={3000} action={CloseSnackBarAction}>
              <CssBaseline />
              <AudioOptions/>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/account/*"
                  element={
                    <PrivateRoute>
                      <Account />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings/*"
                  element={
                    <PrivateRoute>
                      <ConfigForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/scenes/:id/*"
                  element={
                    <PrivateRoute>
                      <SceneDetail />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/displays/:id/*"
                  element={
                    <PrivateRoute>
                      <DisplaySetup />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/playlists/:id/*"
                  element={
                    <PrivateRoute>
                      <PlaylistSetup />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/content-library"
                  element={
                    <PrivateRoute>
                      <Library />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/audio-library/*"
                  element={
                    <PrivateRoute>
                      <AudioLibrary />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/script-library"
                  element={
                    <PrivateRoute>
                      <ScriptLibrary />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/scripts/:id/options"
                  element={
                    <PrivateRoute>
                      <ScriptOptions />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/tags"
                  element={
                    <PrivateRoute>
                      <TagManager />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/scriptor/:id?"
                  element={
                    <PrivateRoute>
                      <CaptionScriptor />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/*"
                  element={
                    <PrivateRoute>
                      <ScenePicker />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </SnackbarProvider>
          </ErrorBoundary>
        </AppThemeProvider>
      </CacheProvider>
    </Provider>
  )
}
export default App
