import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import GridPlayer from '../GridPlayer'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'
import { setSceneGrid } from '../../../store/sceneGrid/slice'
import { newSceneGrid } from '../../../store/sceneGrid/SceneGrid'
import {
  PlayerOverlayState,
  PlayersState,
  setPlayersState
} from '../../../store/player/slice'
import { setScene } from '../../../store/scene/slice'
import { newScene } from '../../../store/scene/Scene'
import { newSceneGridCell } from '../../../store/sceneGrid/SceneGridCell'

jest.mock('../Player', () => 'Player')

// TODO create functional tests instead of snapshots
describe('GridPlayer', () => {
  it('should match snapshot', () => {
    const sceneID = 3
    const overlayState: PlayerOverlayState = {
      id: 1,
      opacity: 1,
      sceneID,
      isGrid: true,
      grid: [['grid']],
      loaded: false
    }
    const playersState: PlayersState = {
      root: {
        sceneID: 1,
        nextSceneID: 0,
        overlays: [overlayState],
        firstImageLoaded: false,
        mainLoaded: false,
        isEmpty: false,
        hasStarted: false
      },
      grid: {
        sceneID: 1,
        nextSceneID: 0,
        overlays: [],
        firstImageLoaded: false,
        mainLoaded: false,
        isEmpty: false,
        hasStarted: false
      }
    }

    store.dispatch(setScene(newScene({ id: 1 })))
    store.dispatch(
      setSceneGrid(
        newSceneGrid({
          id: sceneID,
          grid: [[newSceneGridCell({ sceneID: 1 })]]
        })
      )
    )
    store.dispatch(setPlayersState(playersState))
    const component = renderer.create(
      <TestProvider store={store}>
        <GridPlayer
          parentUUID="root"
          overlayIndex={0}
          gridConfig={overlayState}
        />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
