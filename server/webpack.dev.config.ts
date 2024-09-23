import path from 'path'
import type { Configuration } from 'webpack'

import { rules } from './webpack.rules'
import { definePlugin } from './webpack.plugins'

export const devConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './dev/index.ts',
  // Put your normal webpack config below here
  module: {
    rules
  },
  plugins: [definePlugin],
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
    _stream_wrap: '_stream_wrap'
  }
}
