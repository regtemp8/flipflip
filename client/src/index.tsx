import * as ReactDOM from 'react-dom/client'
import './style.scss'
import store from './store/store'
import { createEmotionCache } from './server/renderer'
import App from './App'

const cache = createEmotionCache()
ReactDOM.hydrateRoot(
  document.getElementById('app') as Element,
  <App store={store} cache={cache} />
)

// ReactDOM.createRoot(
//   document.getElementById('app') as Element
// ).render(<App store={store} cache={cache} />)
