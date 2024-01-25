import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import { IdleTimer } from '../IdleTimer'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

describe('IdleTimer', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <IdleTimer>
          <p>Test</p>
        </IdleTimer>
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
