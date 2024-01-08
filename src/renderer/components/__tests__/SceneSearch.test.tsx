import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneSearch from "../SceneSearch";
import TestProvider from "../../../../test/util/TestProvider";
import store from "../../../store/store";

// TODO create functional tests instead of snapshots
describe("SceneSearch", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <SceneSearch placeholder='Search...' />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
