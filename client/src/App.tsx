import { Provider } from 'react-redux'
import Meta from './components/Meta'
import { RootState } from './store/store'
import { EmotionCache } from '@emotion/react'
import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore'

export interface AppProps {
  store: ToolkitStore<RootState>
  cache: EmotionCache
}

export default function App(props: AppProps) {
  return (
    <Provider store={props.store}>
      <Meta cache={props.cache} />
    </Provider>
  )
}
