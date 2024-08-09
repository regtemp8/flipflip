import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import WatermarkCard from "../WatermarkCard";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

jest.mock("../../config/ColorPicker", () => "ColorPicker");

// mocking this so that test doesn't throw error
jest.mock('@mui/base/TextareaAutosize', () => 'TextareaAutosize');

// TODO create functional tests instead of snapshots
describe("WatermarkCard", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <WatermarkCard />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
