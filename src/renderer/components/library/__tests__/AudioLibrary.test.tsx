import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioLibrary from "../AudioLibrary";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";

jest.mock('../LibrarySearch', () => 'LibrarySearch');
jest.mock('../AudioSourceList', () => 'AudioSourceList');
jest.mock('../AudioArtistList', () => 'AudioArtistList');
jest.mock('../AudioAlbumList', () => 'AudioAlbumList');
jest.mock('../../configGroups/PlaylistSelect', () => 'PlaylistSelect');
jest.mock('../PlaylistList', () => 'PlaylistList');
jest.mock('../AudioEdit', () => 'AudioEdit');

// TODO create functional tests instead of snapshots
describe("AudioLibrary", () => {
  it("should match snapshot", () => {
    const component = renderer.create(
      <TestProvider store={store}>
        <AudioLibrary />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
