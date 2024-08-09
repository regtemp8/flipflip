import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import CacheCard from "../CacheCard";
import TestProvider from "../../../util/TestProvider";
import store from "../../../store/store";

// TODO create functional tests instead of snapshots
describe("CacheCard", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <CacheCard />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
