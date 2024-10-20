import path from 'path'
export const isMacOSX = process.platform === 'darwin'

export function getSaveDir(useNodeEnv = true) {
  if(process.env.NODE_ENV === 'test') {
    return path.join(__dirname, '../tests')
  }
  if (useNodeEnv && process.env.NODE_ENV === 'development') {
    return '/tmp'
  }

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

  return directory + '/flipflip'
}
