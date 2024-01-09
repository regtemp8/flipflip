import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import Meta from './components/Meta'
import './style.scss'
import store from './store/store'

ReactDOM.render(
  <Provider store={store}>
    <Meta />
  </Provider>,
  document.getElementById('app')
)
