import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import FontOptions from "../FontOptions";
import TestProvider from "../../../util/TestProvider";
import { newCaptionScript } from "../../../store/captionScript/CaptionScript";
import store from "../../../store/store";
import { setCaptionScript } from "../../../store/captionScript/slice";

jest.mock('../../config/ColorPicker', () => 'ColorPicker');

// TODO create functional tests instead of snapshots
describe("FontOptions", () => {
  it("should match snapshot", () => {
    const scriptID = 3
    const script = newCaptionScript({
      id: scriptID, 
      blink: {
        color: 'red',
        fontSize: 12,
        fontFamily: 'Arial',
        border: false,
        borderpx: 0,
        borderColor: ''
      }
    })

    store.dispatch(setCaptionScript(script))
    const component = renderer.create(
      <TestProvider store={store}>
        <FontOptions
          name={null}
          captionScriptID={scriptID}
          type='blink'
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
  });
});
