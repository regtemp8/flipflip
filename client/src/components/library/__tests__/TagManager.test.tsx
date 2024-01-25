import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import TagManager from '../TagManager'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

jest.mock('../../../animations/Jiggle', () => 'Jiggle')

// mocking this so that test doesn't throw error
jest.mock('react-sortablejs', () => 'Sortable')

describe('TagManager', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <TagManager />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
