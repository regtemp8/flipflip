import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ColorSetPicker from "../../../../src/renderer/components/config/ColorSetPicker";
import TestProvider from "../../../util/TestProvider";

describe("ColorSetPicker", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <ColorSetPicker currentColors={['#fff', '#000']} onChangeColor={(e: any) => {}} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
