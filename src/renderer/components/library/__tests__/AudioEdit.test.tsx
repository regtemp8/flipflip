import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import AudioEdit from "../AudioEdit";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";
import { newAudio } from "../../../../storage/Audio";

// mocking this so that test doesn't throw error
jest.mock('@mui/base/TextareaAutosize', () => 'TextareaAutosize');

describe("AudioEdit", () => {
  it("should match snapshot", () => {
    const audio = newAudio()
    const component = renderer.create(
      <TestProvider store={store}>
        <AudioEdit
          audio={audio}
          cachePath=""
          title=""
          onCancel={() => {}}
          onFinishEdit={(common) => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
