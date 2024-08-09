import { getFileName } from '../components/player/Scrapers'
import { ASF, SF } from './const'
import type Audio from '../../store/audio/Audio'
import type LibrarySource from '../../store/librarySource/LibrarySource'
import type CaptionScript from '../../store/captionScript/CaptionScript'

/** Getters **/

// Returns the active scene, or null if the current route isn't a scene

/** Actions **/
// All of these functions return object diffs that you can pass to ReactComponent.setState().
// The first argument is always a State object, even if it isn't used.

export async function printMemoryReport () {
  const report = await window.flipflip.api.getMemoryReport()
  console.log(report)
}

export function audioSortFunction (
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
        aValue = a.name.replace(reA, '')
        bValue = b.name.replace(reA, '')

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

export function scriptSortFunction (
  algorithm: string,
  ascending: boolean,
  pathSep: string
): (a: CaptionScript, b: CaptionScript) => number {
  return (a, b) => {
    let aValue: any, bValue: any
    switch (algorithm) {
      case SF.alpha:
        aValue = getFileName(a.url, pathSep).toLowerCase()
        bValue = getFileName(b.url, pathSep).toLowerCase()
        break
      case SF.alphaFull:
        aValue = a.url.toLowerCase()
        bValue = b.url.toLowerCase()
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

export function sortFunction (
  algorithm: string,
  ascending: boolean,
  getName: (a: any) => string,
  getFullName: (a: any) => string,
  getCount: (a: any) => number,
  getType: (a: any) => string,
  secondary: string
): (a: any, b: any) => number {
  return (a, b) => {
    let aValue: any, bValue: any
    switch (algorithm) {
      case SF.alpha:
        aValue = getName(a)
        bValue = getName(b)
        break
      case SF.alphaFull:
        aValue = getFullName(a)
        bValue = getFullName(b)
        break
      case SF.date:
        aValue = a.id
        bValue = b.id
        break
      case SF.count:
        aValue = getCount(a)
        bValue = getCount(b)
        break
      case SF.type:
        aValue = getType(a)
        bValue = getType(b)
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
      if (secondary) {
        return sortFunction(
          secondary,
          true,
          getName,
          getFullName,
          getCount,
          getType,
          null
        )(a, b)
      } else {
        return 0
      }
    }
  }
}

export function getSourceUrl (
  source: LibrarySource | Audio | CaptionScript,
  pathSep: string
): string {
  return source.url.startsWith('http')
    ? source.url
    : source.url.replace(/\//g, pathSep)
}
