import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import AudioAlert from '../AudioAlert'
import TestProvider from '../../../util/TestProvider'
import { newAudio } from '../../../store/audio/Audio'
import store from '../../../store/store'

// TODO create functional tests instead of snapshots
describe('AudioAlert', () => {
  it('should match snapshot', () => {
    const audio = newAudio()
    const component = renderer.create(
      <TestProvider store={store}>
        <AudioAlert audio={audio} />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
