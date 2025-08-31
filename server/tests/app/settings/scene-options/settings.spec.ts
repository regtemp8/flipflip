import { test, expect } from '@playwright/test'
import { changeSlider, testSliderValue } from '../../utils'
import { IF, WF } from 'flipflip-common'

test.beforeEach(async ({ page }) => {
  await page.goto('/settings/scene-options')
})

test('Re-Generate on Playback', async ({ page }) => {
  await expect(
    page.getByLabel('Re-Generate on Playback', { exact: true })
  ).toBeChecked()

  await page.getByLabel('Re-Generate on Playback', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    'When enabled, this scene will be automatically regenerated with each playback'
  )

  await page.getByLabel('Re-Generate on Playback', { exact: true }).click()
  await expect(
    page.getByLabel('Re-Generate on Playback', { exact: true })
  ).not.toBeChecked()

  await page.getByLabel('Re-Generate on Playback', { exact: true }).click()
  await expect(
    page.getByLabel('Re-Generate on Playback', { exact: true })
  ).toBeChecked()
})

test('Image Filter', async ({ page }) => {
  await expect(page.getByText('Image FilterAll Files')).toBeVisible()

  await page.getByRole('combobox').nth(3).click()
  await page.getByRole('option', { name: 'Only videos', exact: true }).click()
  await expect(page.getByText('Image FilterOnly videos')).toBeVisible()
  await expect(page.getByText('Image Orientation')).not.toBeVisible()
  await expect(page.getByText('GIF Options')).not.toBeVisible()
  await expect(page.getByText('Video Options')).toBeVisible()
  await expect(page.getByText('Video Orientation')).toBeVisible()
  await expect(page.getByText('Video Speed:')).toBeVisible()
  await expect(page.getByLabel('Random Speed')).toBeVisible()
  await expect(page.getByText('Video Skip Rate:')).toBeVisible()
  await expect(page.getByLabel('Start at Random Time')).toBeVisible()
  await expect(page.getByLabel('Continue Videos')).toBeVisible()
  await expect(page.getByLabel('Use Clips')).toBeVisible()
  await expect(
    page.locator('input[aria-labelledby="video-volume-slider"]')
  ).toBeVisible()

  await page.getByRole('combobox').nth(3).click()
  await page.getByRole('option', { name: 'Only animated', exact: true }).click()
  await expect(page.getByText('Image FilterOnly animated')).toBeVisible()
  await expect(page.getByText('Image Orientation')).toBeVisible()
  await expect(page.getByText('GIF Options')).toBeVisible()
  await expect(page.getByText('Video Options')).toBeVisible()
  await expect(page.getByText('Video Orientation')).toBeVisible()
  await expect(page.getByText('Video Speed:')).toBeVisible()
  await expect(page.getByLabel('Random Speed')).toBeVisible()
  await expect(page.getByText('Video Skip Rate:')).toBeVisible()
  await expect(page.getByLabel('Start at Random Time')).toBeVisible()
  await expect(page.getByLabel('Continue Videos')).toBeVisible()
  await expect(page.getByLabel('Use Clips')).toBeVisible()
  await expect(
    page.locator('input[aria-labelledby="video-volume-slider"]')
  ).toBeVisible()

  await page.getByRole('combobox').nth(3).click()
  await page
    .getByRole('option', { name: 'Only image files', exact: true })
    .click()
  await expect(page.getByText('Image FilterOnly image files')).toBeVisible()
  await expect(page.getByText('Image Orientation')).toBeVisible()
  await expect(page.getByText('GIF Options')).toBeVisible()
  await expect(page.getByText('Video Options')).not.toBeVisible()
  await expect(page.getByText('Video Orientation')).not.toBeVisible()
  await expect(page.getByText('Video Speed:')).not.toBeVisible()
  await expect(page.getByLabel('Random Speed')).not.toBeVisible()
  await expect(page.getByText('Video Skip Rate:')).not.toBeVisible()
  await expect(page.getByLabel('Start at Random Time')).not.toBeVisible()
  await expect(page.getByLabel('Continue Videos')).not.toBeVisible()
  await expect(page.getByLabel('Use Clips')).not.toBeVisible()
  await expect(
    page.locator('input[aria-labelledby="video-volume-slider"]')
  ).not.toBeVisible()

  await page.getByRole('combobox').nth(3).click()
  await page.getByRole('option', { name: 'Only stills', exact: true }).click()
  await expect(page.getByText('Image FilterOnly stills')).toBeVisible()
  await expect(page.getByText('Image Orientation')).toBeVisible()
  await expect(page.getByText('GIF Options')).not.toBeVisible()
  await expect(page.getByText('Video Options')).not.toBeVisible()
  await expect(page.getByText('Video Orientation')).not.toBeVisible()
  await expect(page.getByText('Video Speed:')).not.toBeVisible()
  await expect(page.getByLabel('Random Speed')).not.toBeVisible()
  await expect(page.getByText('Video Skip Rate:')).not.toBeVisible()
  await expect(page.getByLabel('Start at Random Time')).not.toBeVisible()
  await expect(page.getByLabel('Continue Videos')).not.toBeVisible()
  await expect(page.getByLabel('Use Clips')).not.toBeVisible()
  await expect(
    page.locator('input[aria-labelledby="video-volume-slider"]')
  ).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.imageTypeFilter === IF.any &&
      res.status() === 204
    )
  })
  await page.getByRole('combobox').nth(3).click()
  await page.getByRole('option', { name: 'All files', exact: true }).click()
  await expect(page.getByText('Image FilterAll files')).toBeVisible()
  await expect(page.getByText('Image Orientation')).toBeVisible()
  await expect(page.getByText('GIF Options')).toBeVisible()
  await expect(page.getByText('Video Options')).toBeVisible()
  await expect(page.getByText('Video Orientation')).toBeVisible()
  await expect(page.getByText('Video Speed:')).toBeVisible()
  await expect(page.getByLabel('Random Speed')).toBeVisible()
  await expect(page.getByText('Video Skip Rate:')).toBeVisible()
  await expect(page.getByLabel('Start at Random Time')).toBeVisible()
  await expect(page.getByLabel('Continue Videos')).toBeVisible()
  await expect(page.getByLabel('Use Clips')).toBeVisible()
  await expect(
    page.locator('input[aria-labelledby="video-volume-slider"]')
  ).toBeVisible()
  await responsePromise
})

