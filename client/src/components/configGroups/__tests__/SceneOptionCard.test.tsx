import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import SceneOptionCard from '../SceneOptionCard'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

jest.mock('../SceneSelect', () => 'SceneSelect')
jest.mock('../../config/ColorPicker', () => 'ColorPicker')
jest.mock('../../config/ColorSetPicker', () => 'ColorSetPicker')
jest.mock('../MultiSceneSelect', () => 'MultiSceneSelect')

// mocking this so that test doesn't throw error
jest.mock('@mui/material/Slider', () => 'Slider')

// TODO create functional tests instead of snapshots
describe('SceneOptionCard', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <SceneOptionCard />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
