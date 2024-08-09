import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioTextEffects from "../AudioTextEffects";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

jest.mock('../../configGroups/AudioCard', () => 'AudioCard');
jest.mock('../../configGroups/TextCard', () => 'TextCard');

// TODO create functional tests instead of snapshots
describe("AudioTextEffects", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <AudioTextEffects sceneID={null} />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
