import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import FadeInOut from '../FadeInOut'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'
import { setScene } from '../../../store/scene/slice'
import { newScene } from '../../../store/scene/Scene'

describe('FadeInOut', () => {
  it('should match snapshot', () => {
    const sceneID = 3
    store.dispatch(setScene(newScene({ id: sceneID })))

    const component = renderer.create(
      <TestProvider store={store}>
        <FadeInOut
          toggleFade={false}
          currentAudio={null}
          timeToNextFrame={0}
          sceneID={sceneID}
          fadeFunction={() => {}}
        >
          <p>Test</p>
        </FadeInOut>
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
