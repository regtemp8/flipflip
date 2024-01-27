export default interface SystemConstants {
  isWin32: boolean
  isMacOSX: boolean
  pathSep: string
  saveDir: string
  savePath: string
  portablePath: string
  portablePathExists: boolean
}

export const initialSystemConstants: SystemConstants = {
  isWin32: false,
  isMacOSX: false,
  pathSep: '',
  saveDir: '',
  savePath: '',
  portablePath: '',
  portablePathExists: false
}
