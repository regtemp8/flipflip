import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneEffects from "../SceneEffects";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

jest.mock('../../configGroups/CrossFadeCard', () => 'CrossFadeCard');
jest.mock('../../configGroups/SlideCard', () => 'SlideCard');
jest.mock('../../configGroups/StrobeCard', () => 'StrobeCard');
jest.mock('../../configGroups/ZoomMoveCard', () => 'ZoomMoveCard');
jest.mock('../../configGroups/FadeIOCard', () => 'FadeIOCard');
jest.mock('../../configGroups/PanningCard', () => 'PanningCard');

// TODO create functional tests instead of snapshots
describe("SceneEffects", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <SceneEffects />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
