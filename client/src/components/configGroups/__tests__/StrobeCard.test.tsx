import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import StrobeCard from '../StrobeCard'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

jest.mock('../../config/ColorPicker', () => 'ColorPicker')
jest.mock('../../config/ColorSetPicker', () => 'ColorSetPicker')

// TODO create functional tests instead of snapshots
describe('StrobeCard', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <StrobeCard />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
