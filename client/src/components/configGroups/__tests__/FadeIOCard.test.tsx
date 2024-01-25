import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import FadeIOCard from '../FadeIOCard'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

// TODO create functional tests instead of snapshots
describe('FadeIOCard', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <FadeIOCard />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
