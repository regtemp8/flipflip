import { test, expect } from '@playwright/test'
import { colors } from '../../utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/settings')
})

test('Enable Watermark', async ({ page }) => {
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).not.toBeChecked()

  await page.getByLabel('Enable Watermark', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    "When enabled, FlipFlip will display a watermark over each Scene. You may use the following variables:{scene_name} - Name of the current Scene{source_url} - URL of the current Source{source_name} - Name of the current Source{post_url} - URL of the current file's post{file_url} - URL of the current file{file_name} - Name of the current file{audio_url} - URL of the currently playing audio file{audio_name} - Name of the currently playing audio file{audio_title} - Title of the currently playing audio file{audio_artist} - Artist of the currently playing audio file{audio_album} - Album of the currently playing audio file"
  )

  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).toBeChecked()
  await expect(
    page.getByLabel('Show on Displays', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByText('Watermark Corner', { exact: true })
  ).toBeVisible()
  await expect(page.getByLabel('Watermark Text', { exact: true })).toBeVisible()
  await expect(page.getByText('Font', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Size', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true }).first()).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.watermark === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Show on Displays', { exact: true })
  ).not.toBeVisible()
  await expect(
    page.getByText('Watermark Corner', { exact: true })
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Watermark Text', { exact: true })
  ).not.toBeVisible()
  await expect(page.getByText('Font', { exact: true })).not.toBeVisible()
  await expect(page.getByLabel('Size', { exact: true })).not.toBeVisible()
  await expect(
    page.getByLabel('Color', { exact: true }).first()
  ).not.toBeVisible()
  await responsePromise
})

test('Show on Displays', async ({ page }) => {
  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).toBeChecked()
  await expect(
    page.getByLabel('Show on Displays', { exact: true })
  ).toBeVisible()

  await page.getByLabel('Show on Displays', { exact: true }).hover()
  await expect(
    page.getByRole('tooltip', {
      name: 'When enabled, watermark will show on each Scene in a Display',
      exact: true
    })
  ).toBeVisible()

  await page.getByLabel('Show on Displays', { exact: true }).click()
  await expect(
    page.getByLabel('Show on Displays', { exact: true })
  ).toBeChecked()

  await page.getByLabel('Show on Displays', { exact: true }).click()
  await expect(
    page.getByLabel('Show on Displays', { exact: true })
  ).not.toBeChecked()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.watermark === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).not.toBeChecked()
  await responsePromise
})

test('Watermark Corner', async ({ page }) => {
  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).toBeChecked()
  await expect(
    page.getByText('Watermark CornerBottom Right', { exact: true })
  ).toBeVisible()

  await await page.getByRole('combobox').nth(1).click()
  await page.getByRole('option', { name: 'Bottom Left', exact: true }).click()
  await expect(page.getByText('Watermark CornerBottom Left')).toBeVisible()

  await await page.getByRole('combobox').nth(1).click()
  await page.getByRole('option', { name: 'Top Right', exact: true }).click()
  await expect(page.getByText('Watermark CornerTop Right')).toBeVisible()

  await await page.getByRole('combobox').nth(1).click()
  await page.getByRole('option', { name: 'Top Left', exact: true }).click()
  await expect(page.getByText('Watermark CornerTop Left')).toBeVisible()

  await await page.getByRole('combobox').nth(1).click()
  await page.getByRole('option', { name: 'Bottom Right', exact: true }).click()
  await expect(page.getByText('Watermark CornerBottom Right')).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.watermark === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).not.toBeChecked()
  await responsePromise
})

test('Watermark Text', async ({ page }) => {
  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).toBeChecked()
  await expect(page.getByLabel('Watermark Text', { exact: true })).toBeVisible()

  await page.getByLabel('Watermark Text', { exact: true }).fill('FlipFlip')
  await expect(page.getByLabel('Watermark Text', { exact: true })).toHaveValue(
    'FlipFlip'
  )

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.watermark === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).not.toBeChecked()
  await responsePromise
})

