import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import APICard from "../APICard";
import TestProvider from "../../../util/TestProvider";
import store from "../../../store/store";

jest.mock("../../library/SourceIcon", () => "SourceIcon");

describe("APICard", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <APICard />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
