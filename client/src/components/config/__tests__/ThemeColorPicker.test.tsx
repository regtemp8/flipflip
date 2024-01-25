import React from 'react'
import { describe, it, expect } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import renderer from 'react-test-renderer'
import ThemeColorPicker from '../ThemeColorPicker'
import TestProvider from '../../../util/TestProvider'
import store from '../../../store/store'
import { setThemePalettePrimary } from '../../../store/app/slice'
import { selectAppThemePalettePrimary } from '../../../store/app/selectors'

describe('ThemeColorPicker', () => {
  it('should render without color when currentColor is null', () => {
    const action = setThemePalettePrimary

    store.dispatch(action({ main: null }))
    const component = renderer.create(
      <TestProvider store={store}>
        <ThemeColorPicker
          action={action}
          selector={selectAppThemePalettePrimary()}
        />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
  it('should render color when currentColor has value', () => {
    const action = setThemePalettePrimary

    store.dispatch(action({ main: '#f00' }))
    const component = renderer.create(
      <TestProvider store={store}>
        <ThemeColorPicker
          action={action}
          selector={selectAppThemePalettePrimary()}
        />
      </TestProvider>
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
  it('should change color and input when a color preset button is clicked', async () => {
    const action = setThemePalettePrimary

    store.dispatch(action({ main: '#f00' }))
    const mockFn = jest.fn(action)
    render(
      <TestProvider store={store}>
        <ThemeColorPicker
          action={mockFn}
          selector={selectAppThemePalettePrimary()}
        />
      </TestProvider>
    )

    const color = '#9c27b0'
    const button = await screen.findByRole('button', { value: { text: color } })
    fireEvent.click(button)

    expect(mockFn.mock.calls).toHaveLength(1)
    expect(mockFn.mock.calls[0][0].main).toBe(color)
  })
  it('should not allow input changes', async () => {
    const action = setThemePalettePrimary

    store.dispatch(action({ main: '#f00' }))
    render(
      <TestProvider store={store}>
        <ThemeColorPicker
          action={action}
          selector={selectAppThemePalettePrimary()}
        />
      </TestProvider>
    )

    const input = screen.getByRole('textbox')
    expect(input.hasAttribute('readonly')).toBe(true)
  })
  it('should not show color picker when color is clicked', async () => {
    const action = setThemePalettePrimary

    store.dispatch(action({ main: '#f00' }))
    render(
      <TestProvider store={store}>
        <ThemeColorPicker
          action={action}
          selector={selectAppThemePalettePrimary()}
        />
      </TestProvider>
    )

    const button = await screen
      .findAllByRole('button')
      .then((buttons) =>
        buttons.find(
          (b) => b.className.indexOf(' ThemeColorPicker-colorButton-') !== -1
        )
      )

    expect((button as HTMLButtonElement).onclick).toBe(null)
  })
})
