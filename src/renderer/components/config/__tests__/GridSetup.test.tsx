import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import GridSetup from "../GridSetup";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";
import { setSceneGrid } from "../../../../store/sceneGrid/slice";
import { setScene } from "../../../../store/scene/slice";
import { newSceneGrid } from "../../../../store/sceneGrid/SceneGrid";
import { newSceneGridCell } from "../../../../storage/SceneGridCell";
import { newScene } from "../../../../store/scene/Scene";

jest.mock('../../configGroups/SceneSelect', () => 'SceneSelect');

// mocking this so that test doesn't throw error
jest.mock('@mui/material/MenuList', () => 'MenuList');

// TODO create functional tests instead of snapshots
describe("GridSetup", () => {
  it("should match snapshot", () => {
    const gridID = 3
    const sceneID = 5
    store.dispatch(setScene(newScene({id: sceneID})))
    store.dispatch(setSceneGrid(newSceneGrid({id: gridID, name: 'test', grid: [[newSceneGridCell({sceneID})]]})))

    const component = renderer.create(
      <TestProvider store={store}>
        <GridSetup gridID={gridID} />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});