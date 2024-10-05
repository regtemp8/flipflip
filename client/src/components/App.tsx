import { Route, Routes } from 'react-router-dom'
import { createTheme, CssBaseline } from '@mui/material'
import { ThemeOptions, ThemeProvider } from '@mui/material/styles'

import ErrorBoundary from './error/ErrorBoundary'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import store from '../store/store'
import { Provider } from 'react-redux'
import PrivateRoute from './common/PrivateRoute'
import Login from './login/Login'
import Connect from './Connect'
import ScenePicker from './scenePicker/ScenePicker'
import { defaultTheme } from '../theme'

const App = () => {
  return (
    <Provider store={store}>
      <CacheProvider value={createCache({ key: 'css' })}>
        <ThemeProvider theme={createTheme(defaultTheme as ThemeOptions)}>
          <ErrorBoundary>
            <CssBaseline />
            <Routes>
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <ScenePicker />
                  </PrivateRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route
                path="/connect"
                element={
                  <PrivateRoute>
                    <Connect />
                  </PrivateRoute>
                }
              />
            </Routes>
          </ErrorBoundary>
        </ThemeProvider>
      </CacheProvider>
    </Provider>
  )
}
export default App
