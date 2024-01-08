import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneGenerator from "../SceneGenerator";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";
import { setScene } from "../../../../store/scene/slice";
import { newScene } from "../../../../storage/Scene";

jest.mock('../../library/LibrarySearch', () => 'LibrarySearch');

// mocking this so that test doesn't throw error
jest.mock('@mui/material/MenuList', () => 'MenuList');

describe("SceneGenerator", () => {
  it("should match snapshot", () => {
    const sceneID = 3
    store.dispatch(setScene(newScene({id: sceneID, generatorWeights: []})))

    const component = renderer.create(
      <TestProvider store={store}>
        <SceneGenerator sceneID={sceneID} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
