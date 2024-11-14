import { test, expect } from '@playwright/test'
import { changeSlider } from '../../utils'

test.use({ storageState: 'server/tests/data/session.json' })
test.beforeEach(async ({ page }) => {
  await page.goto('/settings/scene-effects')
})

test('Zoom effect', async ({ page }) => {
  await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
  await expect(
    page.getByText('Randomize Zoom', { exact: true })
  ).not.toBeVisible()
  await expect(page.getByText(/^Zoom Start:/)).not.toBeVisible()
  await expect(page.getByText(/^Zoom End:/)).not.toBeVisible()

  await page.getByLabel('Zoom', { exact: true }).check()
  await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
  await expect(page.getByText('Randomize Zoom', { exact: true })).toBeVisible()
  await expect(page.getByText(/^Zoom Start:/)).toBeVisible()
  await expect(page.getByText(/^Zoom End:/)).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.zoom === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Zoom', { exact: true }).uncheck()
  await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
  await expect(
    page.getByText('Randomize Zoom', { exact: true })
  ).not.toBeVisible()
  await expect(page.getByText(/^Zoom Start:/)).not.toBeVisible()
  await expect(page.getByText(/^Zoom End:/)).not.toBeVisible()
  await responsePromise
})

test('Zoom start slider', async ({ page }) => {
  await page.getByLabel('Zoom', { exact: true }).check()
  await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()

  await expect(page.getByText('Zoom Start: 1x', { exact: true })).toBeVisible()

  const slider = page.locator('.MuiSlider-root').first()
  const thumb = slider.locator('.MuiSlider-thumb')

  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1x')

  await changeSlider(page, thumb, slider, 0)
  await expect(
    page.getByText('Zoom Start: 0.1x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')

  await changeSlider(page, thumb, slider, 0.025)
  await expect(
    page.getByText('Zoom Start: 0.2x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')

  await changeSlider(page, thumb, slider, 1)
  await expect(page.getByText('Zoom Start: 5x', { exact: true })).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5x')

  await changeSlider(page, thumb, slider, 0.975)
  await expect(
    page.getByText('Zoom Start: 4.9x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4.9x')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.zoom === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Zoom', { exact: true }).uncheck()
  await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Zoom end slider', async ({ page }) => {
  await page.getByLabel('Zoom', { exact: true }).check()
  await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()

  await expect(page.getByText('Zoom End: 2x', { exact: true })).toBeVisible()

  const slider = await page
    .locator('div:nth-child(2) > .MuiSlider-root')
    .first()
  const thumb = slider.locator('.MuiSlider-thumb')

  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('2x')

  await changeSlider(page, thumb, slider, 0)
  await expect(page.getByText('Zoom End: 0.1x', { exact: true })).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')

  await changeSlider(page, thumb, slider, 0.025)
  await expect(page.getByText('Zoom End: 0.2x', { exact: true })).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')

  await changeSlider(page, thumb, slider, 1)
  await expect(page.getByText('Zoom End: 5x', { exact: true })).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5x')

  await changeSlider(page, thumb, slider, 0.975)
  await expect(page.getByText('Zoom End: 4.9x', { exact: true })).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4.9x')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.zoom === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Zoom', { exact: true }).uncheck()
  await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Randomize zoom effect', async ({ page }) => {
  await page.getByLabel('Zoom', { exact: true }).check()
  await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()

  await expect(page.getByText('Randomize Zoom', { exact: true })).toBeVisible()
  await expect(
    page.getByText('Randomize Zoom', { exact: true })
  ).not.toBeChecked()

  await page.getByText('Randomize Zoom', { exact: true }).check()
  await expect(page.getByLabel('Randomize Zoom', { exact: true })).toBeChecked()
  await expect(page.getByText(/^Zoom Start:/)).not.toBeVisible()
  await expect(page.getByText(/^Zoom End:/)).not.toBeVisible()
  await expect(page.getByText(/^Zoom Start Min:/)).toBeVisible()
  await expect(page.getByText(/^Zoom Start Max:/)).toBeVisible()
  await expect(page.getByText(/^Zoom End Min:/)).toBeVisible()
  await expect(page.getByText(/^Zoom End Max:/)).toBeVisible()

  await page.getByText('Randomize Zoom', { exact: true }).uncheck()
  await expect(
    page.getByLabel('Randomize Zoom', { exact: true })
  ).not.toBeChecked()
  await expect(page.getByText(/^Zoom Start:/)).toBeVisible()
  await expect(page.getByText(/^Zoom End:/)).toBeVisible()
  await expect(page.getByText(/^Zoom Start Min:/)).not.toBeVisible()
  await expect(page.getByText(/^Zoom Start Max:/)).not.toBeVisible()
  await expect(page.getByText(/^Zoom End Min:/)).not.toBeVisible()
  await expect(page.getByText(/^Zoom End Max:/)).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.zoom === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Zoom', { exact: true }).uncheck()
  await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Zoom start min slider', async ({ page }) => {
  await page.getByLabel('Zoom', { exact: true }).check()
  await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
  await page.getByText('Randomize Zoom', { exact: true }).check()
  await expect(page.getByLabel('Randomize Zoom', { exact: true })).toBeChecked()

  const container = page.locator('main .MuiCollapse-entered div:nth-child(1)')
  await expect(
    container.getByText('Zoom Start Min: 0.5x', { exact: true })
  ).toBeVisible()

  const slider = await container.locator('.MuiSlider-root').first()
  const thumb = slider.locator('.MuiSlider-thumb')

  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.5x')

  await changeSlider(page, thumb, slider, 0)
  await expect(
    container.getByText('Zoom Start Min: 0.1x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')

  await changeSlider(page, thumb, slider, 0.025)
  await expect(
    container.getByText('Zoom Start Min: 0.2x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')

  await changeSlider(page, thumb, slider, 1)
  await expect(
    container.getByText('Zoom Start Min: 5x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5x')

  await changeSlider(page, thumb, slider, 0.975)
  await expect(
    container.getByText('Zoom Start Min: 4.9x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4.9x')

  await page.getByText('Randomize Zoom', { exact: true }).uncheck()
  await expect(
    page.getByLabel('Randomize Zoom', { exact: true })
  ).not.toBeChecked()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.zoom === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Zoom', { exact: true }).uncheck()
  await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Zoom start max slider', async ({ page }) => {
  await page.getByLabel('Zoom', { exact: true }).check()
  await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
  await page.getByText('Randomize Zoom', { exact: true }).check()
  await expect(page.getByLabel('Randomize Zoom', { exact: true })).toBeChecked()

  const container = page.locator('main .MuiCollapse-entered div:nth-child(2)')
  await expect(
    container.getByText('Zoom Start Max: 1x', { exact: true })
  ).toBeVisible()

  const slider = await container.locator('.MuiSlider-root').first()
  const thumb = slider.locator('.MuiSlider-thumb')

  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1x')

  await changeSlider(page, thumb, slider, 0)
  await expect(
    container.getByText('Zoom Start Max: 0.1x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')

  await changeSlider(page, thumb, slider, 0.025)
  await expect(
    container.getByText('Zoom Start Max: 0.2x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')

  await changeSlider(page, thumb, slider, 1)
  await expect(
    container.getByText('Zoom Start Max: 5x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5x')

  await changeSlider(page, thumb, slider, 0.975)
  await expect(
    container.getByText('Zoom Start Max: 4.9x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4.9x')

  await page.getByText('Randomize Zoom', { exact: true }).uncheck()
  await expect(
    page.getByLabel('Randomize Zoom', { exact: true })
  ).not.toBeChecked()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.zoom === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Zoom', { exact: true }).uncheck()
  await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Zoom end min slider', async ({ page }) => {
  await page.getByLabel('Zoom', { exact: true }).check()
  await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
  await page.getByText('Randomize Zoom', { exact: true }).check()
  await expect(page.getByLabel('Randomize Zoom', { exact: true })).toBeChecked()

  const container = page.locator('main .MuiCollapse-entered div:nth-child(3)')
  await expect(
    container.getByText('Zoom End Min: 1.5x', { exact: true })
  ).toBeVisible()

  const slider = await container.locator('.MuiSlider-root').first()
  const thumb = slider.locator('.MuiSlider-thumb')

  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1.5x')

  await changeSlider(page, thumb, slider, 0)
  await expect(
    container.getByText('Zoom End Min: 0.1x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')

  await changeSlider(page, thumb, slider, 0.025)
  await expect(
    container.getByText('Zoom End Min: 0.2x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')

  await changeSlider(page, thumb, slider, 1)
  await expect(
    container.getByText('Zoom End Min: 5x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5x')

  await changeSlider(page, thumb, slider, 0.975)
  await expect(
    container.getByText('Zoom End Min: 4.9x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4.9x')

  await page.getByText('Randomize Zoom', { exact: true }).uncheck()
  await expect(
    page.getByLabel('Randomize Zoom', { exact: true })
  ).not.toBeChecked()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.zoom === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Zoom', { exact: true }).uncheck()
  await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
  await responsePromise
})

test('Zoom end max slider', async ({ page }) => {
  await page.getByLabel('Zoom', { exact: true }).check()
  await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
  await page.getByText('Randomize Zoom', { exact: true }).check()
  await expect(page.getByLabel('Randomize Zoom', { exact: true })).toBeChecked()

  const container = page.locator('main .MuiCollapse-entered div:nth-child(4)')
  await expect(
    container.getByText('Zoom End Max: 2x', { exact: true })
  ).toBeVisible()

  const slider = await container.locator('.MuiSlider-root').first()
  const thumb = slider.locator('.MuiSlider-thumb')

  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('2x')

  await changeSlider(page, thumb, slider, 0)
  await expect(
    container.getByText('Zoom End Max: 0.1x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')

  await changeSlider(page, thumb, slider, 0.025)
  await expect(
    container.getByText('Zoom End Max: 0.2x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')

  await changeSlider(page, thumb, slider, 1)
  await expect(
    container.getByText('Zoom End Max: 5x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5x')

  await changeSlider(page, thumb, slider, 0.975)
  await expect(
    container.getByText('Zoom End Max: 4.9x', { exact: true })
  ).toBeVisible()
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4.9x')

  await page.getByText('Randomize Zoom', { exact: true }).uncheck()
  await expect(
    page.getByLabel('Randomize Zoom', { exact: true })
  ).not.toBeChecked()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.zoom === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Zoom', { exact: true }).uncheck()
  await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
  await responsePromise
})
