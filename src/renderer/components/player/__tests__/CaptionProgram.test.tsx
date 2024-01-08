import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import CaptionProgram from "../CaptionProgram";
import TestProvider from "../../../../../test/util/TestProvider";
import { RP } from "../../../data/const";
import store from "../../../../store/store";
import { setScene } from "../../../../store/scene/slice";
import { newScene } from "../../../../store/scene/Scene";
import { setCaptionScript } from "../../../../store/captionScript/slice";
import { newCaptionScript } from "../../../../store/captionScript/CaptionScript";

// TODO create functional tests instead of snapshots
describe("CaptionProgram", () => {
  it("should match snapshot", () => {
    const sceneID = 3
    const scriptID = 7
    store.dispatch(setScene(newScene({ id: sceneID })))
    store.dispatch(setCaptionScript(newCaptionScript({id: scriptID})))

    const image = window.document.createElement('img')
    image.setAttribute('source', 'image.png')

    const component = renderer.create(
      <TestProvider store={store}>
        <CaptionProgram
          sceneID={sceneID}
          captionScriptID={scriptID}
          currentAudio={0}
          currentImage={image}
          persist={false}
          repeat={RP.none}
          scale={1}
          singleTrack={false}
          timeToNextFrame={0}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
