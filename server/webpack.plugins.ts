import fs from 'fs'
import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import { DefinePlugin } from 'webpack'
import * as packageJson from './package.json'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure'
  })
]

export const definePlugin = new DefinePlugin({
  PACKAGE_JSON_VERSION_WEBPACK_ENTRY: JSON.stringify(packageJson.version),
  LOGIN_BUNDLE_WEBPACK_ENTRY: JSON.stringify(
    fs
      .readdirSync('../login/build/static/js')
      .find((f) => f.startsWith('main') && f.endsWith('.js'))
  ),
  SERVER_DETAILS_BUNDLE_WEBPACK_ENTRY: JSON.stringify(
    fs
      .readdirSync('../server-details/build/static/js')
      .find((f) => f.startsWith('main') && f.endsWith('.js'))
  )
})
