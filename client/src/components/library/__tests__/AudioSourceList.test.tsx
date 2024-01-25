import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import AudioSourceList from '../AudioSourceList'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

jest.mock('../AudioSourceListItem', () => 'AudioSourceListItem')
jest.mock('../AudioEdit', () => 'AudioEdit')
jest.mock('../AudioOptions', () => 'AudioOptions')

describe('AudioSourceList', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <AudioSourceList
          cachePath={null}
          isSelect={false}
          selected={[]}
          showHelp={false}
          audios={[]}
          onClickAlbum={(album) => {}}
          onClickArtist={(artist) => {}}
          onUpdateSelected={(selected) => {}}
        />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
