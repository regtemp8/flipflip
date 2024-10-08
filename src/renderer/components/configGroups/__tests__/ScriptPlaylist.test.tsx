import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ScriptPlaylist from "../ScriptPlaylist";
import TestProvider from "../../../../../test/util/TestProvider";
import { RP } from "../../../data/const";
import Scene from "../../../data/Scene";
import CaptionScript from "../../../data/CaptionScript";

jest.mock('../../library/SourceIcon', () => 'SourceIcon');

// mocking this so that test doesn't throw error
jest.mock('react-sortablejs', () => 'Sortable');

describe("ScriptPlaylist", () => {
  it("should match snapshot", () => {
    const scene = new Scene();
    const script = new CaptionScript();
    const component = renderer.create(
      <TestProvider>
        <ScriptPlaylist
            playlistIndex={0}
            playlist={{ scripts: [script], shuffle: false, repeat: RP.none }}
            scene={scene}
            onAddScript={(playlistIndex) => {}}
            onPlay={(source, sceneID, displaySources) => {}}
            onSourceOptions={(script) => {}}
            onUpdateScene={(scene, fn) => {}}
            systemMessage={(message) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
