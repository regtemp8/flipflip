import { test, expect } from '@playwright/test'
import { VTF } from 'flipflip-common'
import { changeSlider, testSliderValue } from '../../utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/settings/scene-effects')
})

test('Move vertically setting', async ({ page }) => {
  const container = page.locator(
    '.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")'
  )
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).not.toBeVisible()

  await container.locator('.MuiInputBase-root:has-text("None")').first().click()
  await page.getByRole('option', { name: 'Up', exact: true }).click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).toBeVisible()

  await container.locator('.MuiInputBase-root:has-text("Up")').first().click()
  await page.getByRole('option', { name: 'Down', exact: true }).click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).toBeVisible()

  await container.locator('.MuiInputBase-root:has-text("Down")').first().click()
  await page.getByRole('option', { name: 'Up/Down', exact: true }).click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.vertTransType === VTF.none &&
      res.status() === 204
    )
  })
  await container
    .locator('.MuiInputBase-root:has-text("Up/Down")')
    .first()
    .click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).not.toBeVisible()
  await responsePromise
})

test('Randomize move vertically setting', async ({ page }) => {
  const container = page.locator(
    '.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")'
  )
  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Up', exact: true }).click()

  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeChecked()

  await container
    .getByRole('checkbox', { name: 'Randomize', exact: true })
    .click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeChecked()
  await expect(container.getByText(/^Min:/).first()).toBeVisible()
  await expect(container.getByText(/^Max:/).first()).toBeVisible()

  await container
    .getByRole('checkbox', { name: 'Randomize', exact: true })
    .click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeChecked()
  await expect(container.getByText(/^Min:/).first()).not.toBeVisible()
  await expect(container.getByText(/^Max:/).first()).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.vertTransType === VTF.none &&
      res.status() === 204
    )
  })
  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  await responsePromise
})

test('Move vertically slider', async ({ page }) => {
  const container = page.locator(
    '.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")'
  )
  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Up', exact: true }).click()

  const slider = await container.locator('.MuiCollapse-entered .MuiSlider-root')
  await expect(slider).toBeVisible()

  const thumb = slider.locator('.MuiSlider-thumb')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('10%')

  const input = await container.locator(
    '.MuiCollapse-entered .MuiTextField-root input'
  )
  await expect(input).toBeVisible()
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '0')
  await expect(input).toHaveAttribute('max', '100')
  await expect(input).toHaveValue('10')

  await changeSlider(page, thumb, slider, 0)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0%')
  await expect(input).toHaveValue('0')

  await changeSlider(page, thumb, slider, 0.01)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1%')
  await expect(input).toHaveValue('1')

  await changeSlider(page, thumb, slider, 1)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')
  await expect(input).toHaveValue('100')

  await changeSlider(page, thumb, slider, 0.99)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99%')
  await expect(input).toHaveValue('99')

  await input.fill('0')
  await expect(input).toHaveValue('0')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0%')
  expect(await testSliderValue(thumb, slider, 0)).toBe(true)

  await input.fill('5')
  await expect(input).toHaveValue('5')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5%')
  expect(await testSliderValue(thumb, slider, 0.05)).toBe(true)

  await input.fill('95')
  await expect(input).toHaveValue('95')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('95%')
  expect(await testSliderValue(thumb, slider, 0.95)).toBe(true)

  await input.fill('100')
  await expect(input).toHaveValue('100')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')
  expect(await testSliderValue(thumb, slider, 1)).toBe(true)

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.vertTransType === VTF.none &&
      res.status() === 204
    )
  })
  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  await responsePromise
})

test('Move vertically min slider', async ({ page }) => {
  const container = page.locator(
    '.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")'
  )
  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Up', exact: true }).click()
  await container
    .getByRole('checkbox', { name: 'Randomize', exact: true })
    .click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeChecked()

  const slider = await container.locator(
    '.MuiCollapse-entered div:nth-child(1) > .MuiSlider-root'
  )
  await expect(slider).toBeVisible()

  const thumb = slider.locator('.MuiSlider-thumb')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5%')

  await changeSlider(page, thumb, slider, 0)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0%')

  await changeSlider(page, thumb, slider, 0.01)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1%')

  await changeSlider(page, thumb, slider, 1)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')

  await changeSlider(page, thumb, slider, 0.99)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99%')

  await container
    .getByRole('checkbox', { name: 'Randomize', exact: true })
    .click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeChecked()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.vertTransType === VTF.none &&
      res.status() === 204
    )
  })
  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  await responsePromise
})

test('Move vertically max slider', async ({ page }) => {
  const container = page.locator(
    '.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")'
  )
  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Up', exact: true }).click()
  await container
    .getByRole('checkbox', { name: 'Randomize', exact: true })
    .click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeChecked()

  const slider = await container.locator(
    '.MuiCollapse-entered div:nth-child(2) > .MuiSlider-root'
  )
  await expect(slider).toBeVisible()

  const thumb = slider.locator('.MuiSlider-thumb')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('10%')

  await changeSlider(page, thumb, slider, 0)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0%')

  await changeSlider(page, thumb, slider, 0.01)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1%')

  await changeSlider(page, thumb, slider, 1)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')

  await changeSlider(page, thumb, slider, 0.99)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99%')

  await container
    .getByRole('checkbox', { name: 'Randomize', exact: true })
    .click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeChecked()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.vertTransType === VTF.none &&
      res.status() === 204
    )
  })
  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  await responsePromise
})