test('Watermark Font', async ({ page }) => {
  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).toBeChecked()
  await expect(page.getByLabel('Font', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Font', { exact: true })).toHaveValue('')

  await page.getByLabel('Font', { exact: true }).click()
  for (let i = 0; i < 13; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.locator('#watermark-font-option-13').click()
  await expect(page.getByLabel('Font', { exact: true })).toHaveValue('Agbalumo')

  await page.getByLabel('Font', { exact: true }).click()
  await expect(page.locator('#watermark-font-option-13')).toHaveAttribute(
    'aria-selected',
    'true'
  )
  await page.keyboard.press('ArrowUp')
  await page.locator('#watermark-font-option-12').click()
  await expect(page.getByLabel('Font', { exact: true })).toHaveValue('Afacad')

  await page.getByLabel('Clear', { exact: true }).click()
  await expect(page.getByLabel('Font', { exact: true })).toHaveValue('')

  await page.getByLabel('Font', { exact: true }).fill('cree')
  await expect(page.getByRole('option').nth(0)).toHaveClass(
    / font-preview-creepster /
  )
  await expect(page.getByRole('option').nth(1)).toHaveClass(
    / font-preview-sancreek /
  )
  await expect(page.getByRole('option').nth(2)).toHaveClass(
    / font-preview-silkscreen /
  )
  await expect(page.getByRole('option').nth(3)).not.toBeVisible()
  await page.getByRole('option').nth(1).click()
  await expect(page.getByLabel('Font', { exact: true })).toHaveValue('Sancreek')

  await page.getByLabel('Font', { exact: true }).fill('')
  await expect(page.getByLabel('Font', { exact: true })).toHaveValue('')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.watermark === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).not.toBeChecked()
  await responsePromise
})

test('Watermark Font Size', async ({ page }) => {
  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).toBeChecked()

  const input = page.getByLabel('Size', { exact: true })
  await expect(input).toBeVisible()
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '1')

  await input.fill('0')
  await input.press('Enter')
  await expect(input).toHaveValue('1')

  await input.fill('1234567890')
  await input.press('Enter')
  await expect(input).toHaveValue('1234567890')

  await input.fill('-1')
  await input.press('Enter')
  await expect(input).toHaveValue('1')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.watermark === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).not.toBeChecked()
  await responsePromise
})

test('Watermark Color', async ({ page }) => {
  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).toBeChecked()

  await expect(page.getByLabel('Pick Color', { exact: true })).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)'
  )
  await expect(page.getByLabel('Color', { exact: true }).first()).toHaveValue(
    '#FFFFFF'
  )

  await page.getByLabel('Color', { exact: true }).first().fill('#3fa156')
  await expect(page.getByLabel('Pick Color')).toHaveCSS(
    'background-color',
    'rgb(63, 161, 86)'
  )

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    await expect(
      page
        .locator(
          `.MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
        )
        .first()
    ).toHaveAttribute('value', color.hex)
    await page
      .locator(
        `.MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
      )
      .first()
      .click()

    await expect(page.getByLabel('Pick Color')).toHaveCSS(
      'background-color',
      `rgb(${color.rgb})`
    )
    await expect(page.getByLabel('Color', { exact: true }).first()).toHaveValue(
      color.hex
    )
  }

  await page.getByLabel('Pick Color').hover()
  await expect(page.getByRole('tooltip', { name: 'Pick Color' })).toBeVisible()

  await page.getByLabel('Pick Color').click()
  await page.getByLabel('hex').fill('FFF000')
  await page.locator('.MuiBackdrop-root').click()
  await expect(page.getByLabel('Pick Color')).toHaveCSS(
    'background-color',
    `rgb(255, 240, 0)`
  )
  await expect(page.getByLabel('Color', { exact: true }).first()).toHaveValue(
    '#fff000'
  )

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.watermark === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).not.toBeChecked()
  await responsePromise
})
