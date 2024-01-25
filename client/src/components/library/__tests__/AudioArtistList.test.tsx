import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import AudioArtistList from '../AudioArtistList'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

describe('AudioArtistList', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <AudioArtistList
          sources={[]}
          showHelp={false}
          onClickArtist={(artist) => {}}
        />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
