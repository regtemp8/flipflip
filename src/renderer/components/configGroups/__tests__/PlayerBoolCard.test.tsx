import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import PlayerBoolCard from "../PlayerBoolCard";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

describe("PlayerBoolCard", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <PlayerBoolCard />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
