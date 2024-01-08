import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioSourceListItem from "../AudioSourceListItem";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";
import { setAudio } from "../../../../store/audio/slice";
import { newAudio } from "../../../../store/audio/Audio";

jest.mock('../SourceIcon', () => 'SourceIcon');

// TODO create functional tests instead of snapshots
describe("AudioSourceListItem", () => {
  it("should match snapshot", () => {
    const audioID = 3
    store.dispatch(setAudio(newAudio({id: audioID, url: 'audio.mp3'})))
    const component = renderer.create(
      <TestProvider store={store}>
        <AudioSourceListItem
          checked={false}
          index={0}
          isSelect={false}
          lastSelected={false}
          audioID={audioID}
          audios={[]}
          style={null}
          onClickAlbum={(album) => {}}
          onClickArtist={(artist) => {}}
          onDelete={(source) => {}}
          onEditSource={(source) => {}}
          onRemove={(source) => {}}
          onSourceOptions={(source) => {}}
          onToggleSelect={() => {}}
          savePosition={() => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});