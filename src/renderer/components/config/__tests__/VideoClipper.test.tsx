import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import VideoClipper from "../VideoClipper";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";
import { setLibrarySource } from "../../../../store/librarySource/slice";
import { newLibrarySource } from "../../../../store/librarySource/LibrarySource";
import { setVideoClipperSourceID } from "../../../../store/videoClipper/slice";

jest.mock('../../player/ImageView', () => 'ImageView');
jest.mock('../../player/VideoControl', () => 'VideoControl');

describe("VideoClipper", () => {
  it("should match snapshot", () => {
    const sourceID = 3
    store.dispatch(setLibrarySource(newLibrarySource({id: sourceID, url: 'https://github.com'})))
    store.dispatch(setVideoClipperSourceID(sourceID))
    
    const component = renderer.create(
      <TestProvider store={store}>
        <VideoClipper />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});