import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import PlaylistList from '../PlaylistList'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

describe('PlaylistList', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <PlaylistList showHelp={false} onClickPlaylist={(playlist) => {}} />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
