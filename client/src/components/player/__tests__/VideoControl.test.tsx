import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import VideoControl from '../VideoControl'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

describe('VideoControl', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <VideoControl video={null} onChangeVolume={(volume) => {}} />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
