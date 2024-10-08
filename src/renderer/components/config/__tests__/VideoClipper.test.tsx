import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import VideoClipper from "../VideoClipper";
import TestProvider from "../../../../../test/util/TestProvider";
import LibrarySource from "../../../data/LibrarySource";

jest.mock('../../player/ImageView', () => 'ImageView');
jest.mock('../../player/VideoControl', () => 'VideoControl');

describe("VideoClipper", () => {
  it("should match snapshot", () => {
    const source = new LibrarySource({url: 'https://github.com'})
    const component = renderer.create(
      <TestProvider>
        <VideoClipper
          allTags={[]}
          isLibrary={false}
          source={source}
          tutorial={null}
          videoVolume={0}
          cache={(video) => {}}
          goBack={() => {}}
          navigateClipping={(offset) => {}}
          onTutorial={(tutorial) => {}}
          onStartVCTutorial={() => {}}
          onSetDisabledClips={(disabledClips) => {}}
          onUpdateClips={(url, clips) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
