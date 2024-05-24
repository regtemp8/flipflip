import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import Meta from '../Meta'
import store from '../../store/store'
import { createEmotionCache } from '../../server/renderer'
import { Provider } from 'react-redux'

jest.mock('../error/ErrorBoundary', () => 'ErrorBoundary')
jest.mock('../ScenePicker', () => 'ScenePicker')
jest.mock('../config/ConfigForm', () => 'ConfigForm')
jest.mock('../library/Library', () => 'Library')
jest.mock('../library/TagManager', () => 'TagManager')
jest.mock('../config/VideoClipper', () => 'VideoClipper')
jest.mock('../player/Player', () => 'Player')
jest.mock('../sceneDetail/SceneDetail', () => 'SceneDetail')
jest.mock('../Tutorial', () => 'Tutorial')
jest.mock('../library/AudioLibrary', () => 'AudioLibrary')
jest.mock('../sceneDetail/CaptionScriptor', () => 'CaptionScriptor')
jest.mock('../library/ScriptLibrary', () => 'ScriptLibrary')

// TODO create functional tests instead of snapshots
describe('Meta', () => {
  it('should match snapshot', () => {
    const cache = createEmotionCache()
    const component = renderer.create(
      <Provider store={store}>
        <Meta cache={cache} />
      </Provider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
