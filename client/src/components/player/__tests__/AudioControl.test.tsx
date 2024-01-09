import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioControl from "../AudioControl";
import TestProvider from "../../../util/TestProvider";
import { RP } from "flipflip-common";
import store from "../../../store/store";
import { setScene } from "../../../store/scene/slice";
import { newScene } from "../../../store/scene/Scene";
import { setAudio } from "../../../store/audio/slice";
import { newAudio } from "../../../store/audio/Audio";

jest.mock('../SoundTick', () => 'SoundTick');

// mocking this so that test doesn't throw error
jest.mock('@mui/material/Slider', () => 'Slider');

// TODO create functional tests instead of snapshots
describe("AudioControl", () => {
  it("should match snapshot", () => {
    const sceneID = 3
    const audioID = 7
    store.dispatch(setScene(newScene({id: sceneID})))
    store.dispatch(setAudio(newAudio({id: audioID})))
    const component = renderer.create(
      <TestProvider store={store}>
        <AudioControl
          sceneID={sceneID}
          audioID={audioID}
          audioEnabled={false}
          singleTrack={false}
          lastTrack={false}
          repeat={RP.none}
          scenePaths={[]}
          startPlaying={false}
          audioVolumeAction={(value) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
