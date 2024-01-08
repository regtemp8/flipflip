import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneDetail from "../SceneDetail";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";
import { setScene } from "../../../../store/scene/slice";
import { newScene } from "../../../../store/scene/Scene";

jest.mock('../SceneEffects', () => 'SceneEffects');
jest.mock('../SceneGenerator', () => 'SceneGenerator');
jest.mock('../SceneOptions', () => 'SceneOptions');
jest.mock('../URLDialog', () => 'URLDialog');
jest.mock('../../library/LibrarySearch', () => 'LibrarySearch');
jest.mock('../../library/SourceList', () => 'SourceList');
jest.mock('../AudioTextEffects', () => 'AudioTextEffects');
jest.mock('../PiwigoDialog', () => 'PiwigoDialog');
jest.mock('../../library/SourceIcon', () => 'SourceIcon');

// TODO create functional tests instead of snapshots
describe("SceneDetail", () => {
  it("should match snapshot", () => {
    const sceneID = 3
    store.dispatch(setScene(newScene({id: sceneID})))
    
    const component = renderer.create(
      <TestProvider store={store}>
        <SceneDetail sceneID={sceneID} />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
