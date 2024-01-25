/// <reference path="../global.d.ts" />
import { getFileName } from '../components/player/Scrapers'
import { ASF, SF } from 'flipflip-common'
import type Audio from '../store/audio/Audio'
import type LibrarySource from '../store/librarySource/LibrarySource'
import type CaptionScript from '../store/captionScript/CaptionScript'

/** Getters **/

// Returns the active scene, or null if the current route isn't a scene

/** Actions **/
// All of these functions return object diffs that you can pass to ReactComponent.setState().
// The first argument is always a State object, even if it isn't used.

function openFullScreen() {
  const elem = document.documentElement as any
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.webkitRequestFullscreen) {
    /* Safari */
    elem.webkitRequestFullscreen()
  } else if (elem.msRequestFullscreen) {
    /* IE11 */
    elem.msRequestFullscreen()
  }
}

function closeFullScreen() {
  const doc = document as any
  if (doc.exitFullscreen) {
    doc.exitFullscreen()
  } else if (doc.webkitExitFullscreen) {
    /* Safari */
    doc.webkitExitFullscreen()
  } else if (doc.msExitFullscreen) {
    /* IE11 */
    doc.msExitFullscreen()
  }
}

function getFullScreenElement() {
  const doc = document as any
  return (
    doc.fullscreenElement /* Standard syntax */ ??
    doc.webkitFullscreenElement /* Safari and Opera syntax */ ??
    doc.msFullscreenElement
  ) /* IE11 syntax */
}

export function toggleFullScreen(): boolean {
  const fullScreen = getFullScreenElement() != null
  if (fullScreen) {
    closeFullScreen()
  } else {
    openFullScreen()
  }

  return fullScreen
}

export function setFullScreen(fullScreen: boolean): void {
  const isFullScreen = getFullScreenElement() != null
  if (fullScreen === isFullScreen) {
    return
  } else if (fullScreen) {
    openFullScreen()
  } else {
    closeFullScreen()
  }
}

export function audioSortFunction(
  algorithm: string,
  ascending: boolean
): (a: Audio, b: Audio) => number {
  return (a, b) => {
    let secondary = null
    let aValue: any, bValue: any
    switch (algorithm) {
      case ASF.url:
        aValue = a.url
        bValue = b.url
        break
      case ASF.name:
        const reA = /^(A\s|a\s|The\s|the\s)/g
        aValue = a.name as string
        aValue = aValue.replace(reA, '')
        bValue = b.name as string
        bValue = bValue.replace(reA, '')

        const compare = aValue.localeCompare(bValue, 'en', { numeric: true })
        return ascending ? compare : compare * -1
      case ASF.artist:
        aValue = a.artist
        bValue = b.artist
        secondary = ASF.album
        break
      case ASF.album:
        aValue = a.album
        bValue = b.album
        secondary = ASF.trackNum
        break
      case ASF.date:
        aValue = a.id
        bValue = b.id
        break
      case ASF.trackNum:
        aValue = parseInt(a.trackNum as any)
        bValue = parseInt(b.trackNum as any)
        secondary = ASF.name
        break
      case ASF.duration:
        aValue = a.duration
        bValue = b.duration
        break
      case ASF.playedCount:
        aValue = a.playedCount
        bValue = b.playedCount
        secondary = ASF.artist
        break
      default:
        aValue = ''
        bValue = ''
    }
    if (aValue < bValue) {
      return ascending ? -1 : 1
    } else if (aValue > bValue) {
      return ascending ? 1 : -1
    } else {
      if (secondary) {
        return audioSortFunction(secondary, true)(a, b)
      } else {
        return 0
      }
    }
  }
}

export function scriptSortFunction(
  algorithm: string,
  ascending: boolean,
  pathSep: string
): (a: CaptionScript, b: CaptionScript) => number {
  return (a, b) => {
    let aValue: any, bValue: any
    switch (algorithm) {
      case SF.alpha:
        aValue = getFileName(a.url as string, pathSep).toLowerCase()
        bValue = getFileName(b.url as string, pathSep).toLowerCase()
        break
      case SF.alphaFull:
        aValue = a.url as string
        aValue = aValue.toLowerCase()
        bValue = b.url as string
        bValue = bValue.toLowerCase()
        break
      case SF.date:
        aValue = a.id
        bValue = b.id
        break
      default:
        aValue = ''
        bValue = ''
    }
    if (aValue < bValue) {
      return ascending ? -1 : 1
    } else if (aValue > bValue) {
      return ascending ? 1 : -1
    } else {
      return 0
    }
  }
}

export function sortFunction(
  algorithm: string,
  ascending: boolean,
  getName: ((a: any) => string) | undefined,
  getFullName: ((a: any) => string) | undefined,
  getCount: ((a: any) => number) | undefined,
  getType: ((a: any) => string) | undefined,
  secondary?: string
): (a: any, b: any) => number {
  return (a, b) => {
    let aValue: any, bValue: any
    switch (algorithm) {
      case SF.alpha:
        aValue = getName!(a)
        bValue = getName!(b)
        break
      case SF.alphaFull:
        aValue = getFullName!(a)
        bValue = getFullName!(b)
        break
      case SF.date:
        aValue = a.id
        bValue = b.id
        break
      case SF.count:
        aValue = getCount!(a)
        bValue = getCount!(b)
        break
      case SF.type:
        aValue = getType!(a)
        bValue = getType!(b)
        break
      case SF.duration:
        aValue = a.duration
        bValue = b.duration
        break
      case SF.resolution:
        aValue = a.resolution
        bValue = b.resolution
        break
      default:
        aValue = ''
        bValue = ''
    }

    if (algorithm === SF.duration || algorithm === SF.resolution) {
      if (aValue == null && bValue != null) {
        return 1
      } else if (bValue == null && aValue != null) {
        return -1
      } else if (bValue == null && aValue == null) {
        return 0
      }
    }
    if (aValue < bValue) {
      return ascending ? -1 : 1
    } else if (aValue > bValue) {
      return ascending ? 1 : -1
    } else {
      if (secondary != null) {
        return sortFunction(
          secondary,
          true,
          getName,
          getFullName,
          getCount,
          getType,
          undefined
        )(a, b)
      } else {
        return 0
      }
    }
  }
}

export function getSourceUrl(
  source: LibrarySource | Audio | CaptionScript,
  pathSep: string
): string {
  const url = source.url as string
  return url.startsWith('http') ? url : url.replace(/\//g, pathSep)
}
