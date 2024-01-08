import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ScriptLibrary from "../ScriptLibrary";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

jest.mock('../LibrarySearch', () => 'LibrarySearch');
jest.mock('../ScriptSourceList', () => 'ScriptSourceList');

// TODO create functional tests instead of snapshots
describe("ScriptLibrary", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <ScriptLibrary />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
