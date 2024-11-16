import { test, expect } from '@playwright/test'
import { colors, changeSlider, testSliderValue } from '../../utils'

test.use({ storageState: 'server/tests/data/session.json' })
test.beforeEach(async ({ page }) => {
  await page.goto('/settings/scene-effects')
})

test('Strobe effect', async ({ page }) => {
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await expect(page.getByLabel('Add Delay', { exact: true })).not.toBeVisible()
  await expect(page.getByText('Color TypeSolid Color')).not.toBeVisible()
  await expect(
    page.locator(
      'div:nth-child(4) > .MuiPaper-root > .MuiCardContent-root > div > div:nth-child(3) > .MuiCollapse-root.MuiCollapse-entered > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > div'
    )
  ).not.toBeVisible()
  await expect(page.getByText('Strobe LayerAbove All')).not.toBeVisible()
  await expect(page.getByText('TimingConstant').nth(2)).not.toBeVisible()
  await expect(
    page.getByRole('spinbutton', { name: 'For', exact: true })
  ).not.toBeVisible()

  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
  await expect(page.getByLabel('Add Delay', { exact: true })).toBeVisible()
  await expect(page.getByText('Color TypeSolid Color')).toBeVisible()
  await expect(
    page.locator(
      'div:nth-child(4) > .MuiPaper-root > .MuiCardContent-root > div > div:nth-child(3) > .MuiCollapse-root.MuiCollapse-entered > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > div'
    )
  ).toBeVisible()
  await expect(page.getByText('Strobe LayerAbove All')).toBeVisible()
  await expect(page.getByText('TimingConstant').nth(2)).toBeVisible()
  await expect(
    page.getByRole('spinbutton', { name: 'For', exact: true })
  ).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await expect(page.getByLabel('Add Delay', { exact: true })).not.toBeVisible()
  await expect(page.getByText('Color TypeSolid Color')).not.toBeVisible()
  await expect(
    page.locator(
      'div:nth-child(4) > .MuiPaper-root > .MuiCardContent-root > div > div:nth-child(3) > .MuiCollapse-root.MuiCollapse-entered > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > div'
    )
  ).not.toBeVisible()
  await expect(page.getByText('Strobe LayerAbove All')).not.toBeVisible()
  await expect(page.getByText('TimingConstant').nth(2)).not.toBeVisible()
  await expect(
    page.getByRole('spinbutton', { name: 'For', exact: true })
  ).not.toBeVisible()
  await responsePromise
})

