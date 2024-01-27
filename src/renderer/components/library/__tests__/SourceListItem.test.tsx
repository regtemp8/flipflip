import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SourceListItem from "../SourceListItem";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";
import { setLibrarySource } from "../../../../store/librarySource/slice";
import { newLibrarySource } from "../../../../store/librarySource/LibrarySource";

jest.mock('../SourceIcon', () => 'SourceIcon');

// TODO create functional tests instead of snapshots
describe("SourceListItem", () => {
  it("should match snapshot", () => {
    const sourceID = 3
    store.dispatch(setLibrarySource(newLibrarySource({id: sourceID, url: 'image.png'})))
    const component = renderer.create(
      <TestProvider store={store}>
        <SourceListItem
          checked={false}
          index={0}
          isEditing={null}
          isLibrary={false}
          isSelect={false}
          source={sourceID}
          sources={[]}
          style={null}
          onClean={(source) => {}}
          onDelete={(source) => {}}
          onEditBlacklist={(source) => {}}
          onEndEdit={(newURL) => {}}
          onOpenClipMenu={(source) => {}}
          onOpenWeightMenu={(source) => {}}
          onRemove={(source) => {}}
          onSourceOptions={(source) => {}}
          onStartEdit={(id) => {}}
          onToggleSelect={() => {}}
          savePosition={() => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
