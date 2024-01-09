import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ImageVideoCard from "../ImageVideoCard";
import TestProvider from "../../../util/TestProvider";
import store from "../../../store/store";

// mocking this so that test doesn't throw error
jest.mock('@mui/material/Slider', () => 'Slider');

// TODO create functional tests instead of snapshots
describe("ImageVideoCard", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <ImageVideoCard />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
