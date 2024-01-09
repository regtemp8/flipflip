import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import Tutorial from "../Tutorial";
import TestProvider from "../../util/TestProvider";
import store from "../../store/store";

describe("Tutorial", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <Tutorial />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
