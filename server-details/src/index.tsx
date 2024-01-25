/// <reference path="./global.d.ts" />
import ReactDOM from 'react-dom/client'
import ServerDetails from './ServerDetails'

ReactDOM.hydrateRoot(
  document.getElementById('details') as Element,
  <ServerDetails theme={window.flipflipTheme} nonce={window.flipflipNonce} />
)
