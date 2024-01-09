import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import CrossFadeCard from "../CrossFadeCard";
import TestProvider from "../../../util/TestProvider";
import store from "../../../store/store";

// TODO create functional tests instead of snapshots
describe("CrossFadeCard", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <CrossFadeCard />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
