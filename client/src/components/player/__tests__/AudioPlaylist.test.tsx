import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioPlaylist from "../AudioPlaylist";
import TestProvider from "../../../util/TestProvider";
import { RP } from "flipflip-common";
import store from "../../../store/store";
import { newScene } from "../../../store/scene/Scene";
import { setScene } from "../../../store/scene/slice";

jest.mock('../AudioControl', () => 'AudioControl');
jest.mock('../../library/SourceIcon', () => 'SourceIcon');

// mocking this so that test doesn't throw error
jest.mock('react-sortablejs', () => 'Sortable');

describe("AudioPlaylist", () => {
  it("should match snapshot", () => {
    const sceneID = 3
    const playlist = { audios: [], shuffle: false, repeat: RP.none }
    store.dispatch(setScene(newScene({ id: sceneID, audioPlaylists: [playlist] })))
    const component = renderer.create(
      <TestProvider store={store}>
        <AudioPlaylist
          sceneID={sceneID}
          playlistIndex={0}
          playlist={playlist}
          startPlaying={false}
          onAddTracks={(playlistIndex) => {}}
          onSourceOptions={(audio) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
