import type SceneSettings from './SceneSettings'
import { initialSceneSettings } from './SceneSettings'
import type RemoteSettings from './RemoteSettings'
import { initialRemoteSettings } from './RemoteSettings'
import type CacheSettings from './CacheSettings'
import { initialCacheSettings } from './CacheSettings'
import type DisplaySettings from './DisplaySettings'
import { initialDisplaySettings } from './DisplaySettings'
import type GeneralSettings from './GeneralSettings'
import { initialGeneralSettings } from './GeneralSettings'
import type Tutorials from './Tutorials'
import { initialTutorials } from './Tutorials'
import { copy, OT } from 'flipflip-common'

export default interface Config {
  defaultScene: SceneSettings
  remoteSettings: RemoteSettings
  caching: CacheSettings
  displaySettings: DisplaySettings
  generalSettings: GeneralSettings
  tutorials: Tutorials
  clientID: string
  newWindowAlerted: boolean
}

export const initialConfig: Config = {
  defaultScene: initialSceneSettings,
  remoteSettings: initialRemoteSettings,
  caching: initialCacheSettings,
  displaySettings: initialDisplaySettings,
  generalSettings: initialGeneralSettings,
  tutorials: initialTutorials,
  clientID: '',
  newWindowAlerted: false
}

export function newConfig(init?: Partial<Config>) {
  const config = Object.assign(copy<Config>(initialConfig), init)

  // Add any missing keys (keeps config up-to-date)
  for (const key of Object.keys(initialSceneSettings)) {
    if (config.defaultScene[key] == null) {
      config.defaultScene[key] = initialSceneSettings[key]
    }
  }
  for (const key of Object.keys(initialRemoteSettings)) {
    if (config.remoteSettings[key] == null) {
      config.remoteSettings[key] = initialRemoteSettings[key]
    }
  }
  for (const key of Object.keys(initialCacheSettings)) {
    if (config.caching[key] == null) {
      config.caching[key] = initialCacheSettings[key]
    }
  }
  for (const key of Object.keys(initialDisplaySettings)) {
    if (config.displaySettings[key] == null) {
      config.displaySettings[key] = initialDisplaySettings[key]
    }
  }
  for (const key of Object.keys(initialGeneralSettings)) {
    if (config.generalSettings[key] == null) {
      config.generalSettings[key] = initialGeneralSettings[key]
    }
  }
  for (const key of Object.keys(initialTutorials)) {
    if (config.tutorials[key] == null) {
      config.tutorials[key] = initialTutorials[key]
    }
  }

  if (config.defaultScene && config.defaultScene.overlaySceneID !== 0) {
    config.defaultScene.overlaySceneID = 0
  }
  if (config.defaultScene && config.defaultScene.rotatePortrait) {
    config.defaultScene.videoOrientation = OT.forceLandscape
    config.defaultScene.rotatePortrait = false
  }
  if (
    config.displaySettings &&
    (config.displaySettings as any).portableMode === true
  ) {
    ;(config.displaySettings as any).portableMode = undefined
    config.generalSettings.portableMode = true
  }

  return config
}
