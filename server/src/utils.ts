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
  return process.env.SAVE_DIR ?? process.cwd()
}

export function getBackupsDir() {
  return getSaveDir() + path.sep + 'backups'
}
