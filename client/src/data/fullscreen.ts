import fscreen from 'fscreen'

function openFullScreen() {
  if (fscreen.fullscreenEnabled) {
    const elem = document.documentElement as any
    fscreen.requestFullscreen(elem)
  }
}

function closeFullScreen() {
  if (fscreen.fullscreenEnabled) {
    fscreen.exitFullscreen()
  }
}

export function toggleFullScreen(): boolean | undefined {
  if (!fscreen.fullscreenEnabled) {
    return undefined
  }

  const isFullScreen = fscreen.fullscreenElement != null
  if (isFullScreen) {
    closeFullScreen()
  } else {
    openFullScreen()
  }

  return isFullScreen
}

export function setFullScreen(fullScreen: boolean): void {
  if (!fscreen.fullscreenEnabled) {
    return
  }

  const isFullScreen = fscreen.fullscreenElement != null
  if (fullScreen === isFullScreen) {
    return
  } else if (fullScreen) {
    openFullScreen()
  } else {
    closeFullScreen()
  }
}
