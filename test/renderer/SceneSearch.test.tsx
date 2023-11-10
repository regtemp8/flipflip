import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SceneSearch from "../../src/renderer/SceneSearch";
import TestProvider from "../util/TestProvider";

describe("SceneSearch", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <SceneSearch
            displaySources={[]}
            filters={[]}
            placeholder='Search...'
            onUpdateFilters={(filter) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
