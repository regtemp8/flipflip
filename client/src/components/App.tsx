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
import Account from './account/Account'
import ScenePicker from './scenePicker/ScenePicker'
import { defaultTheme } from '../theme'
import SystemSnack from './SystemSnack'

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
                path="/account/*"
                element={
                  <PrivateRoute>
                    <Account />
                  </PrivateRoute>
                }
              />
            </Routes>
            <SystemSnack />
          </ErrorBoundary>
        </ThemeProvider>
      </CacheProvider>
    </Provider>
  )
}
export default App