test('Play Full Sources', async ({ page }) => {
  await expect(
    page.getByLabel('Play Full Sources', { exact: true })
  ).not.toBeChecked()

  await page.getByLabel('Play Full Sources', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    'Play all images in a source before proceeding to the next one'
  )

  await page.getByLabel('Play Full Sources', { exact: true }).click()
  await expect(
    page.getByLabel('Play Full Sources', { exact: true })
  ).toBeChecked()

  await page.getByLabel('Play Full Sources', { exact: true }).click()
  await expect(
    page.getByLabel('Play Full Sources', { exact: true })
  ).not.toBeChecked()
})

test('Image Orientation', async ({ page }) => {
  await expect(page.getByText('Image OrientationNo Change')).toBeVisible()

  await page.getByRole('combobox').nth(4).click()
  await page
    .getByRole('option', { name: 'Only Landscape', exact: true })
    .click()
  await expect(page.getByText('Image OrientationOnly Landscape')).toBeVisible()

  await page.getByRole('combobox').nth(4).click()
  await page.getByRole('option', { name: 'Only Portrait', exact: true }).click()
  await expect(page.getByText('Image OrientationOnly Portrait')).toBeVisible()

  await page.getByRole('combobox').nth(4).click()
  await page
    .getByRole('option', { name: 'Force Landscape', exact: true })
    .click()
  await expect(page.getByText('Image OrientationForce Landscape')).toBeVisible()

  await page.getByRole('combobox').nth(4).click()
  await page
    .getByRole('option', { name: 'Force Portrait', exact: true })
    .click()
  await expect(page.getByText('Image OrientationForce Portrait')).toBeVisible()

  await page.getByRole('combobox').nth(4).click()
  await page.getByRole('option', { name: 'No Change', exact: true }).click()
  await expect(page.getByText('Image OrientationNo Change')).toBeVisible()
})

