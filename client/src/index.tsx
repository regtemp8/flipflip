import * as ReactDOM from 'react-dom/client'
import './style.scss'
import store from './store/store'
import { createEmotionCache } from './server/renderer'
import App from './App'
import flipflip, { FlipFlipService } from './FlipFlipService'
import { setAppStorage } from './store/app/thunks'
import { setConstants } from './store/constants/slice'

const cache = createEmotionCache()
if (process.env.NODE_ENV === 'production') {
  ReactDOM.hydrateRoot(
    document.getElementById('app') as Element,
    <App store={store} cache={cache} />
  )
} else {
  FlipFlipService.devServerURL = 'ws://localhost:59779'
  flipflip()
    .api.getAppStorageInitialState()
    .then((state) => {
      setAppStorage(state, store.dispatch)
      return flipflip().api.getContext()
    })
    .then((context) => {
      store.dispatch(setConstants(context))
      ReactDOM.createRoot(document.getElementById('app') as Element).render(
        <App store={store} cache={cache} />
      )
    })
}
