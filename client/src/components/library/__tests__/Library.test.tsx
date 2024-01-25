import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import Library from '../Library'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

jest.mock('../BatchClipDialog', () => 'BatchClipDialog')
jest.mock('../LibrarySearch', () => 'LibrarySearch')
jest.mock('../SourceIcon', () => 'SourceIcon')
jest.mock('../SourceList', () => 'SourceList')
jest.mock('../../sceneDetail/URLDialog', () => 'URLDialog')
jest.mock('../../sceneDetail/PiwigoDialog', () => 'PiwigoDialog')

// TODO create functional tests instead of snapshots
describe('Library', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <Library />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
