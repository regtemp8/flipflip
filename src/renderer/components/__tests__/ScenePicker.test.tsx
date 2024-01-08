import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ScenePicker from "../ScenePicker";
import TestProvider from "../../../../test/util/TestProvider";
import store from "../../../store/store";

jest.mock('../../animations/Jiggle', () => 'Jiggle');
jest.mock('../../animations/VSpin', () => 'VSpin');
jest.mock('../SceneSearch', () => 'SceneSearch');

// mocking this so that test doesn't throw error
jest.mock('react-sortablejs', () => 'Sortable');

// TODO create functional tests instead of snapshots
describe("ScenePicker", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <ScenePicker />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});