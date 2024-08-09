import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import TextCard from "../TextCard";
import TestProvider from "../../../util/TestProvider";
import store from "../../../store/store";
import { setScene } from "../../../store/scene/slice";
import { newScene } from "../../../store/scene/Scene";

jest.mock('../ScriptPlaylist', () => 'ScriptPlaylist');
jest.mock('../../library/ScriptOptions', () => 'ScriptOptions');

describe("TextCard", () => {
  it("should match snapshot", () => {
    const sceneID = 3
    store.dispatch(setScene(newScene({ id: sceneID })))
    const component = renderer.create(
      <TestProvider store={store}>
        <TextCard sceneID={sceneID} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
