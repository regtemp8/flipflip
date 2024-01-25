import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import AudioAlbumList from '../AudioAlbumList'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

describe('AudioAlbumList', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <AudioAlbumList
          sources={[]}
          showHelp={false}
          onClickAlbum={(album) => {}}
          onClickArtist={(artist) => {}}
        />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
