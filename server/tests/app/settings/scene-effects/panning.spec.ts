import { test, expect } from '@playwright/test'
import { changeSlider, testSliderValue } from '../../utils'

test.use({ storageState: 'server/tests/data/session.json' })
test.beforeEach(async ({ page }) => {
  await page.goto('/settings/scene-effects')
})

test('Panning effect', async ({ page }) => {
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await expect(page.getByText('None').nth(2)).not.toBeVisible()
  await expect(page.getByText('None').nth(3)).not.toBeVisible()
  await expect(page.getByRole('combobox').nth(4)).not.toBeVisible()
  await expect(
    page.getByRole('spinbutton', { name: 'For', exact: true })
  ).not.toBeVisible()

  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()

  await expect(page.getByText('None').nth(2)).toBeVisible()
  await expect(page.getByText('None').nth(3)).toBeVisible()
  await expect(page.getByRole('combobox').nth(4)).toBeVisible()
  await expect(
    page.getByRole('spinbutton', { name: 'For', exact: true })
  ).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await expect(page.getByText('None').nth(2)).not.toBeVisible()
  await expect(page.getByText('None').nth(3)).not.toBeVisible()
  await expect(page.getByRole('combobox').nth(4)).not.toBeVisible()
  await expect(page.getByRole('spinbutton', { name: 'For' })).not.toBeVisible()
  await responsePromise
})

