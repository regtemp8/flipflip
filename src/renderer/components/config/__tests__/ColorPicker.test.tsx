import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import ColorPicker from "../ColorPicker";
import TestProvider from "../../../../../test/util/TestProvider";
import store from "../../../../store/store";
import { selectAppConfigGeneralSettingsWatermarkColor } from "../../../../store/app/selectors";
import { setConfigGeneralSettingsWatermarkColor } from "../../../../store/app/slice";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { hexToRgb } from "@mui/material";

describe("ColorPicker", () => {
  it("should render without color when currentColor is empty", () => {
    const action = setConfigGeneralSettingsWatermarkColor;
    
    store.dispatch(action(''));
    const component = renderer.create(
      <TestProvider store={store}>
        <ColorPicker action={action} selector={selectAppConfigGeneralSettingsWatermarkColor()} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render color when currentColor has value", () => {
    const action = setConfigGeneralSettingsWatermarkColor;
    
    store.dispatch(action('#f00'));
    const component = renderer.create(
      <TestProvider store={store}>
        <ColorPicker action={action} selector={selectAppConfigGeneralSettingsWatermarkColor()} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should change color when a color preset button is clicked", () => {
    const action = setConfigGeneralSettingsWatermarkColor;
    
    store.dispatch(action('#f00'));
    const mockFn = jest.fn(action);
    const {container} = render(
      <TestProvider store={store}>
        <ColorPicker action={mockFn} selector={selectAppConfigGeneralSettingsWatermarkColor()} />
      </TestProvider>
    );

    const color = '#2196f3'
    const button = container.querySelector('button[value="' + color + '"]') as HTMLButtonElement
    fireEvent.click(button)
    
    expect(mockFn.mock.calls).toHaveLength(1);
    expect(mockFn.mock.calls[0][0]).toBe(color);
  });
  it("should change color on text input", async () => {
    const action = setConfigGeneralSettingsWatermarkColor;
    
    store.dispatch(action('#f00'));
    const mockFn = jest.fn(action);
    render(
      <TestProvider store={store}>
        <ColorPicker action={mockFn} selector={selectAppConfigGeneralSettingsWatermarkColor()} />
      </TestProvider>
    );

    const value = '#NoColor'
    const input = screen.getByLabelText('Color');
    fireEvent.change(input, {target: {value}})
    
    expect(mockFn.mock.calls).toHaveLength(1);
    expect(mockFn.mock.calls[0][0]).toBe(value);
  });
  it("should show color picker when color is clicked", () => {
    const action = setConfigGeneralSettingsWatermarkColor;
    
    store.dispatch(action('#f00'));
    const {container} = render(
      <TestProvider store={store}>
        <ColorPicker action={action} selector={selectAppConfigGeneralSettingsWatermarkColor()} />
      </TestProvider>
    );

    expect(container.querySelector("#color-picker")).not.toBeVisible()

    const button = screen.getByLabelText("Pick Color")
    fireEvent.click(button)

    expect(container.querySelector("#color-picker")).toBeVisible()
  });
  it("should apply color picker change to color and input", () => {
    const action = setConfigGeneralSettingsWatermarkColor;
    
    store.dispatch(action('#f00'));
    render(
      <TestProvider store={store}>
        <ColorPicker action={action} selector={selectAppConfigGeneralSettingsWatermarkColor()} />
      </TestProvider>
    );

    fireEvent.click(screen.getByLabelText("Pick Color"))

    const color = "#4cb84b"
    const input = screen.getByLabelText("hex")
    fireEvent.change(input, {target: {value: color}})
    
    expect(screen.getByLabelText("Pick Color").style.backgroundColor).toBe(hexToRgb(color))
    expect(screen.getByLabelText("Color")).toHaveValue(color)
  });
  it("should hide color picker when color is clicked again", () => {
    const action = setConfigGeneralSettingsWatermarkColor;
    
    store.dispatch(action('#f00'));
    const mockFn = jest.fn(action);
    const {container} = render(
      <TestProvider store={store}>
        <ColorPicker action={mockFn} selector={selectAppConfigGeneralSettingsWatermarkColor()} />
      </TestProvider>
    );

    const button = screen.getByLabelText("Pick Color")
    fireEvent.click(button)
    expect(container.querySelector("#color-picker")).toBeVisible()

    const color = "#4cb84b"
    const input = screen.getByLabelText("hex")
    fireEvent.change(input, {target: {value: color}})
    fireEvent.click(button)

    expect(container.querySelector("#color-picker")).not.toBeVisible()
    expect(mockFn.mock.calls).toHaveLength(1);
    expect(mockFn.mock.calls[0][0]).toBe(color);
  });
});