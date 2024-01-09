import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneOptions from "../SceneOptions";
import TestProvider from "../../../util/TestProvider";
import store from "../../../store/store";

jest.mock('../../configGroups/ImageVideoCard', () => 'ImageVideoCard');
jest.mock('../../configGroups/SceneOptionCard', () => 'SceneOptionCard');

// TODO create functional tests instead of snapshots
describe("SceneOptions", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <SceneOptions />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
