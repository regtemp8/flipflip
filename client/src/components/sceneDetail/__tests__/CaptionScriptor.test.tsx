import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import CaptionScriptor from '../CaptionScriptor'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'
import { setCaptionScript } from '../../../store/captionScript/slice'
import { newCaptionScript } from '../../../store/captionScript/CaptionScript'
import { setCaptionScriptorCaptionScriptID } from '../../../store/captionScriptor/slice'

jest.mock('../../player/Player', () => 'Player')
jest.mock('../../configGroups/SceneSelect', () => 'SceneSelect')
jest.mock('../../player/CaptionProgram', () => 'CaptionProgram')
jest.mock('../../configGroups/AudioCard', () => 'AudioCard')
jest.mock('../../library/FontOptions', () => 'FontOptions')

// mocking this so that test doesn't throw error
jest.mock('@mui/material/Slider', () => 'Slider')

// TODO create functional tests instead of snapshots
describe('CaptionScriptor', () => {
  it('should match snapshot', () => {
    const scriptID = 3
    store.dispatch(setCaptionScript(newCaptionScript({ id: scriptID })))
    store.dispatch(setCaptionScriptorCaptionScriptID(scriptID))

    const component = renderer.create(
      <TestProvider store={store}>
        <CaptionScriptor />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
