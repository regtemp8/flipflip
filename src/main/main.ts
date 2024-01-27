import { app, session } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

import { initializeIpcEvents, releaseIpcEvents } from './IPCEvents'
import {
  createWorkerWindow,
  createNewWindow,
  startScene
} from './WindowManager'

export function getSaveDir (): string {
  return path.join(app.getPath('appData'), 'flipflip')
}

export function getSavePath (): string {
  return path.join(getSaveDir(), 'data.json')
}

export function getPortablePath (): string {
  return path.join(path.dirname(app.getAppPath()), 'data.json')
}

export function getPortablePathExists (): boolean {
  return fs.existsSync(getPortablePath())
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  session.defaultSession.webRequest.onHeadersReceived(
    (details: any, callback: any) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            'frame-src https://www.imagefap.com http://www.imagefap.com https://hypno.nimja.com/ http://hypno.nimja.com/',
            "font-src 'self' https://fonts.gstatic.com",
            "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'"
          ]
        }
      })
    }
  )

  // Enable garbage collection
  app.commandLine.appendSwitch('js-flags', '--expose_gc')

  createNewWindow()
  createWorkerWindow()
  initializeIpcEvents()

  // This could be improved, but there are only two command line options currently
  const sceneName = process.argv.find(
    (el, i, arr) =>
      el !== '--no-dev-tools' &&
      !el.endsWith('electron.exe') &&
      !el.endsWith('bundle.js')
  )
  if (sceneName) {
    setTimeout(startScene.bind(null, sceneName), 1500)
  }
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  releaseIpcEvents()
  app.quit()
})

app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required')
