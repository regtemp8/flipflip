import { ThemeOptions } from '@mui/material'

declare global {
  interface Window {
    flipflipTheme?: ThemeOptions
    flipflipNonce?: string
    flipflip?: {
      ipc: {
        getNetworkURLs: () => Promise<Array<{ name: string; url: string }>>
        getMagicLink: (url: string) => Promise<string>
        openExternal: (url: string) => void
        onShowLoginCodeDialog: (callback: () => void) => void
        onCloseLoginCodeDialog: (callback: () => void) => void
        cancelLoginCode: () => void
        verifyLoginCode: (code: string) => void
      }
    }
  }
}
