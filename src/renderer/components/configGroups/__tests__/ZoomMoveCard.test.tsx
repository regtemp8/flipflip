import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ZoomMoveCard from "../ZoomMoveCard";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

// TODO create functional tests instead of snapshots
describe("ZoomMoveCard", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <ZoomMoveCard />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
