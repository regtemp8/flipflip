import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import BatchClipDialog from "../BatchClipDialog";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

describe("BatchClipDialog", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <BatchClipDialog
            open={false}
            selected={[]}
            onCloseDialog={()=>{}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
