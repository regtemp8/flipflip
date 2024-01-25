import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import GooninatorDialog from '../GooninatorDialog'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

describe('GooninatorDialog', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <GooninatorDialog
          open={false}
          onClose={() => {}}
          onImportURL={(type, e, args) => {}}
        />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
