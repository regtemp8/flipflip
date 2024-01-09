import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ScriptPlaylist from "../ScriptPlaylist";
import TestProvider from "../../../util/TestProvider";
import { RP } from "flipflip-common";
import { setScene, setSceneAddScriptPlaylist } from "../../../store/scene/slice";
import { setCaptionScript } from "../../../store/captionScript/slice";
import store from "../../../store/store";
import { newScene } from "../../../store/scene/Scene";

jest.mock('../../library/SourceIcon', () => 'SourceIcon');

// mocking this so that test doesn't throw error
jest.mock('react-sortablejs', () => 'Sortable');

describe("ScriptPlaylist", () => {
  it("should match snapshot", () => {
    const sceneID = 3
    const scriptID = 7
    store.dispatch(setScene(newScene({ id: sceneID })))
    store.dispatch(setCaptionScript({id: scriptID }))
    store.dispatch(setSceneAddScriptPlaylist({ id: sceneID, value: { scripts: [scriptID], shuffle: false, repeat: RP.none }}))
    const component = renderer.create(
      <TestProvider store={store}>
        <ScriptPlaylist
            sceneID={sceneID}
            playlistIndex={0}
            onSourceOptions={(scriptID) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});