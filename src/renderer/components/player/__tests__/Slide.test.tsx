import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Slide from "../Slide";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";
import { setScene } from "../../../../store/scene/slice";
import { newScene } from "../../../../store/scene/Scene";

describe("Slide", () => {
  it("should match snapshot", () => {
    const sceneID = 3
    store.dispatch(setScene(newScene({id: sceneID})))

    const image = window.document.createElement('img')
    image.setAttribute('key', 'test')

    const component = renderer.create(
      <TestProvider store={store}>
        <Slide
          image={image}
          sceneID={sceneID}
          timeToNextFrame={0}
          currentAudio={null}
        >
          <p>Test</p>
        </Slide>
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
