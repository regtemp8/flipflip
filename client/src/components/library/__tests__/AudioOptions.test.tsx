import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import AudioOptions from '../AudioOptions'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'
import { newAudio } from '../../../store/audio/Audio'
import { setAudio } from '../../../store/audio/slice'

jest.mock('../../player/AudioControl', () => 'AudioControl')

// mocking this so that test doesn't throw error
jest.mock('@mui/material/Slider', () => 'Slider')

// TODO create functional tests instead of snapshots
describe('AudioOptions', () => {
  it('should match snapshot', () => {
    const audioID = 3
    store.dispatch(setAudio(newAudio({ id: audioID, url: 'audio.mp3' })))
    const component = renderer.create(
      <TestProvider store={store}>
        <AudioOptions audioID={audioID} onDone={() => {}} />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
