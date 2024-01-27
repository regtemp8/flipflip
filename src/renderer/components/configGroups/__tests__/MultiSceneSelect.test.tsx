import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import MultiSceneSelect from "../MultiSceneSelect";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";
import { addScene } from "../../../../store/app/thunks";

// TODO create functional tests instead of snapshots
describe("MultiSceneSelect", () => {
  it("should match snapshot", () => {
    store.dispatch(addScene())
    const component = renderer.create(
      <TestProvider store={store}>
        <MultiSceneSelect
          values={[]}
          onChange={(sceneIDs) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
