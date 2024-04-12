import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerZIP } from '@electron-forge/maker-zip'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'

import { devConfig } from './webpack.dev.config'
import { mainConfig } from './webpack.main.config'
import { rendererConfig } from './webpack.renderer.config'

const dev = process.env.DEV === 'true'

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'FlipFlip',
    icon: './icons/flipflip_logo'
  },
  rebuildConfig: {},
  makers: [new MakerZIP({}, ['darwin', 'linux', 'win32'])],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig: dev ? devConfig : mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            name: 'main_window',
            preload: {
              js: './src/preload.ts'
            }
          }
        ]
      }
    })
  ]
}

export default config
