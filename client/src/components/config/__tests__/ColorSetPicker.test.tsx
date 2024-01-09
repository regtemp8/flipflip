import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ColorSetPicker from "../ColorSetPicker";
import TestProvider from "../../../util/TestProvider";
import store from "../../../store/store";
import { setSceneBackgroundColorSet } from "../../../store/scene/actions";
import { selectSceneBackgroundColorSet } from "../../../store/scene/selectors";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { hexToRgb } from "@mui/material";

describe("ColorSetPicker", () => {
  it("should render without color when currentColor is empty", () => {
    const action = setSceneBackgroundColorSet();

    store.dispatch(action([]))
    const component = renderer.create(
      <TestProvider store={store}>
        <ColorSetPicker action={action} selector={selectSceneBackgroundColorSet()} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render colors when currentColor has values", () => {
    const action = setSceneBackgroundColorSet();

    store.dispatch(action(['#f00', '#0000ff']))
    const component = renderer.create(
      <TestProvider store={store}>
        <ColorSetPicker action={action} selector={selectSceneBackgroundColorSet()} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should show color picker when add button is clicked", () => {
    const action = setSceneBackgroundColorSet();

    store.dispatch(action([]))
    const {container} = render(
      <TestProvider store={store}>
        <ColorSetPicker action={action} selector={selectSceneBackgroundColorSet()} />
      </TestProvider>
    );

    expect(container.querySelector("#color-picker")).not.toBeVisible()
    fireEvent.click(screen.getByLabelText('Add Color'))
    expect(container.querySelector("#color-picker")).toBeVisible()
  });
  it("should change color of add button when picker color is changed", () => {
    const action = setSceneBackgroundColorSet();

    store.dispatch(action([]))
    const {container} = render(
      <TestProvider store={store}>
        <ColorSetPicker action={action} selector={selectSceneBackgroundColorSet()} /> 
      </TestProvider>
    );

    const color = '#d2eed3'
    fireEvent.click(screen.getByLabelText('Add Color'))
    expect(container.querySelector("#color-picker")).toBeVisible()
    fireEvent.change(screen.getByLabelText('hex'), {target: {value: color}})
    expect(screen.getByLabelText('Add Color').style.backgroundColor).toBe(hexToRgb(color))
  });
  it("should show color picker when color bubble is clicked", () => {
    const action = setSceneBackgroundColorSet();

    store.dispatch(action(['#0000ff']))
    const {container} = render(
      <TestProvider store={store}>
        <ColorSetPicker action={action} selector={selectSceneBackgroundColorSet()} /> 
      </TestProvider>
    );

    expect(container.querySelector("#color-picker")).not.toBeVisible()
    fireEvent.click(container.querySelector("#color-0"))
    expect(container.querySelector("#color-picker")).toBeVisible()
  });
});