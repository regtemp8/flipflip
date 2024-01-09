import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import PlayerBoolCard2 from "../PlayerBoolCard2";
import TestProvider from "../../../util/TestProvider";
import store from "../../../store/store";

describe("PlayerBoolCard2", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <PlayerBoolCard2 />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
