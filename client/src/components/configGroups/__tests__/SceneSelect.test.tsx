import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import SceneSelect from '../SceneSelect'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

// TODO create functional tests instead of snapshots
describe('SceneSelect', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <SceneSelect value={0} onChange={(sceneID) => {}} />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