test('GIF Options', async ({ page }) => {
  await expect(page.getByText('GIF OptionsNo Change')).toBeVisible()

  await page.getByRole('combobox').nth(5).click()
  await page
    .getByRole('option', { name: 'Play Part (Constant)', exact: true })
    .click()
  await expect(page.getByText('GIF OptionsPlay Part (Constant)')).toBeVisible()
  await expect(page.getByLabel('For', { exact: true }).nth(2)).toBeVisible()
  await expect(
    page.getByLabel('Between', { exact: true }).nth(2)
  ).not.toBeVisible()
  await expect(page.getByLabel('and', { exact: true }).nth(2)).not.toBeVisible()

  await page.getByRole('combobox').nth(5).click()
  await page
    .getByRole('option', { name: 'Play Part (Random)', exact: true })
    .click()
  await expect(page.getByText('GIF OptionsPlay Part (Random)')).toBeVisible()
  await expect(page.getByLabel('For', { exact: true }).nth(2)).not.toBeVisible()
  await expect(page.getByLabel('Between', { exact: true }).nth(2)).toBeVisible()
  await expect(page.getByLabel('and', { exact: true }).nth(2)).toBeVisible()

  await page.getByRole('combobox').nth(5).click()
  await page.getByRole('option', { name: 'Play At Least', exact: true }).click()
  await expect(page.getByText('GIF OptionsPlay At Least')).toBeVisible()
  await expect(page.getByLabel('For', { exact: true }).nth(2)).toBeVisible()
  await expect(
    page.getByLabel('Between', { exact: true }).nth(2)
  ).not.toBeVisible()
  await expect(page.getByLabel('and', { exact: true }).nth(2)).not.toBeVisible()

  await page.getByRole('combobox').nth(5).click()
  await page.getByRole('option', { name: 'Play Full', exact: true }).click()
  await expect(page.getByText('GIF OptionsPlay Full')).toBeVisible()
  await expect(page.getByLabel('For', { exact: true }).nth(2)).not.toBeVisible()
  await expect(
    page.getByLabel('Between', { exact: true }).nth(2)
  ).not.toBeVisible()
  await expect(page.getByLabel('and', { exact: true }).nth(2)).not.toBeVisible()

  await page.getByRole('combobox').nth(5).click()
  await page.getByRole('option', { name: 'No Change', exact: true }).click()
  await expect(page.getByText('GIF OptionsNo Change')).toBeVisible()
  await expect(page.getByLabel('For', { exact: true }).nth(2)).not.toBeVisible()
  await expect(
    page.getByLabel('Between', { exact: true }).nth(2)
  ).not.toBeVisible()
  await expect(page.getByLabel('and', { exact: true }).nth(2)).not.toBeVisible()
})

test('GIF Play Constant Part Option', async ({ page }) => {
  await page.getByRole('combobox').nth(5).click()
  await page
    .getByRole('option', { name: 'Play Part (Constant)', exact: true })
    .click()
  await expect(page.getByLabel('For', { exact: true }).nth(2)).toBeVisible()
  await expect(page.getByLabel('For', { exact: true }).nth(2)).toHaveAttribute(
    'type',
    'number'
  )
  await expect(page.getByLabel('For', { exact: true }).nth(2)).toHaveAttribute(
    'min',
    '0'
  )
  await expect(page.getByLabel('For', { exact: true }).nth(2)).toHaveAttribute(
    'step',
    '100'
  )
})

test('GIF Play Random Part Option', async ({ page }) => {
  await page.getByRole('combobox').nth(5).click()
  await page
    .getByRole('option', { name: 'Play Part (Random)', exact: true })
    .click()
  await expect(page.getByLabel('Between', { exact: true }).nth(2)).toBeVisible()
  await expect(
    page.getByLabel('Between', { exact: true }).nth(2)
  ).toHaveAttribute('type', 'number')
  await expect(
    page.getByLabel('Between', { exact: true }).nth(2)
  ).toHaveAttribute('min', '0')
  await expect(
    page.getByLabel('Between', { exact: true }).nth(2)
  ).toHaveAttribute('step', '100')
  await expect(page.getByLabel('and', { exact: true }).nth(2)).toBeVisible()
  await expect(page.getByLabel('and', { exact: true }).nth(2)).toHaveAttribute(
    'type',
    'number'
  )
  await expect(page.getByLabel('and', { exact: true }).nth(2)).toHaveAttribute(
    'min',
    '0'
  )
  await expect(page.getByLabel('and', { exact: true }).nth(2)).toHaveAttribute(
    'step',
    '100'
  )
})

