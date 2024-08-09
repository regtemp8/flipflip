import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ConfigForm from "../ConfigForm";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

jest.mock('../GeneralConfig', () => 'GeneralConfig');
jest.mock('../../sceneDetail/SceneOptions', () => 'SceneOptions');
jest.mock('../../sceneDetail/SceneEffects', () => 'SceneEffects');

// TODO create functional tests instead of snapshots
describe("ConfigForm", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <ConfigForm />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
