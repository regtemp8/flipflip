import path from 'path'
export const isMacOSX = process.platform === 'darwin'

export function getElectronSaveDir() {
  let directory: string | undefined
  switch (process.platform) {
    case 'win32':
      directory = process.env.APPDATA
      break
    case 'darwin':
      directory = process.env.HOME + '/Library/Application Support'
      break
    case 'linux':
      directory = process.env.XDG_CONFIG_HOME ?? process.env.HOME + '/.config'
      break
  }

  return directory != null ? directory + '/flipflip' : undefined
}

export function getSaveDir() {
  return process.env.FF_SAVE_DIR ?? process.cwd()
}

export function getBackupsDir() {
  return path.resolve(getSaveDir(), 'backups')
}

export function getCacheDir() {
  return path.resolve(getSaveDir(), 'cache')
}

export function getLogsDir() {
  return path.resolve(getSaveDir(), 'logs')
}

export function getFileName(url: string, extension = true) {
  let sep
  if (/^(https?:\/\/)|(file:\/\/)/g.exec(url) != null) {
    sep = '/'
  } else {
    sep = path.sep
  }
  url = url.substring(url.lastIndexOf(sep) + 1)
  if (url.includes('?')) {
    url = url.substring(0, url.indexOf('?'))
  }
  if (!extension) {
    url = url.substring(0, url.lastIndexOf('.'))
  }
  return url
}
