import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import SoundTick from '../SoundTick'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

describe('SoundTick', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <SoundTick
          url={null}
          playing={null}
          speed={1}
          volume={0}
          tick={false}
          onPlaying={(soundData) => {}}
          onError={(errorCode, description) => {}}
          onFinishedPlaying={() => {}}
        />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
