import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioOptions from "../AudioOptions";
import TestProvider from "../../../../../test/util/TestProvider";
import Audio from "../../../data/Audio";

jest.mock("../../player/AudioControl", () => "AudioControl");

// mocking this so that test doesn't throw error
jest.mock('@mui/material/Slider', () => 'Slider');

describe("AudioOptions", () => {
  it("should match snapshot", () => {
    const audio = new Audio({url: 'audio.mp3'})
    const component = renderer.create(
      <TestProvider>
        <AudioOptions
          audio={audio}
          onCancel={() => {}}
          onFinishEdit={(common) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
