import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ScriptSourceList from "../ScriptSourceList";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

jest.mock('../ScriptSourceListItem', () => 'ScriptSourceListItem');
jest.mock('../../configGroups/SceneSelect', () => 'SceneSelect');
jest.mock('../ScriptOptions', () => 'ScriptOptions');

// TODO create functional tests instead of snapshots
describe("ScriptSourceList", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <ScriptSourceList
          showHelp={false}
          sources={[]}
          tutorial={null}
          selected={[]}
          onUpdateSelected={(selected: number[]) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
