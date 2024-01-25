import React from 'react'
import { describe, it, expect } from '@jest/globals'
import renderer from 'react-test-renderer'
import Player from '../Player'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'
import { setScene } from '../../../store/scene/slice'
import { newScene } from '../../../store/scene/Scene'
import { setRoute } from '../../../store/app/slice'
import { PlayersState, setPlayersState } from '../../../store/player/slice'
import {
  ScrapedSources,
  setSourceScraperState
} from '../../../store/sourceScraper/slice'

jest.mock('../AudioAlert', () => 'AudioAlert')
jest.mock('../CaptionProgramPlaylist', () => 'CaptionProgramPlaylist')
jest.mock('../GridPlayer', () => 'GridPlayer')
jest.mock('../ImageView', () => 'ImageView')
jest.mock('../PictureGrid', () => 'PictureGrid')
jest.mock('../PlayerBars', () => 'PlayerBars')
jest.mock('../SourceScraper', () => 'SourceScraper')
jest.mock('../Strobe', () => 'Strobe')

// TODO create functional tests instead of snapshots
describe('Player', () => {
  it('should match snapshot', () => {
    const sceneID = 3
    const playersState: PlayersState = {
      root: {
        sceneID,
        nextSceneID: -1,
        overlays: [],
        firstImageLoaded: false,
        isEmpty: false,
        mainLoaded: false,
        hasStarted: false
      }
    }
    const sourceScraperState: Record<number, ScrapedSources> = {}
    sourceScraperState[sceneID] = {
      sceneSources: [],
      allPosts: {},
      promiseQueue: [],
      workerUUID: 'worker',
      completed: false
    }

    store.dispatch(setScene(newScene({ id: sceneID })))
    store.dispatch(setPlayersState(playersState))
    store.dispatch(setSourceScraperState(sourceScraperState))
    store.dispatch(setRoute([{ kind: 'play', value: sceneID }]))
    const component = renderer.create(
      <TestProvider store={store}>
        <Player uuid="root" />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
