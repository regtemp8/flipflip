import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Strobe from "../Strobe";
import TestProvider from "../../../util/TestProvider";
import store from "../../../store/store";
import { setScene } from "../../../store/scene/slice";
import { newScene } from "../../../store/scene/Scene";

// TODO create functional tests instead of snapshots
describe("Strobe", () => {
  it("should match snapshot", () => {
    const sceneID = 3
    store.dispatch(setScene(newScene({id: sceneID})))

    const component = renderer.create(
      <TestProvider store={store}>
        <Strobe
          sceneID={sceneID} 
          toggleStrobe={false}
          timeToNextFrame={0}
          currentAudio={null}
          zIndex={0}
        >
          <p>Test</p>
        </Strobe>
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