test('GIF Play At Least Option', async ({ page }) => {
  await page.getByRole('combobox').nth(5).click()
  await page.getByRole('option', { name: 'Play At Least', exact: true }).click()
  await expect(page.getByLabel('For', { exact: true }).nth(2)).toBeVisible()
  await expect(page.getByLabel('For', { exact: true }).nth(2)).toHaveAttribute(
    'type',
    'number'
  )
  await expect(page.getByLabel('For', { exact: true }).nth(2)).toHaveAttribute(
    'min',
    '0'
  )
  await expect(page.getByLabel('For', { exact: true }).nth(2)).toHaveAttribute(
    'step',
    '100'
  )
})

test('Video Options', async ({ page }) => {
  await expect(page.getByText('Video OptionsNo Change')).toBeVisible()

  await page.getByRole('combobox').nth(6).click()
  await page
    .getByRole('option', { name: 'Play Part (Constant)', exact: true })
    .click()
  await expect(
    page.getByText('Video OptionsPlay Part (Constant)')
  ).toBeVisible()
  await expect(page.getByLabel('For', { exact: true }).nth(3)).toBeVisible()
  await expect(
    page.getByLabel('Between', { exact: true }).nth(3)
  ).not.toBeVisible()
  await expect(page.getByLabel('and', { exact: true }).nth(3)).not.toBeVisible()

  await page.getByRole('combobox').nth(6).click()
  await page
    .getByRole('option', { name: 'Play Part (Random)', exact: true })
    .click()
  await expect(page.getByText('Video OptionsPlay Part (Random)')).toBeVisible()
  await expect(page.getByLabel('For', { exact: true }).nth(3)).not.toBeVisible()
  await expect(page.getByLabel('Between', { exact: true }).nth(3)).toBeVisible()
  await expect(page.getByLabel('and', { exact: true }).nth(3)).toBeVisible()

  await page.getByRole('combobox').nth(6).click()
  await page.getByRole('option', { name: 'Play At Least', exact: true }).click()
  await expect(page.getByText('Video OptionsPlay At Least')).toBeVisible()
  await expect(page.getByLabel('For', { exact: true }).nth(3)).toBeVisible()
  await expect(
    page.getByLabel('Between', { exact: true }).nth(3)
  ).not.toBeVisible()
  await expect(page.getByLabel('and', { exact: true }).nth(3)).not.toBeVisible()

  await page.getByRole('combobox').nth(6).click()
  await page.getByRole('option', { name: 'Play Full', exact: true }).click()
  await expect(page.getByText('Video OptionsPlay Full')).toBeVisible()
  await expect(page.getByLabel('For', { exact: true }).nth(3)).not.toBeVisible()
  await expect(
    page.getByLabel('Between', { exact: true }).nth(3)
  ).not.toBeVisible()
  await expect(page.getByLabel('and', { exact: true }).nth(3)).not.toBeVisible()

  await page.getByRole('combobox').nth(6).click()
  await page.getByRole('option', { name: 'No Change', exact: true }).click()
  await expect(page.getByText('Video OptionsNo Change')).toBeVisible()
  await expect(page.getByLabel('For', { exact: true }).nth(3)).not.toBeVisible()
  await expect(
    page.getByLabel('Between', { exact: true }).nth(3)
  ).not.toBeVisible()
  await expect(page.getByLabel('and', { exact: true }).nth(3)).not.toBeVisible()
})

test('Video Play Constant Part Option', async ({ page }) => {
  await page.getByRole('combobox').nth(6).click()
  await page
    .getByRole('option', { name: 'Play Part (Constant)', exact: true })
    .click()
  await expect(page.getByLabel('For', { exact: true }).nth(3)).toBeVisible()
  await expect(page.getByLabel('For', { exact: true }).nth(3)).toHaveAttribute(
    'type',
    'number'
  )
  await expect(page.getByLabel('For', { exact: true }).nth(3)).toHaveAttribute(
    'min',
    '0'
  )
  await expect(page.getByLabel('For', { exact: true }).nth(3)).toHaveAttribute(
    'step',
    '100'
  )
})

