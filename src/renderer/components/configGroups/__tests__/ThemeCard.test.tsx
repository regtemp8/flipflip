import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ThemeCard from "../ThemeCard";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

jest.mock('../../config/ThemeColorPicker', () => 'ThemeColorPicker');

// TODO create functional tests instead of snapshots
describe("ThemeCard", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <ThemeCard />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
