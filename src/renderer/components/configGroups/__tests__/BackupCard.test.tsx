import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import BackupCard from "../BackupCard";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

describe("BackupCard", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <BackupCard/>
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