test('Video Play Random Part Option', async ({ page }) => {
  await page.getByRole('combobox').nth(6).click()
  await page
    .getByRole('option', { name: 'Play Part (Random)', exact: true })
    .click()
  await expect(page.getByLabel('Between', { exact: true }).nth(3)).toBeVisible()
  await expect(
    page.getByLabel('Between', { exact: true }).nth(3)
  ).toHaveAttribute('type', 'number')
  await expect(
    page.getByLabel('Between', { exact: true }).nth(3)
  ).toHaveAttribute('min', '0')
  await expect(
    page.getByLabel('Between', { exact: true }).nth(3)
  ).toHaveAttribute('step', '100')
  await expect(page.getByLabel('and', { exact: true }).nth(3)).toBeVisible()
  await expect(page.getByLabel('and', { exact: true }).nth(3)).toHaveAttribute(
    'type',
    'number'
  )
  await expect(page.getByLabel('and', { exact: true }).nth(3)).toHaveAttribute(
    'min',
    '0'
  )
  await expect(page.getByLabel('and', { exact: true }).nth(3)).toHaveAttribute(
    'step',
    '100'
  )
})

test('Video Play At Least Option', async ({ page }) => {
  await page.getByRole('combobox').nth(6).click()
  await page.getByRole('option', { name: 'Play At Least', exact: true }).click()
  await expect(page.getByLabel('For', { exact: true }).nth(3)).toBeVisible()
  await expect(page.getByLabel('For', { exact: true }).nth(3)).toHaveAttribute(
    'type',
    'number'
  )
  await expect(page.getByLabel('For', { exact: true }).nth(3)).toHaveAttribute(
    'min',
    '0'
  )
  await expect(page.getByLabel('For', { exact: true }).nth(3)).toHaveAttribute(
    'step',
    '100'
  )
})

test('Video Orientation', async ({ page }) => {
  await expect(page.getByText('Video OrientationNo Change')).toBeVisible()

  await page.getByRole('combobox').nth(7).click()
  await page
    .getByRole('option', { name: 'Only Landscape', exact: true })
    .click()
  await expect(page.getByText('Video OrientationOnly Landscape')).toBeVisible()

  await page.getByRole('combobox').nth(7).click()
  await page.getByRole('option', { name: 'Only Portrait', exact: true }).click()
  await expect(page.getByText('Video OrientationOnly Portrait')).toBeVisible()

  await page.getByRole('combobox').nth(7).click()
  await page
    .getByRole('option', { name: 'Force Landscape', exact: true })
    .click()
  await expect(page.getByText('Video OrientationForce Landscape')).toBeVisible()

  await page.getByRole('combobox').nth(7).click()
  await page
    .getByRole('option', { name: 'Force Portrait', exact: true })
    .click()
  await expect(page.getByText('Video OrientationForce Portrait')).toBeVisible()

  await page.getByRole('combobox').nth(7).click()
  await page.getByRole('option', { name: 'No Change', exact: true }).click()
  await expect(page.getByText('Video OrientationNo Change')).toBeVisible()
})

