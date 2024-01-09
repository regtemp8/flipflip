import type AppStorage from './ipc/data/AppStorage'

declare module 'ws' {
  class _WS extends WebSocket {}
  export interface WebSocket extends _WS {
    storage?: AppStorage
  }
}

declare module 'express-session' {
  interface SessionData {
    authenticated: boolean
  }
}
