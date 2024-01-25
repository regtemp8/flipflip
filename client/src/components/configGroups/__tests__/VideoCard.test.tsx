import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import VideoCard from '../VideoCard'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'
import { setScene } from '../../../store/scene/slice'
import { newScene } from '../../../store/scene/Scene'

jest.mock('../../player/VideoControl', () => 'VideoControl')

describe('VideoCard', () => {
  it('should match snapshot', () => {
    const sceneID = 3
    store.dispatch(setScene(newScene({ id: sceneID })))
    const component = renderer.create(
      <TestProvider store={store}>
        <VideoCard
          sceneID={sceneID}
          isPlaying={false}
          mainVideo={null}
          mainClipID={null}
          mainClipValue={[]}
          otherVideos={[]}
          imagePlayerAdvanceHacks={[]}
        />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
