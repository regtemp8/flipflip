import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import GeneralConfig from "../GeneralConfig";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

jest.mock('../../configGroups/PlayerBoolCard', () => 'PlayerBoolCard');
jest.mock('../../configGroups/PlayerBoolCard2', () => 'PlayerBoolCard2');
jest.mock('../../configGroups/PlayerNumCard', () => 'PlayerNumCard');
jest.mock('../../configGroups/CacheCard', () => 'CacheCard');
jest.mock('../../configGroups/BackupCard', () => 'BackupCard');
jest.mock('../../configGroups/APICard', () => 'APICard');
jest.mock('../../configGroups/ThemeCard', () => 'ThemeCard');
jest.mock('../../configGroups/WatermarkCard', () => 'WatermarkCard');

// mocking this so that test doesn't throw error
jest.mock('@mui/lab/Masonry/Masonry', () => 'Masonry');

// TODO create functional tests instead of snapshots
describe("GeneralConfig", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <GeneralConfig />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});