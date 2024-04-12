import { OT } from '../const';
import { copy } from '../utils';

import { type CacheSettings, initialCacheSettings } from './CacheSettings';
import {
  type DisplaySettings,
  initialDisplaySettings,
} from './DisplaySettings';
import {
  type GeneralSettings,
  initialGeneralSettings,
} from './GeneralSettings';
import { initialRemoteSettings, type RemoteSettings } from './RemoteSettings';
import { initialSceneSettings, type SceneSettings } from './SceneSettings';
import { ServerSettings } from './ServerSettings';
import { initialTutorials, type Tutorials } from './Tutorials';

export type Config = {
  defaultScene: SceneSettings;
  remoteSettings: RemoteSettings;
  caching: CacheSettings;
  displaySettings: DisplaySettings;
  generalSettings: GeneralSettings;
  tutorials: Tutorials;
  clientID: string;
  newWindowAlerted: boolean;
  serverSettings?: ServerSettings;
};

export const initialConfig: Config = {
  defaultScene: initialSceneSettings,
  remoteSettings: initialRemoteSettings,
  caching: initialCacheSettings,
  displaySettings: initialDisplaySettings,
  generalSettings: initialGeneralSettings,
  tutorials: initialTutorials,
  clientID: '',
  newWindowAlerted: false,
};

export function newConfig(init?: Partial<Config>) {
  const config = Object.assign(copy<Config>(initialConfig), init);

  // Add any missing keys (keeps config up-to-date)
  for (const key of Object.keys(initialSceneSettings)) {
    if (config.defaultScene[key] == null) {
      config.defaultScene[key] = initialSceneSettings[key];
    }
  }
  for (const key of Object.keys(initialRemoteSettings)) {
    if (config.remoteSettings[key] == null) {
      config.remoteSettings[key] = initialRemoteSettings[key];
    }
  }
  for (const key of Object.keys(initialCacheSettings)) {
    if (config.caching[key] == null) {
      config.caching[key] = initialCacheSettings[key];
    }
  }
  for (const key of Object.keys(initialDisplaySettings)) {
    if (config.displaySettings[key] == null) {
      config.displaySettings[key] = initialDisplaySettings[key];
    }
  }
  for (const key of Object.keys(initialGeneralSettings)) {
    if (config.generalSettings[key] == null) {
      config.generalSettings[key] = initialGeneralSettings[key];
    }
  }
  for (const key of Object.keys(initialTutorials)) {
    if (config.tutorials[key] == null) {
      config.tutorials[key] = initialTutorials[key];
    }
  }

  if (config.defaultScene && config.defaultScene.overlaySceneID !== 0) {
    config.defaultScene.overlaySceneID = 0;
  }
  if (config.defaultScene && config.defaultScene.rotatePortrait) {
    config.defaultScene.videoOrientation = OT.forceLandscape;
    config.defaultScene.rotatePortrait = false;
  }
  if (config.displaySettings && config.displaySettings.portableMode === true) {
    config.displaySettings.portableMode = undefined;
    config.generalSettings.portableMode = true;
  }

  return config;
}
