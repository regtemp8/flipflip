import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import CodeMirror from '../CodeMirror'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'

describe('CodeMirror', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <CodeMirror
          onGutterClick={(editor: any, clickedLine: number) => {}}
          onUpdateScript={(text: string, changed?: boolean) => {}}
        />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
