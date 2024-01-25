import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import ErrorBoundary from '../ErrorBoundary'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

describe('ErrorBoundary', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <ErrorBoundary>
          <p>FlipFlip</p>
        </ErrorBoundary>
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