test('Video Speed', async ({ page }) => {
  const container = page.locator(
    '.MuiCollapse-entered:has-text("Video Speed: ")'
  )
  const slider = container.locator('.MuiSlider-root')
  await expect(slider).toBeVisible()
  const thumb = slider.locator('.MuiSlider-thumb')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1x')
  await expect(page.getByText('Video Speed: 1x', { exact: true })).toBeVisible()

  await changeSlider(page, thumb, slider, 0)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')
  await expect(
    page.getByText('Video Speed: 0.1x', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 0.025)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')
  await expect(
    page.getByText('Video Speed: 0.2x', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 0.975)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('3.9x')
  await expect(
    page.getByText('Video Speed: 3.9x', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 1)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4x')
  await expect(page.getByText('Video Speed: 4x', { exact: true })).toBeVisible()
})

test('Random Speed', async ({ page }) => {
  await expect(
    page.getByLabel('Random Speed', { exact: true })
  ).not.toBeChecked()
  await expect(page.getByText('Video Speed:')).toBeVisible()
  await expect(page.getByText('Video Speed Min:')).not.toBeVisible()
  await expect(page.getByText('Video Speed Max:')).not.toBeVisible()

  await page.getByLabel('Random Speed', { exact: true }).click()
  await expect(page.getByLabel('Random Speed', { exact: true })).toBeChecked()
  await expect(page.getByText('Video Speed:')).not.toBeVisible()
  await expect(page.getByText('Video Speed Min:')).toBeVisible()
  await expect(page.getByText('Video Speed Max:')).toBeVisible()

  await page.getByLabel('Random Speed', { exact: true }).click()
  await expect(
    page.getByLabel('Random Speed', { exact: true })
  ).not.toBeChecked()
  await expect(page.getByText('Video Speed:')).toBeVisible()
  await expect(page.getByText('Video Speed Min:')).not.toBeVisible()
  await expect(page.getByText('Video Speed Max:')).not.toBeVisible()
})

test('Video Speed Min', async ({ page }) => {
  await page.getByLabel('Random Speed', { exact: true }).click()
  await expect(page.getByLabel('Random Speed', { exact: true })).toBeChecked()

  const container = page.locator(
    '.MuiCollapse-entered .MuiGrid2-container .MuiGrid2-root:has-text("Video Speed Min: ")'
  )
  const slider = container.locator('.MuiSlider-root')
  await expect(slider).toBeVisible()
  const thumb = slider.locator('.MuiSlider-thumb')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.5x')
  await expect(
    page.getByText('Video Speed Min: 0.5x', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 0)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')
  await expect(
    page.getByText('Video Speed Min: 0.1x', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 0.025)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')
  await expect(
    page.getByText('Video Speed Min: 0.2x', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 0.975)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('3.9x')
  await expect(
    page.getByText('Video Speed Min: 3.9x', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 1)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4x')
  await expect(
    page.getByText('Video Speed Min: 4x', { exact: true })
  ).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.videoRandomSpeed === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Random Speed', { exact: true }).click()
  await expect(
    page.getByLabel('Random Speed', { exact: true })
  ).not.toBeChecked()
  await responsePromise
})

test('Video Speed Max', async ({ page }) => {
  await page.getByLabel('Random Speed', { exact: true }).click()
  await expect(page.getByLabel('Random Speed', { exact: true })).toBeChecked()

  const container = page.locator(
    '.MuiCollapse-entered .MuiGrid2-container .MuiGrid2-root:has-text("Video Speed Max: ")'
  )
  const slider = container.locator('.MuiSlider-root')
  await expect(slider).toBeVisible()
  const thumb = slider.locator('.MuiSlider-thumb')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('2x')
  await expect(
    page.getByText('Video Speed Max: 2x', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 0)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')
  await expect(
    page.getByText('Video Speed Max: 0.1x', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 0.025)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')
  await expect(
    page.getByText('Video Speed Max: 0.2x', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 0.975)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('3.9x')
  await expect(
    page.getByText('Video Speed Max: 3.9x', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 1)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4x')
  await expect(
    page.getByText('Video Speed Max: 4x', { exact: true })
  ).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.videoRandomSpeed === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Random Speed', { exact: true }).click()
  await expect(
    page.getByLabel('Random Speed', { exact: true })
  ).not.toBeChecked()
  await responsePromise
})

test('Video Skip Rate', async ({ page }) => {
  const container = page.locator(
    '.MuiGrid2-root > .MuiCollapse-entered:has-text("Video Skip Rate: ")'
  )
  const slider = container.locator('.MuiSlider-root')
  await expect(slider).toBeVisible()
  const thumb = slider.locator('.MuiSlider-thumb')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('10 sec')
  await expect(
    page.getByText('Video Skip Rate: 10 sec', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 0)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5 sec')
  await expect(
    page.getByText('Video Skip Rate: 5 sec', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 0.1)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('10 sec')
  await expect(
    page.getByText('Video Skip Rate: 10 sec', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 0.25)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('30 sec')
  await expect(
    page.getByText('Video Skip Rate: 30 sec', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 0.4)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('60 sec')
  await expect(
    page.getByText('Video Skip Rate: 60 sec', { exact: true })
  ).toBeVisible()

  await changeSlider(page, thumb, slider, 1)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('120 sec')
  await expect(
    page.getByText('Video Skip Rate: 120 sec', { exact: true })
  ).toBeVisible()
})

test('Start at Random Time', async ({ page }) => {
  await expect(
    page.getByLabel('Start at Random Time', { exact: true })
  ).not.toBeChecked()

  await page.getByLabel('Start at Random Time', { exact: true }).click()
  await expect(
    page.getByLabel('Start at Random Time', { exact: true })
  ).toBeChecked()

  await page.getByLabel('Start at Random Time', { exact: true }).click()
  await expect(
    page.getByLabel('Start at Random Time', { exact: true })
  ).not.toBeChecked()
})

test('Continue Videos', async ({ page }) => {
  await expect(
    page.getByLabel('Continue Videos', { exact: true })
  ).not.toBeChecked()

  await page
    .getByLabel('Continue Videos', { exact: true })
    .scrollIntoViewIfNeeded()
  await page.getByLabel('Continue Videos', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    'Each time a video is played, continue from where it left off. Default: Start from beginning'
  )

  await page.getByLabel('Continue Videos', { exact: true }).click()
  await expect(
    page.getByLabel('Continue Videos', { exact: true })
  ).toBeChecked()

  await page.getByLabel('Continue Videos', { exact: true }).click()
  await expect(
    page.getByLabel('Continue Videos', { exact: true })
  ).not.toBeChecked()
})

test('Use Clips', async ({ page }) => {
  await expect(page.getByLabel('Use Clips', { exact: true })).toBeChecked()

  await page.getByLabel('Use Clips', { exact: true }).click()
  await expect(page.getByLabel('Use Clips', { exact: true })).not.toBeChecked()
  await expect(page.getByLabel('Skip First', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Skip Last', { exact: true })).toBeVisible()

  await page.getByLabel('Use Clips', { exact: true }).click()
  await expect(page.getByLabel('Use Clips', { exact: true })).toBeChecked()
  await expect(page.getByLabel('Skip First', { exact: true })).not.toBeVisible()
  await expect(page.getByLabel('Skip Last', { exact: true })).not.toBeVisible()
})

test('Skip First', async ({ page }) => {
  await page.getByLabel('Use Clips', { exact: true }).click()
  await expect(page.getByLabel('Use Clips', { exact: true })).not.toBeChecked()

  await expect(page.getByLabel('Skip First', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Skip First', { exact: true })).toHaveAttribute(
    'type',
    'number'
  )
  await expect(page.getByLabel('Skip First', { exact: true })).toHaveAttribute(
    'min',
    '0'
  )
  await expect(page.getByLabel('Skip First', { exact: true })).toHaveAttribute(
    'step',
    '100'
  )

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.playVideoClips === true &&
      res.status() === 204
    )
  })
  await page.getByLabel('Use Clips', { exact: true }).click()
  await expect(page.getByLabel('Use Clips', { exact: true })).toBeChecked()
  await responsePromise
})

test('Skip Last', async ({ page }) => {
  await page.getByLabel('Use Clips', { exact: true }).click()
  await expect(page.getByLabel('Use Clips', { exact: true })).not.toBeChecked()

  await expect(page.getByLabel('Skip Last', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Skip Last', { exact: true })).toHaveAttribute(
    'type',
    'number'
  )
  await expect(page.getByLabel('Skip Last', { exact: true })).toHaveAttribute(
    'min',
    '0'
  )
  await expect(page.getByLabel('Skip Last', { exact: true })).toHaveAttribute(
    'step',
    '100'
  )

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.playVideoClips === true &&
      res.status() === 204
    )
  })
  await page.getByLabel('Use Clips', { exact: true }).click()
  await expect(page.getByLabel('Use Clips', { exact: true })).toBeChecked()
  await responsePromise
})

test('Video Volume', async ({ page }) => {
  const container = page.locator('.MuiCollapse-entered', {
    has: page.getByTestId('VolumeDownIcon').first()
  })
  const slider = container.locator('.MuiSlider-root')
  await expect(slider).toBeVisible()
  const thumb = slider.locator('.MuiSlider-thumb')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0')

  await changeSlider(page, thumb, slider, 0)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0')
  await slider.click()

  await changeSlider(page, thumb, slider, 0.01)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1')
  await slider.click()

  await changeSlider(page, thumb, slider, 0.99)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99')
  await slider.click()

  await changeSlider(page, thumb, slider, 1)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100')
})

test('Weighting', async ({ page }) => {
  await expect(page.getByLabel('By Source', { exact: true })).not.toBeDisabled()
  await expect(page.getByLabel('By Image', { exact: true })).not.toBeDisabled()
  await expect(page.getByLabel('By Source', { exact: true })).toBeChecked()
  await expect(page.getByLabel('By Image', { exact: true })).not.toBeChecked()
  await expect(
    page.getByLabel('Ordered', { exact: true }).first()
  ).not.toBeDisabled()
  await expect(
    page.getByLabel('Randomized', { exact: true }).first()
  ).not.toBeDisabled()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).first()
  ).not.toBeDisabled()
  await expect(
    page.getByLabel('Play Full Sources', { exact: true })
  ).toBeVisible()

  await page.getByLabel('By Image', { exact: true }).click()
  await expect(page.getByLabel('By Source', { exact: true })).not.toBeChecked()
  await expect(page.getByLabel('By Image', { exact: true })).toBeChecked()
  await expect(
    page.getByLabel('Ordered', { exact: true }).first()
  ).toBeDisabled()
  await expect(
    page.getByLabel('Randomized', { exact: true }).first()
  ).toBeDisabled()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).first()
  ).toBeDisabled()
  await expect(
    page.getByLabel('Play Full Sources', { exact: true })
  ).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.weightFunction === WF.sources &&
      res.status() === 204
    )
  })
  await page.getByLabel('By Source', { exact: true }).click()
  await expect(page.getByLabel('By Source', { exact: true })).toBeChecked()
  await expect(page.getByLabel('By Image', { exact: true })).not.toBeChecked()
  await expect(
    page.getByLabel('Ordered', { exact: true }).first()
  ).not.toBeDisabled()
  await expect(
    page.getByLabel('Randomized', { exact: true }).first()
  ).not.toBeDisabled()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).first()
  ).not.toBeDisabled()
  await expect(
    page.getByLabel('Play Full Sources', { exact: true })
  ).toBeVisible()
  await responsePromise
})

test('Source Ordering', async ({ page }) => {
  await expect(page.getByLabel('By Source', { exact: true })).toBeChecked()
  await expect(
    page.getByLabel('Randomized', { exact: true }).first()
  ).toBeChecked()
  await expect(
    page.getByLabel('Ordered', { exact: true }).first()
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).first()
  ).toBeVisible()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).first()
  ).not.toBeChecked()

  await page.getByLabel('Avoid Repeats', { exact: true }).first().click()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).first()
  ).toBeChecked()

  await page.getByLabel('Avoid Repeats', { exact: true }).first().click()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).first()
  ).not.toBeChecked()

  await page.getByLabel('Ordered', { exact: true }).first().click()
  await expect(
    page.getByLabel('Randomized', { exact: true }).first()
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Ordered', { exact: true }).first()
  ).toBeChecked()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).first()
  ).not.toBeVisible()

  await page.getByLabel('Randomized', { exact: true }).first().click()
  await expect(
    page.getByLabel('Randomized', { exact: true }).first()
  ).toBeChecked()
  await expect(
    page.getByLabel('Ordered', { exact: true }).first()
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).first()
  ).toBeVisible()
})

