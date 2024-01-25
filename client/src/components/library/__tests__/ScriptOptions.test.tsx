import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import ScriptOptions from '../ScriptOptions'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'
import { newCaptionScript } from '../../../store/captionScript/CaptionScript'
import { setCaptionScript } from '../../../store/captionScript/slice'

jest.mock('../FontOptions', () => 'FontOptions')

// TODO create functional tests instead of snapshots
describe('ScriptOptions', () => {
  it('should match snapshot', () => {
    const scriptID = 3
    store.dispatch(setCaptionScript(newCaptionScript({ id: scriptID })))
    const component = renderer.create(
      <TestProvider store={store}>
        <ScriptOptions scriptID={scriptID} onDone={() => {}} />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
