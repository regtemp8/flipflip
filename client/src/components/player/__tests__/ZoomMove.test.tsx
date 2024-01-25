import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import ZoomMove from '../ZoomMove'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'
import { setScene } from '../../../store/scene/slice'
import { newScene } from '../../../store/scene/Scene'

describe('ZoomMove', () => {
  it('should match snapshot', () => {
    const sceneID = 3
    store.dispatch(setScene(newScene({ id: sceneID })))

    const component = renderer.create(
      <TestProvider store={store}>
        <ZoomMove
          sceneID={sceneID}
          reset={false}
          timeToNextFrame={0}
          currentAudio={null}
        >
          <p>Test</p>
        </ZoomMove>
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