test('Add strobe delay', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
  await expect(page.getByLabel('Add Delay', { exact: true })).not.toBeChecked()
  await expect(page.getByText('Delay TimingConstant')).not.toBeVisible()

  await page.getByLabel('Add Delay', { exact: true }).check()
  await expect(page.getByLabel('Add Delay', { exact: true })).toBeChecked()
  await expect(page.getByText('Delay TimingConstant')).toBeVisible()

  let responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.strobePulse === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Add Delay', { exact: true }).uncheck()
  await expect(page.getByLabel('Add Delay', { exact: true })).not.toBeChecked()
  await expect(page.getByText('Delay TimingConstant')).not.toBeVisible()
  await responsePromise

  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Random strobe timing', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
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
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Wave strobe timing', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
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
    '.MuiCollapse-entered .MuiTextField-root input[aria-labelledby="strobe-sin-rate-slider"]'
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
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Audio BPM strobe timing', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
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
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('With scene strobe timing', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
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
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Constant strobe timing', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
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
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Random strobe delay timing', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
  await page.getByLabel('Add Delay', { exact: true }).check()
  await expect(page.getByLabel('Add Delay', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Delay Timing")'
  )

  await page.getByRole('combobox').nth(5).click()
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

  await page.getByLabel('Add Delay', { exact: true }).uncheck()
  await expect(page.getByLabel('Add Delay', { exact: true })).not.toBeChecked()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Wave strobe delay timing', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
  await page.getByLabel('Add Delay', { exact: true }).check()
  await expect(page.getByLabel('Add Delay', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Delay Timing")'
  )

  await page.getByRole('combobox').nth(5).click()
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
    '.MuiCollapse-entered .MuiTextField-root input[aria-labelledby="strobe-delay-sin-rate-slider"]'
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

  await page.getByLabel('Add Delay', { exact: true }).uncheck()
  await expect(page.getByLabel('Add Delay', { exact: true })).not.toBeChecked()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Audio BPM strobe delay timing', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
  await page.getByLabel('Add Delay', { exact: true }).check()
  await expect(page.getByLabel('Add Delay', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Delay Timing")'
  )

  await page.getByRole('combobox').nth(5).click()
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

  await page.getByLabel('Add Delay', { exact: true }).uncheck()
  await expect(page.getByLabel('Add Delay', { exact: true })).not.toBeChecked()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('With scene strobe delay timing', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
  await page.getByLabel('Add Delay', { exact: true }).check()
  await expect(page.getByLabel('Add Delay', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Delay Timing")'
  )

  await page.getByRole('combobox').nth(5).click()
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

  await page.getByLabel('Add Delay', { exact: true }).uncheck()
  await expect(page.getByLabel('Add Delay', { exact: true })).not.toBeChecked()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Constant strobe delay timing', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
  await page.getByLabel('Add Delay', { exact: true }).check()
  await expect(page.getByLabel('Add Delay', { exact: true })).toBeChecked()
  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Delay Timing")'
  )

  await page.getByRole('combobox').nth(5).click()
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

  await page.getByLabel('Add Delay', { exact: true }).uncheck()
  await expect(page.getByLabel('Add Delay', { exact: true })).not.toBeChecked()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Strobe layer', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()

  await expect(page.getByText('Strobe LayerAbove All')).toBeVisible()
  await expect(page.getByText('Solid Color', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).toBeVisible()
  await expect(page.getByText('Strobe Opacity')).not.toBeVisible()

  await page.getByRole('combobox').nth(3).click()
  await page.getByRole('option', { name: 'Above Scene', exact: true }).click()
  await expect(page.getByText('Strobe LayerAbove Scene')).toBeVisible()
  await expect(page.getByText('Solid Color', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).toBeVisible()
  await expect(page.getByText('Strobe Opacity')).not.toBeVisible()

  await page.getByRole('combobox').nth(3).click()
  await page.getByRole('option', { name: 'Strobe Image', exact: true }).click()
  await expect(page.getByText('Strobe LayerStrobe Image')).toBeVisible()
  await expect(page.getByText('Solid Color', { exact: true })).not.toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).not.toBeVisible()
  await expect(page.getByText('Strobe Opacity')).not.toBeVisible()

  await page.getByRole('combobox').nth(2).click()
  await page.getByRole('option', { name: 'Behind Image', exact: true }).click()
  await expect(page.getByText('Strobe LayerBehind Image')).toBeVisible()
  await expect(page.getByText('Solid Color', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).toBeVisible()
  await expect(page.getByText('Strobe Opacity')).not.toBeVisible()

  await page.getByRole('combobox').nth(3).click()
  await page.getByRole('option', { name: 'Behind All', exact: true }).click()
  await expect(page.getByText('Strobe LayerBehind All')).toBeVisible()
  await expect(page.getByText('Solid Color', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).toBeVisible()
  await expect(page.getByText('Strobe Opacity')).toBeVisible()

  await page.getByRole('combobox').nth(3).click()
  await page.getByRole('option', { name: 'Above All', exact: true }).click()
  await expect(page.getByText('Strobe LayerAbove All')).toBeVisible()
  await expect(page.getByText('Solid Color', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).toBeVisible()
  await expect(page.getByText('Strobe Opacity')).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Strobe color type', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()

  await expect(page.getByLabel('Color', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Add Color')).not.toBeVisible()
  await expect(page.getByLabel('Clear Colors')).not.toBeVisible()

  await page.getByRole('combobox').nth(2).click()
  await page.getByRole('option', { name: 'Set of Colors', exact: true }).click()
  await expect(page.getByText('Color TypeSet of Colors')).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).not.toBeVisible()
  await expect(page.getByLabel('Add Color')).toBeVisible()
  await expect(page.getByLabel('Clear Colors')).toBeVisible()

  await page.getByRole('combobox').nth(2).click()
  await page.getByRole('option', { name: 'Random Colors', exact: true }).click()
  await expect(page.getByText('Color TypeRandom Colors')).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).not.toBeVisible()
  await expect(page.getByLabel('Add Color')).not.toBeVisible()
  await expect(page.getByLabel('Clear Colors')).not.toBeVisible()

  await page.getByRole('combobox').nth(2).click()
  await page.getByRole('option', { name: 'Solid Color', exact: true }).click()
  await expect(page.getByText('Color TypeSolid Color')).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Add Color')).not.toBeVisible()
  await expect(page.getByLabel('Clear Colors')).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Strobe solid color', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
  await page.getByRole('combobox').nth(2).click()
  await page.getByRole('option', { name: 'Solid Color', exact: true }).click()

  await expect(page.getByLabel('Pick Color', { exact: true })).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)'
  )
  await expect(page.getByLabel('Color', { exact: true })).toHaveValue('#FFFFFF')

  await page.getByLabel('Color', { exact: true }).fill('#3fa156')
  await expect(page.getByLabel('Pick Color')).toHaveCSS(
    'background-color',
    'rgb(63, 161, 86)'
  )

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    await expect(
      page
        .locator(
          `.MuiGrid2-root > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
        )
        .first()
    ).toHaveAttribute('value', color.hex)
    await page
      .locator(
        `.MuiGrid2-root > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
      )
      .first()
      .click()

    await expect(page.getByLabel('Pick Color')).toHaveCSS(
      'background-color',
      `rgb(${color.rgb})`
    )
    await expect(page.getByLabel('Color', { exact: true })).toHaveValue(
      color.hex
    )
  }

  await page.getByLabel('Pick Color').hover()
  await expect(page.getByRole('tooltip')).toHaveText('Pick Color')

  await page.getByLabel('Pick Color').click()
  await page.getByLabel('hex').fill('FFF000')
  await page.locator('.MuiBackdrop-root').click()
  await expect(page.getByLabel('Pick Color')).toHaveCSS(
    'background-color',
    `rgb(255, 240, 0)`
  )
  await expect(page.getByLabel('Color', { exact: true })).toHaveValue('#fff000')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Strobe set of colors', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
  await page.getByRole('combobox').nth(2).click()
  await page.getByRole('option', { name: 'Set of Colors', exact: true }).click()
  await expect(page.locator('#color-0')).not.toBeVisible()
  await expect(page.locator('#color-1')).not.toBeVisible()

  await page.getByLabel('Add Color', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toHaveText('Add Color')

  await page.getByLabel('Add Color', { exact: true }).click()
  await expect(page.locator('#color-0')).toHaveCSS(
    'background-color',
    'rgb(0, 0, 0)'
  )
  await page.getByLabel('hex', { exact: true }).fill('E913D5')
  await expect(page.getByLabel('Add Color')).toHaveCSS(
    'background-color',
    'rgb(233, 19, 213)'
  )
  await page.locator('.MuiBackdrop-root').click()
  await expect(page.locator('#color-0')).toHaveCSS(
    'background-color',
    'rgb(233, 19, 213)'
  )

  await page.getByLabel('Add Color', { exact: true }).click()
  await expect(page.locator('#color-1')).toHaveCSS(
    'background-color',
    'rgb(0, 0, 0)'
  )
  await page.getByLabel('hex', { exact: true }).fill('1CEC12')
  await expect(page.getByLabel('Add Color', { exact: true })).toHaveCSS(
    'background-color',
    'rgb(28, 236, 18)'
  )
  await page.locator('.MuiBackdrop-root').click()
  await expect(page.locator('#color-1')).toHaveCSS(
    'background-color',
    'rgb(28, 236, 18)'
  )

  await expect(page.getByLabel('hex', { exact: true })).not.toBeVisible()
  await page.locator('#color-1').click()
  await expect(page.locator('#color-1')).toHaveCSS(
    'border',
    '3px solid rgb(0, 0, 0)'
  )
  await expect(page.getByLabel('hex', { exact: true })).toBeVisible()
  await expect(page.getByLabel('hex', { exact: true })).toHaveValue('1CEC12')
  await page.locator('.MuiBackdrop-root').click()

  await page.getByLabel('Clear Colors', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toHaveText('Clear Colors')
  await page.getByLabel('Clear Colors', { exact: true }).click()
  await expect(page.locator('#color-0')).not.toBeVisible()
  await expect(page.locator('#color-1')).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Strobe opacity', async ({ page }) => {
  await page.getByLabel('Strobe', { exact: true }).check()
  await expect(page.getByLabel('Strobe', { exact: true })).toBeChecked()
  await page.getByRole('combobox').nth(3).click()
  await page.getByRole('option', { name: 'Behind All', exact: true }).click()
  await expect(page.getByText('Strobe LayerBehind All')).toBeVisible()

  const container = page.locator(
    '.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Strobe Opacity")'
  )
  const input = await container.locator(
    '.MuiCollapse-entered .MuiTextField-root input[aria-labelledby="strobe-opacity-slider"]'
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
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')

  await changeSlider(page, thumb, slider, 0)
  await expect(input).toHaveValue('0')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0%')

  await changeSlider(page, thumb, slider, 0.01)
  await expect(input).toHaveValue('1')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1%')

  await changeSlider(page, thumb, slider, 0.99)
  await expect(input).toHaveValue('99')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99%')

  await changeSlider(page, thumb, slider, 1)
  await expect(input).toHaveValue('100')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')

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
      request.postDataJSON()?.strobe === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Strobe', { exact: true }).uncheck()
  await expect(page.getByLabel('Strobe', { exact: true })).not.toBeChecked()
  await responsePromise
})
