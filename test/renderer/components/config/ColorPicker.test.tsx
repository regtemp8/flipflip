import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ColorPicker from "../../../../src/renderer/components/config/ColorPicker";
import TestProvider from "../../../util/TestProvider";

describe("ColorPicker", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <ColorPicker currentColor="#fff" onChangeColor={(e: any) => {}} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
