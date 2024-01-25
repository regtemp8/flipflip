import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import PictureGrid from '../PictureGrid'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

jest.mock('../ImageView', () => 'ImageView')

describe('PictureGrid', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <PictureGrid pictures={[]} />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
