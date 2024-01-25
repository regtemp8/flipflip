import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import PlayerBars from '../PlayerBars'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'
import { setScene } from '../../../store/scene/slice'
import { newScene } from '../../../store/scene/Scene'

jest.mock('../../configGroups/SceneOptionCard', () => 'SceneOptionCard')
jest.mock('../../configGroups/ImageVideoCard', () => 'ImageVideoCard')
jest.mock('../../configGroups/ZoomMoveCard', () => 'ZoomMoveCard')
jest.mock('../../configGroups/CrossFadeCard', () => 'CrossFadeCard')
jest.mock('../../configGroups/SlideCard', () => 'SlideCard')
jest.mock('../../configGroups/StrobeCard', () => 'StrobeCard')
jest.mock('../../configGroups/AudioCard', () => 'AudioCard')
jest.mock('../../configGroups/TextCard', () => 'TextCard')
jest.mock('../../configGroups/VideoCard', () => 'VideoCard')
jest.mock('../VideoControl', () => 'VideoControl')
jest.mock('../../configGroups/FadeIOCard', () => 'FadeIOCard')
jest.mock('../../configGroups/PanningCard', () => 'PanningCard')

describe('PlayerBars', () => {
  it('should match snapshot', () => {
    const sceneID = 3
    store.dispatch(setScene(newScene({ id: sceneID })))

    const component = renderer.create(
      <TestProvider store={store}>
        <PlayerBars
          hasStarted={false}
          historyPaths={[]}
          historyOffset={0}
          imagePlayerAdvanceHacks={[]}
          imagePlayerDeleteHack={null}
          isEmpty={false}
          isPlaying={false}
          mainVideo={null}
          overlayVideos={[]}
          persistAudio={false}
          persistText={false}
          recentPictureGrid={false}
          sceneID={sceneID}
          title={null}
          tutorial={null}
          goBack={() => {}}
          historyBack={() => {}}
          historyForward={() => {}}
          navigateTagging={(offset) => {}}
          onRecentPictureGrid={() => {}}
          play={() => {}}
          pause={() => {}}
          setCurrentAudio={(audio) => {}}
        />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
