import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import LibrarySearch from '../LibrarySearch'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

// TODO create functional tests instead of snapshots
describe('LibrarySearch', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <LibrarySearch
          displaySources={[]}
          filters={[]}
          placeholder="Search..."
          onUpdateFilters={(filter) => {}}
        />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
