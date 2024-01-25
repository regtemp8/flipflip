import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import PanningCard from '../PanningCard'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

// TODO create functional tests instead of snapshots
describe('PanningCard', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <PanningCard />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
