export function getSaveDir() {
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
