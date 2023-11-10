import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import LibrarySearch from "../../../../src/renderer/components/library/LibrarySearch";
import TestProvider from "../../../util/TestProvider";

describe("LibrarySearch", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider>
        <LibrarySearch
          displaySources={[]}
          tags={[]}
          filters={[]}
          placeholder="Search..."
          onUpdateFilters={(filter) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