test('Random panning timing', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")'
  )

  await page.getByRole('combobox').nth(4).click()
  await page.getByRole('option', { name: 'Random', exact: true }).click()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'Between' })
  ).toBeVisible()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'Between' })
  ).toHaveAttribute('type', 'number')
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'Between' })
  ).toHaveAttribute('min', '0')
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'Between' })
  ).toHaveAttribute('step', '100')
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'and' })
  ).toBeVisible()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'and' })
  ).toHaveAttribute('type', 'number')
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'and' })
  ).toHaveAttribute('min', '0')
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'and' })
  ).toHaveAttribute('step', '100')

  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'For' })
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTypography-caption')
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Wave panning timing', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")'
  )

  await page.getByRole('combobox').nth(4).click()
  await page.getByRole('option', { name: 'Wave', exact: true }).click()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'For' })
  ).not.toBeVisible()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'Between' })
  ).toBeVisible()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'Between' })
  ).toHaveAttribute('type', 'number')
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'Between' })
  ).toHaveAttribute('min', '0')
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'Between' })
  ).toHaveAttribute('step', '100')
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'and' })
  ).toBeVisible()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'and' })
  ).toHaveAttribute('type', 'number')
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'and' })
  ).toHaveAttribute('min', '0')
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'and' })
  ).toHaveAttribute('step', '100')
  await expect(
    container.locator('.MuiCollapse-entered .MuiTypography-caption')
  ).toHaveText('Wave Rate')

  const input = await container.locator(
    '.MuiCollapse-entered .MuiTextField-root input[aria-labelledby="pan-sin-rate-slider"]'
  )
  await expect(input).toBeVisible()
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '0')
  await expect(input).toHaveAttribute('max', '100')
  await expect(input).toHaveAttribute('step', '5')
  await expect(input).toHaveValue('100')

  const slider = container.locator('.MuiCollapse-entered .MuiSlider-root')
  await expect(slider).toBeVisible()
  const thumb = slider.locator('.MuiSlider-thumb')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100')

  await changeSlider(page, thumb, slider, 0)
  await expect(input).toHaveValue('1')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1')

  await changeSlider(page, thumb, slider, 0.01)
  await expect(input).toHaveValue('2')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('2')

  await changeSlider(page, thumb, slider, 0.99)
  await expect(input).toHaveValue('99')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99')

  await changeSlider(page, thumb, slider, 1)
  await expect(input).toHaveValue('100')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100')

  await input.fill('0')
  await expect(input).toHaveValue('0')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1')
  expect(await testSliderValue(thumb, slider, 0)).toBe(true)

  await input.fill('5')
  await expect(input).toHaveValue('5')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5')
  expect(await testSliderValue(thumb, slider, 0.04)).toBe(true) // slider starts at 1

  await input.fill('95')
  await expect(input).toHaveValue('95')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('95')
  expect(await testSliderValue(thumb, slider, 0.95)).toBe(true)

  await input.fill('100')
  await expect(input).toHaveValue('100')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100')
  expect(await testSliderValue(thumb, slider, 1)).toBe(true)

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Audio BPM panning timing', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")'
  )

  await page.getByRole('combobox').nth(4).click()
  await page.getByRole('option', { name: 'Audio BPM', exact: true }).click()

  await page.getByTestId('ErrorOutlineIcon').first().hover()
  await expect(page.getByRole('tooltip', { exact: true })).toHaveText(
    'Missing audio with BPM'
  )

  const slider = container.locator('.MuiCollapse-entered .MuiSlider-root')
  await expect(slider).toBeVisible()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'For' })
  ).not.toBeVisible()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'Between' })
  ).not.toBeVisible()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'and' })
  ).not.toBeVisible()

  const thumb = slider.locator('.MuiSlider-thumb')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1x')
  await expect(
    container.locator('.MuiCollapse-entered .MuiTypography-caption')
  ).toHaveText('BPM Multiplier 1x')

  await changeSlider(page, thumb, slider, 0)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')
  await expect(
    container.locator('.MuiCollapse-entered .MuiTypography-caption')
  ).toHaveText('BPM Multiplier 0.1x')

  await changeSlider(page, thumb, slider, 0.01)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')
  await expect(
    container.locator('.MuiCollapse-entered .MuiTypography-caption')
  ).toHaveText('BPM Multiplier 0.2x')

  await changeSlider(page, thumb, slider, 0.99)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('9.9x')
  await expect(
    container.locator('.MuiCollapse-entered .MuiTypography-caption')
  ).toHaveText('BPM Multiplier 9.9x')

  await changeSlider(page, thumb, slider, 1)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('10x')
  await expect(
    container.locator('.MuiCollapse-entered .MuiTypography-caption')
  ).toHaveText('BPM Multiplier 10x')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('With scene panning timing', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")'
  )

  await page.getByRole('combobox').nth(4).click()
  await page.getByRole('option', { name: 'With Scene', exact: true }).click()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'For' })
  ).not.toBeVisible()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'Between' })
  ).not.toBeVisible()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'and' })
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTypography-root')
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Constant panning timing', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")'
  )

  await page.getByRole('combobox').nth(4).click()
  await page.getByRole('option', { name: 'Constant', exact: true }).click()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'For' })
  ).toBeVisible()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'For' })
  ).toHaveAttribute('type', 'number')
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'For' })
  ).toHaveAttribute('min', '0')
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'For' })
  ).toHaveAttribute('step', '100')

  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'Between' })
  ).not.toBeVisible()
  await expect(
    container
      .locator('.MuiCollapse-entered')
      .getByRole('spinbutton', { name: 'and' })
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTypography-caption')
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Panning move horizontally setting', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = await page
    .locator(
      '.MuiGrid2-root > .MuiGrid2-container:has-text("Move Horizontally")'
    )
    .nth(1)
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Width', exact: true })
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).not.toBeVisible()

  await container.locator('.MuiInputBase-root:has-text("None")').first().click()
  await page
    .getByRole('option', { name: 'Left then Right', exact: true })
    .click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Width', exact: true })
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).toBeVisible()

  await container
    .locator('.MuiInputBase-root:has-text("Left then Right")')
    .first()
    .click()
  await page
    .getByRole('option', { name: 'Right then Left', exact: true })
    .click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Width', exact: true })
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).toBeVisible()

  await container
    .locator('.MuiInputBase-root:has-text("Right then Left")')
    .first()
    .click()
  await page.getByRole('option', { name: 'Random', exact: true }).click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Width', exact: true })
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).toBeVisible()

  await container
    .locator('.MuiInputBase-root:has-text("Random")')
    .first()
    .click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Width', exact: true })
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Panning move horizontally use img width setting', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = await page
    .locator(
      '.MuiGrid2-root > .MuiGrid2-container:has-text("Move Horizontally")'
    )
    .nth(1)
  await container.getByRole('combobox').first().click()
  await page
    .getByRole('option', { name: 'Left then Right', exact: true })
    .click()

  await expect(
    container.getByRole('checkbox', { name: 'Use Img Width', exact: true })
  ).toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Width', exact: true })
  ).not.toBeChecked()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    await container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).toBeVisible()
  await expect(
    await container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).toBeVisible()

  await container
    .getByRole('checkbox', { name: 'Use Img Width', exact: true })
    .check()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Width', exact: true })
  ).toBeChecked()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeVisible()
  await expect(
    await container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).not.toBeVisible()
  await expect(
    await container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).not.toBeVisible()

  await container
    .getByRole('checkbox', { name: 'Use Img Width', exact: true })
    .uncheck()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Width', exact: true })
  ).not.toBeChecked()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    await container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).toBeVisible()
  await expect(
    await container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).toBeVisible()

  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Randomize panning move horizontally setting', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = await page
    .locator(
      '.MuiGrid2-root > .MuiGrid2-container:has-text("Move Horizontally")'
    )
    .nth(1)
  await container.getByRole('combobox').first().click()
  await page
    .getByRole('option', { name: 'Left then Right', exact: true })
    .click()

  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeChecked()

  await container
    .getByRole('checkbox', { name: 'Randomize', exact: true })
    .check()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeChecked()
  await expect(container.getByText(/^Min:/).first()).toBeVisible()
  await expect(container.getByText(/^Max:/).first()).toBeVisible()

  await container
    .getByRole('checkbox', { name: 'Randomize', exact: true })
    .uncheck()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeChecked()
  await expect(container.getByText(/^Min:/).first()).not.toBeVisible()
  await expect(container.getByText(/^Max:/).first()).not.toBeVisible()

  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Panning move horizontally slider', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = await page
    .locator(
      '.MuiGrid2-root > .MuiGrid2-container:has-text("Move Horizontally")'
    )
    .nth(1)
  await container.getByRole('combobox').first().click()
  await page
    .getByRole('option', { name: 'Left then Right', exact: true })
    .click()

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

  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Panning move horizontally min slider', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = await page
    .locator(
      '.MuiGrid2-root > .MuiGrid2-container:has-text("Move Horizontally")'
    )
    .nth(1)
  await container.getByRole('combobox').first().click()
  await page
    .getByRole('option', { name: 'Left then Right', exact: true })
    .click()
  await container
    .getByRole('checkbox', { name: 'Randomize', exact: true })
    .check()
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

  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Panning move horizontally max slider', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = await page
    .locator(
      '.MuiGrid2-root > .MuiGrid2-container:has-text("Move Horizontally")'
    )
    .nth(1)
  await container.getByRole('combobox').first().click()
  await page
    .getByRole('option', { name: 'Left then Right', exact: true })
    .click()
  await container
    .getByRole('checkbox', { name: 'Randomize', exact: true })
    .check()
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

  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Panning move vertically setting', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = await page
    .locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")')
    .nth(1)
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Height', exact: true })
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).not.toBeVisible()

  await container.locator('.MuiInputBase-root:has-text("None")').first().click()
  await page.getByRole('option', { name: 'Up then Down', exact: true }).click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Height', exact: true })
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).toBeVisible()

  await container
    .locator('.MuiInputBase-root:has-text("Up then Down")')
    .first()
    .click()
  await page.getByRole('option', { name: 'Down then Up', exact: true }).click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Height', exact: true })
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).toBeVisible()

  await container
    .locator('.MuiInputBase-root:has-text("Down then Up")')
    .first()
    .click()
  await page.getByRole('option', { name: 'Random', exact: true }).click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Height', exact: true })
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).toBeVisible()

  await container
    .locator('.MuiInputBase-root:has-text("Random")')
    .first()
    .click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Height', exact: true })
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).not.toBeVisible()
  await expect(
    container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Panning move vertically use img height setting', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = await page
    .locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")')
    .nth(1)
  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Up then Down', exact: true }).click()

  await expect(
    container.getByRole('checkbox', { name: 'Use Img Height', exact: true })
  ).toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Height', exact: true })
  ).not.toBeChecked()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    await container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).toBeVisible()
  await expect(
    await container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).toBeVisible()

  await container
    .getByRole('checkbox', { name: 'Use Img Height', exact: true })
    .check()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Height', exact: true })
  ).toBeChecked()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeVisible()
  await expect(
    await container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).not.toBeVisible()
  await expect(
    await container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).not.toBeVisible()

  await container
    .getByRole('checkbox', { name: 'Use Img Height', exact: true })
    .uncheck()
  await expect(
    container.getByRole('checkbox', { name: 'Use Img Height', exact: true })
  ).not.toBeChecked()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    await container.locator('.MuiCollapse-entered .MuiSlider-root')
  ).toBeVisible()
  await expect(
    await container.locator('.MuiCollapse-entered .MuiTextField-root input')
  ).toBeVisible()

  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Randomize panning move vertically setting', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = await page
    .locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")')
    .nth(1)
  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Up then Down', exact: true }).click()

  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeVisible()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeChecked()

  await container
    .getByRole('checkbox', { name: 'Randomize', exact: true })
    .check()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).toBeChecked()
  await expect(container.getByText(/^Min:/).first()).toBeVisible()
  await expect(container.getByText(/^Max:/).first()).toBeVisible()

  await container
    .getByRole('checkbox', { name: 'Randomize', exact: true })
    .uncheck()
  await expect(
    container.getByRole('checkbox', { name: 'Randomize', exact: true })
  ).not.toBeChecked()
  await expect(container.getByText(/^Min:/).first()).not.toBeVisible()
  await expect(container.getByText(/^Max:/).first()).not.toBeVisible()

  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Panning move vertically slider', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = await page
    .locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")')
    .nth(1)
  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Up then Down', exact: true }).click()

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

  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Panning move vertically min slider', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = await page
    .locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")')
    .nth(1)
  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Up then Down', exact: true }).click()
  await container
    .getByRole('checkbox', { name: 'Randomize', exact: true })
    .check()
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

  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Panning move vertically max slider', async ({ page }) => {
  await page.getByLabel('Panning', { exact: true }).check()
  await expect(page.getByLabel('Panning', { exact: true })).toBeChecked()
  const container = await page
    .locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")')
    .nth(1)
  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Up then Down', exact: true }).click()
  await container
    .getByRole('checkbox', { name: 'Randomize', exact: true })
    .check()
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

  await container.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.panning === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Panning', { exact: true }).uncheck()
  await expect(page.getByLabel('Panning', { exact: true })).not.toBeChecked()
  await responsePromise
})
