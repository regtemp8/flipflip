import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioCard from "../AudioCard";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";
import { setScene } from "../../../../store/scene/slice";
import { newScene } from "../../../../store/scene/Scene";

jest.mock('../../player/AudioPlaylist', () => 'AudioPlaylist');
jest.mock('../../library/AudioOptions', () => 'AudioOptions');

describe("AudioCard", () => {
  it("should match snapshot", () => {
    const sceneID = 3
    store.dispatch(setScene(newScene({id: sceneID})))

    const component = renderer.create(
      <TestProvider store={store}>
        <AudioCard sceneID={sceneID} startPlaying={false} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
