import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import CaptionProgramPlaylist from "../CaptionProgramPlaylist";
import TestProvider from "../../../../../test/util/TestProvider";
import { RP } from "../../../data/const";
import store from "../../../../store/store";
import { setScene } from "../../../../store/scene/slice";
import { newScene } from "../../../../store/scene/Scene";

jest.mock('../CaptionProgram', () => 'CaptionProgram');

describe("CaptionProgramPlaylist", () => {
  it("should match snapshot", () => {
    const sceneID = 3
    store.dispatch(setScene(newScene({id: sceneID})))

    const component = renderer.create(
      <TestProvider store={store}>
        <CaptionProgramPlaylist
          playlistIndex={0}
          playlist={{ scripts: [], shuffle: false, repeat: RP.none }}
          currentAudio={null}
          currentImage={null}
          scale={1}
          sceneID={sceneID}
          timeToNextFrame={0}
          orderScriptTags={(script) => {}}
          persist={false}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
