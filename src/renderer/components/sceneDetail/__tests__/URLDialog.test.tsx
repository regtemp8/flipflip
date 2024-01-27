import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import URLDialog from "../URLDialog";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

describe("URLDialog", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <URLDialog
          open={false}
          onClose={() => {}}
          onImportURL={(type, e, args) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
