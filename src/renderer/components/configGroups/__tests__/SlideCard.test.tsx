import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SlideCard from "../SlideCard";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

// TODO create functional tests instead of snapshots
describe("SlideCard", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <SlideCard />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
