import path from 'path'
import type { Configuration } from 'webpack'
import { DefinePlugin } from 'webpack'

import { rules } from './webpack.rules'
import { plugins } from './webpack.plugins'

import * as packageJson from './package.json'

// eslint-disable-next-line import/default
import CopyPlugin from 'copy-webpack-plugin'

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules
  },
  plugins: [
    ...plugins,
    new CopyPlugin({
      patterns: [
        { from: './icons', to: 'icons' },
        {
          from: '../client/public',
          to: 'public',
          globOptions: {
            ignore: ['**/index.html']
          }
        },
        { from: '../client/build/static/js', to: 'public/static/js' },
        { from: '../client/build/static/css', to: 'public/static/css' },
        { from: '../client/build/static/media', to: 'public/static/media' },
        { from: '../client/build/index.html', to: 'public/client.html' },
        {
          from: '../server-details/build/static/js',
          to: 'public/static/js'
        },
        {
          from: '../server-details/build/index.html',
          to: 'public/server-details.html'
        }
      ]
    }),
    new DefinePlugin({
      PACKAGE_JSON_VERSION_WEBPACK_ENTRY: JSON.stringify(packageJson.version)
    })
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom')
    }
  },
  externals: {
    bufferutil: 'bufferutil',
    'utf-8-validate': 'utf-8-validate',
    '_stream_wrap': '_stream_wrap'
  }
}