test('Image Ordering', async ({ page }) => {
  await page.getByLabel('By Image', { exact: true }).click()
  await expect(page.getByLabel('By Image', { exact: true })).toBeChecked()
  await expect(
    page.getByLabel('Randomized', { exact: true }).nth(1)
  ).toBeChecked()
  await expect(
    page.getByLabel('Ordered', { exact: true }).nth(1)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Strictly Ordered', { exact: true })
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).nth(1)
  ).toBeVisible()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).nth(1)
  ).not.toBeChecked()

  await page.getByLabel('Avoid Repeats', { exact: true }).nth(1).click()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).nth(1)
  ).toBeChecked()

  await page.getByLabel('Avoid Repeats', { exact: true }).nth(1).click()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).nth(1)
  ).not.toBeChecked()

  await page.getByLabel('Ordered', { exact: true }).nth(1).click()
  await expect(
    page.getByLabel('Randomized', { exact: true }).nth(1)
  ).not.toBeChecked()
  await expect(page.getByLabel('Ordered', { exact: true }).nth(1)).toBeChecked()
  await expect(
    page.getByLabel('Strictly Ordered', { exact: true })
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).nth(1)
  ).not.toBeVisible()

  await page.getByLabel('Strictly Ordered', { exact: true }).click()
  await expect(
    page.getByLabel('Randomized', { exact: true }).nth(1)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Ordered', { exact: true }).nth(1)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Strictly Ordered', { exact: true })
  ).toBeChecked()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).nth(1)
  ).not.toBeVisible()

  await page.getByLabel('Randomized', { exact: true }).nth(1).click()
  await expect(
    page.getByLabel('Randomized', { exact: true }).nth(1)
  ).toBeChecked()
  await expect(
    page.getByLabel('Ordered', { exact: true }).nth(1)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Strictly Ordered', { exact: true })
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Avoid Repeats', { exact: true }).nth(1)
  ).toBeVisible()
})
