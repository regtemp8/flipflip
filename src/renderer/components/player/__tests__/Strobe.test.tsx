import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Strobe from "../Strobe";
import TestProvider from "../../../../../test/util/TestProvider";
import Scene from "../../../data/Scene";

describe("Strobe", () => {
  it("should match snapshot", () => {
    const scene = new Scene();
    const component = renderer.create(
      <TestProvider>
        <Strobe
          toggleStrobe={false}
          scene={scene}
          timeToNextFrame={0}
          currentAudio={null}
          zIndex={0}
        >
          <p>Test</p>
        </Strobe>
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
