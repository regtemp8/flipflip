import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import PiwigoDialog from "../PiwigoDialog";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

describe("PiwigoDialog", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <PiwigoDialog
          open={false}
          onClose={() => {}}
          onImportURL={(type: string, e: MouseEvent, ...args: any[]) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
