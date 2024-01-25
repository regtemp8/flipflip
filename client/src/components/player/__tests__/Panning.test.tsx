import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import Panning from '../Panning'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'
import { setScene } from '../../../store/scene/slice'
import { newScene } from '../../../store/scene/Scene'

describe('Panning', () => {
  it('should match snapshot', () => {
    const sceneID = 3
    store.dispatch(setScene(newScene({ id: sceneID })))

    const component = renderer.create(
      <TestProvider store={store}>
        <Panning
          togglePan={false}
          currentAudio={null}
          timeToNextFrame={0}
          sceneID={sceneID}
          panFunction={() => {}}
        >
          <p>Test</p>
        </Panning>
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
