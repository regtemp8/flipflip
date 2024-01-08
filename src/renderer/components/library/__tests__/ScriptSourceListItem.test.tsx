import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ScriptSourceListItem from "../ScriptSourceListItem";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";
import { setCaptionScript } from "../../../../store/captionScript/slice";
import { newCaptionScript } from "../../../../store/captionScript/CaptionScript";

jest.mock('../SourceIcon', () => 'SourceIcon');

describe("ScriptSourceListItem", () => {
  it("should match snapshot", () => {
    const scriptID = 3
    store.dispatch(setCaptionScript(newCaptionScript({id: scriptID, url: 'script.txt'})))
    const component = renderer.create(
      <TestProvider store={store}>
        <ScriptSourceListItem
          checked={false}
          index={0}
          isEditing={null}
          lastSelected={false}
          scriptID={scriptID}
          style={null}
          onDelete={(source) => {}}
          onEndEdit={(newURL) => {}}
          onPlay={(source) => {}}
          onRemove={(source) => {}}
          onSourceOptions={(source) => {}}
          onStartEdit={(id) => {}}
          onToggleSelect={() => {}}
          savePosition={() => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
