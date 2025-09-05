import { test, expect } from '@playwright/test'
import { changeSlider, testSliderValue } from '../../utils'

const CARD_SELECTOR = '.MuiGrid2-container .MuiGrid2-root:has-text("Slide")'

test.beforeEach(async ({ page }) => {
  await page.goto('/settings/scene-effects')
})

test('Slide effect', async ({ page }) => {
  await expect(page.getByLabel('Slide', { exact: true })).not.toBeChecked()
  await expect(page.getByLabel('Direction', { exact: true })).not.toBeVisible()
  await expect(page.getByText('Distance: 100%100%')).not.toBeVisible()
  await expect(page.getByText('TimingConstant').nth(1)).not.toBeVisible()
  await expect(
    page.getByRole('spinbutton', { name: 'For', exact: true })
  ).not.toBeVisible()

  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).toBeChecked()
  await expect(page.getByLabel('Direction', { exact: true })).toBeVisible()
  await expect(page.getByText('Distance: 100%100%')).toBeVisible()
  await expect(page.getByText('TimingConstant').nth(1)).toBeVisible()
  await expect(
    page.getByRole('spinbutton', { name: 'For', exact: true })
  ).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.slide === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).not.toBeChecked()
  await expect(page.getByLabel('Direction', { exact: true })).not.toBeVisible()
  await expect(page.getByText('Distance: 100%100%')).not.toBeVisible()
  await expect(page.getByText('TimingConstant').nth(1)).not.toBeVisible()
  await expect(
    page.getByRole('spinbutton', { name: 'For', exact: true })
  ).not.toBeVisible()
  await responsePromise
})

test('Random slide timing', async ({ page }) => {
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")'
  )

  await page
    .locator(CARD_SELECTOR)
    .getByLabel('Timing', { exact: true })
    .click()
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
      request.postDataJSON()?.slide === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Wave slide timing', async ({ page }) => {
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")'
  )

  await page
    .locator(CARD_SELECTOR)
    .getByLabel('Timing', { exact: true })
    .click()
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
    '.MuiCollapse-entered .MuiTextField-root input[aria-labelledby="slide-sin-rate-slider"]'
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
      request.postDataJSON()?.slide === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Audio BPM slide timing', async ({ page }) => {
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")'
  )

  await page
    .locator(CARD_SELECTOR)
    .getByLabel('Timing', { exact: true })
    .click()
  await page.getByRole('option', { name: 'Audio BPM', exact: true }).click()

  await page.getByTestId('ErrorOutlineIcon').first().hover()
  await expect(
    page.getByRole('tooltip', { name: 'Missing audio with BPM', exact: true })
  ).toBeVisible()

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
      request.postDataJSON()?.slide === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('With scene slide timing', async ({ page }) => {
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")'
  )

  await page
    .locator(CARD_SELECTOR)
    .getByLabel('Timing', { exact: true })
    .click()
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
      request.postDataJSON()?.slide === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Constant slide timing', async ({ page }) => {
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")'
  )

  await page
    .locator(CARD_SELECTOR)
    .getByLabel('Timing', { exact: true })
    .click()
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
      request.postDataJSON()?.slide === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Slide direction', async ({ page }) => {
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).toBeChecked()

  await page.getByLabel('Direction', { exact: true }).click()
  await page.getByRole('option', { name: 'Right', exact: true }).click()
  await expect(page.locator('#strobe-direction-select-menu')).not.toBeVisible()
  await expect(page.getByLabel('Direction', { exact: true })).toHaveText(
    'Right'
  )

  await page.getByLabel('Direction', { exact: true }).click()
  await page.getByRole('option', { name: 'Left/Right', exact: true }).click()
  await expect(page.locator('#strobe-direction-select-menu')).not.toBeVisible()
  await expect(page.getByLabel('Direction', { exact: true })).toHaveText(
    'Left/Right'
  )

  await page.getByLabel('Direction', { exact: true }).click()
  await page.getByRole('option', { name: 'Up', exact: true }).click()
  await expect(page.locator('#strobe-direction-select-menu')).not.toBeVisible()
  await expect(page.getByLabel('Direction', { exact: true })).toHaveText('Up')

  await page.getByLabel('Direction', { exact: true }).click()
  await page.getByRole('option', { name: 'Down', exact: true }).click()
  await expect(page.locator('#strobe-direction-select-menu')).not.toBeVisible()
  await expect(page.getByLabel('Direction', { exact: true })).toHaveText('Down')

  await page.getByLabel('Direction', { exact: true }).click()
  await page.getByRole('option', { name: 'Up/Down', exact: true }).click()
  await expect(page.locator('#strobe-direction-select-menu')).not.toBeVisible()
  await expect(page.getByLabel('Direction', { exact: true })).toHaveText(
    'Up/Down'
  )

  await page.getByLabel('Direction', { exact: true }).click()
  await page.getByRole('option', { name: 'Random', exact: true }).click()
  await expect(page.locator('#strobe-direction-select-menu')).not.toBeVisible()
  await expect(page.getByLabel('Direction', { exact: true })).toHaveText(
    'Random'
  )

  await page.getByLabel('Direction', { exact: true }).click()
  await page.getByRole('option', { name: 'Left', exact: true }).click()
  await expect(page.locator('#strobe-direction-select-menu')).not.toBeVisible()
  await expect(page.getByLabel('Direction', { exact: true })).toHaveText('Left')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.slide === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Slide distance', async ({ page }) => {
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).toBeChecked()

  const container = await page
    .locator(
      '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Direction") .MuiGrid2-container .MuiGrid2-root'
    )
    .nth(1)

  const slider = container.locator('.MuiSlider-root')
  const thumb = slider.locator('.MuiSlider-thumb')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')
  await expect(container.locator('.MuiTypography-caption')).toHaveText(
    'Distance: 100%'
  )

  await changeSlider(page, thumb, slider, 0)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1%')
  await expect(container.locator('.MuiTypography-caption')).toHaveText(
    'Distance: 1%'
  )

  await changeSlider(page, thumb, slider, 0.01)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('2%')
  await expect(container.locator('.MuiTypography-caption')).toHaveText(
    'Distance: 2%'
  )

  await changeSlider(page, thumb, slider, 0.99)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99%')
  await expect(container.locator('.MuiTypography-caption')).toHaveText(
    'Distance: 99%'
  )

  await changeSlider(page, thumb, slider, 1)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')
  await expect(container.locator('.MuiTypography-caption')).toHaveText(
    'Distance: 100%'
  )

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.slide === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Slide', { exact: true }).click()
  await expect(page.getByLabel('Slide', { exact: true })).not.toBeChecked()
  await responsePromise
})
