import { test, expect, Page } from '@playwright/test'
import { changeSlider, colors } from '../utils'

let page: Page
const url = 'https://pastebin.com/raw/ZNJ5A40S'
test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await page.goto('/script-library')
  await page.getByTestId('AddIcon').click()
  await expect(page.getByTestId('HttpIcon')).toBeVisible()

  let responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/1' &&
      request.method() === 'GET' &&
      res.status() === 200
    )
  })
  await page.getByTestId('HttpIcon').click()

  await expect(page.locator('#sortable-list li')).toHaveCount(1)
  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/1' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await page.locator('#sortable-list li input').fill(url)
  await expect(page.locator('#sortable-list li input')).toHaveValue(url)
  await page.locator('.MuiDrawer-root').click()
  await responsePromise
})

test.afterAll(async () => {
  await page.goto('/script-library')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/1' &&
      request.method() === 'DELETE' &&
      res.status() === 204
    )
  })
  await page.getByTestId('DeleteIcon').nth(0).click()
  await responsePromise
  await page.close()
})

test.beforeEach(async () => {
  await page.goto('/scripts/1/options')
})

test('Title', async () => {
  await expect(
    page.getByRole('heading', { name: url, exact: true })
  ).toBeVisible()
})

test('Stop at End', async () => {
  const label = 'Stop at End'
  await expect(page.getByLabel(label, { exact: true })).not.toBeChecked()
  await expect(
    page.getByLabel('Next Scene at End', { exact: true })
  ).toBeVisible()

  await page.getByLabel(label, { exact: true }).click()
  await expect(page.getByLabel(label, { exact: true })).toBeChecked()
  await expect(
    page.getByLabel('Next Scene at End', { exact: true })
  ).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.stopAtEnd === false &&
      res.status() === 204
    )
  })
  await page.getByLabel(label, { exact: true }).click()
  await expect(page.getByLabel(label, { exact: true })).not.toBeChecked()
  await expect(
    page.getByLabel('Next Scene at End', { exact: true })
  ).toBeVisible()
  await responsePromise
})

test('Next Scene at End', async () => {
  const label = 'Next Scene at End'
  await expect(page.getByLabel(label, { exact: true })).not.toBeChecked()
  await expect(page.getByLabel('Stop at End', { exact: true })).toBeVisible()

  await page.getByLabel(label, { exact: true }).click()
  await expect(page.getByLabel(label, { exact: true })).toBeChecked()
  await expect(
    page.getByLabel('Stop at End', { exact: true })
  ).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.nextSceneAtEnd === false &&
      res.status() === 204
    )
  })
  await page.getByLabel(label, { exact: true }).click()
  await expect(page.getByLabel(label, { exact: true })).not.toBeChecked()
  await expect(page.getByLabel('Stop at End', { exact: true })).toBeVisible()
  await responsePromise
})

test('Sync Timestamp with Audio', async () => {
  const label = 'Sync Timestamp with Audio'
  await expect(page.getByLabel(label, { exact: true })).toBeChecked()

  await page.getByLabel(label, { exact: true }).click()
  await expect(page.getByLabel(label, { exact: true })).not.toBeChecked()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.syncWithAudio === true &&
      res.status() === 204
    )
  })
  await page.getByLabel(label, { exact: true }).click()
  await expect(page.getByLabel(label, { exact: true })).toBeChecked()
  await responsePromise
})

test('Script Opacity', async () => {
  const container = await page
    .locator('.MuiGrid2-container .MuiGrid2-root:has-text("Script Opacity")')
    .nth(1)

  const slider = container.locator('.MuiSlider-root')
  const thumb = slider.locator('.MuiSlider-thumb')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')
  await expect(container.locator('.MuiTypography-caption')).toHaveText(
    'Script Opacity: 100%'
  )

  await changeSlider(page, thumb, slider, 0)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0%')
  await expect(container.locator('.MuiTypography-caption')).toHaveText(
    'Script Opacity: 0%'
  )

  await changeSlider(page, thumb, slider, 0.01)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1%')
  await expect(container.locator('.MuiTypography-caption')).toHaveText(
    'Script Opacity: 1%'
  )

  await changeSlider(page, thumb, slider, 0.99)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99%')
  await expect(container.locator('.MuiTypography-caption')).toHaveText(
    'Script Opacity: 99%'
  )

  await changeSlider(page, thumb, slider, 1)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')
  await expect(container.locator('.MuiTypography-caption')).toHaveText(
    'Script Opacity: 100%'
  )
})

test('Blink Font', async () => {
  await expect(page.getByLabel('Blink Font', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Blink Font', { exact: true })).toHaveValue('')

  await page.getByLabel('Blink Font', { exact: true }).click()
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.locator('#blink-font-option-13').click()
  await expect(page.getByLabel('Blink Font', { exact: true })).toHaveValue(
    'Agbalumo'
  )

  await page.getByLabel('Blink Font', { exact: true }).click()
  await expect(page.locator('#blink-font-option-13')).toHaveAttribute(
    'aria-selected',
    'true'
  )
  await page.keyboard.press('ArrowUp')
  await page.locator('#blink-font-option-12').click()
  await expect(page.getByLabel('Blink Font', { exact: true })).toHaveValue(
    'Afacad'
  )

  await page.getByLabel('Clear', { exact: true }).nth(0).click()
  await expect(page.getByLabel('Blink Font', { exact: true })).toHaveValue('')

  await page.getByLabel('Blink Font', { exact: true }).fill('cree')
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
  await expect(page.getByLabel('Blink Font', { exact: true })).toHaveValue(
    'Sancreek'
  )

  await page.getByLabel('Blink Font', { exact: true }).fill('')
  await expect(page.getByLabel('Blink Font', { exact: true })).toHaveValue('')
})

test('Caption Font', async () => {
  await expect(page.getByLabel('Caption Font', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Caption Font', { exact: true })).toHaveValue('')

  await page.getByLabel('Caption Font', { exact: true }).click()
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.locator('#caption-font-option-13').click()
  await expect(page.getByLabel('Caption Font', { exact: true })).toHaveValue(
    'Agbalumo'
  )

  await page.getByLabel('Caption Font', { exact: true }).click()
  await expect(page.locator('#caption-font-option-13')).toHaveAttribute(
    'aria-selected',
    'true'
  )
  await page.keyboard.press('ArrowUp')
  await page.locator('#caption-font-option-12').click()
  await expect(page.getByLabel('Caption Font', { exact: true })).toHaveValue(
    'Afacad'
  )

  await page.getByLabel('Clear', { exact: true }).nth(1).click()
  await expect(page.getByLabel('Caption Font', { exact: true })).toHaveValue('')

  await page.getByLabel('Caption Font', { exact: true }).fill('cree')
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
  await expect(page.getByLabel('Caption Font', { exact: true })).toHaveValue(
    'Sancreek'
  )

  await page.getByLabel('Caption Font', { exact: true }).fill('')
  await expect(page.getByLabel('Caption Font', { exact: true })).toHaveValue('')
})

test('Big Caption Font', async () => {
  await expect(
    page.getByLabel('Big Caption Font', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByLabel('Big Caption Font', { exact: true })
  ).toHaveValue('')

  await page.getByLabel('Big Caption Font', { exact: true }).click()
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.locator('#captionbig-font-option-13').click()
  await expect(
    page.getByLabel('Big Caption Font', { exact: true })
  ).toHaveValue('Agbalumo')

  await page.getByLabel('Big Caption Font', { exact: true }).click()
  await expect(page.locator('#captionbig-font-option-13')).toHaveAttribute(
    'aria-selected',
    'true'
  )
  await page.keyboard.press('ArrowUp')
  await page.locator('#captionbig-font-option-12').click()
  await expect(
    page.getByLabel('Big Caption Font', { exact: true })
  ).toHaveValue('Afacad')

  await page.getByLabel('Clear', { exact: true }).nth(2).click()
  await expect(
    page.getByLabel('Big Caption Font', { exact: true })
  ).toHaveValue('')

  await page.getByLabel('Big Caption Font', { exact: true }).fill('cree')
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
  await expect(
    page.getByLabel('Big Caption Font', { exact: true })
  ).toHaveValue('Sancreek')

  await page.getByLabel('Big Caption Font', { exact: true }).fill('')
  await expect(
    page.getByLabel('Big Caption Font', { exact: true })
  ).toHaveValue('')
})

test('Count Font', async () => {
  await expect(page.getByLabel('Count Font', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Count Font', { exact: true })).toHaveValue('')

  await page.getByLabel('Count Font', { exact: true }).click()
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.locator('#count-font-option-13').click()
  await expect(page.getByLabel('Count Font', { exact: true })).toHaveValue(
    'Agbalumo'
  )

  await page.getByLabel('Count Font', { exact: true }).click()
  await expect(page.locator('#count-font-option-13')).toHaveAttribute(
    'aria-selected',
    'true'
  )
  await page.keyboard.press('ArrowUp')
  await page.locator('#count-font-option-12').click()
  await expect(page.getByLabel('Count Font', { exact: true })).toHaveValue(
    'Afacad'
  )

  await page.getByLabel('Clear', { exact: true }).nth(3).click()
  await expect(page.getByLabel('Count Font', { exact: true })).toHaveValue('')

  await page.getByLabel('Count Font', { exact: true }).fill('cree')
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
  await expect(page.getByLabel('Count Font', { exact: true })).toHaveValue(
    'Sancreek'
  )

  await page.getByLabel('Count Font', { exact: true }).fill('')
  await expect(page.getByLabel('Count Font', { exact: true })).toHaveValue('')
})

test('Blink Font Size', async () => {
  const input = page.getByLabel('Size', { exact: true }).nth(0)
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '1')
  await expect(input).toHaveValue('20')

  let responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/blink' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await input.fill('0')
  await input.press('Enter')
  await expect(input).toHaveValue('1')
  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/blink' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await input.fill('1234567890')
  await input.press('Enter')
  await expect(input).toHaveValue('1234567890')
  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/blink' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await input.fill('-1')
  await input.press('Enter')
  await expect(input).toHaveValue('1')
  await responsePromise
})

test('Caption Font Size', async () => {
  const input = page.getByLabel('Size', { exact: true }).nth(1)
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '1')
  await expect(input).toHaveValue('8')

  let responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/caption' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await input.fill('0')
  await input.press('Enter')
  await expect(input).toHaveValue('1')
  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/caption' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await input.fill('1234567890')
  await input.press('Enter')
  await expect(input).toHaveValue('1234567890')
  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/caption' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await input.fill('-1')
  await input.press('Enter')
  await expect(input).toHaveValue('1')
  await responsePromise
})

test('Big Caption Font Size', async () => {
  const input = page.getByLabel('Size', { exact: true }).nth(2)
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '1')
  await expect(input).toHaveValue('12')

  let responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/captionBig' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await input.fill('0')
  await input.press('Enter')
  await expect(input).toHaveValue('1')
  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/captionBig' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await input.fill('1234567890')
  await input.press('Enter')
  await expect(input).toHaveValue('1234567890')
  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/captionBig' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await input.fill('-1')
  await input.press('Enter')
  await expect(input).toHaveValue('1')
  await responsePromise
})

test('Count Font Size', async () => {
  const input = page.getByLabel('Size', { exact: true }).nth(3)
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '1')
  await expect(input).toHaveValue('20')

  let responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/count' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await input.fill('0')
  await input.press('Enter')
  await expect(input).toHaveValue('1')
  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/count' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await input.fill('1234567890')
  await input.press('Enter')
  await expect(input).toHaveValue('1234567890')
  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/count' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await input.fill('-1')
  await input.press('Enter')
  await expect(input).toHaveValue('1')
  await responsePromise
})

test('Blink Font Color', async () => {
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(0)).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)'
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(0)).toHaveValue(
    '#FFFFFF'
  )

  await page.getByLabel('Color', { exact: true }).nth(0).fill('#3fa156')
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(0)).toHaveCSS(
    'background-color',
    'rgb(63, 161, 86)'
  )

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    await expect(
      page
        .locator(
          `.MuiGrid2-root:nth-child(2) .MuiCard-root .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
        )
        .nth(0)
    ).toHaveAttribute('value', color.hex)
    await page
      .locator(
        `.MuiGrid2-root:nth-child(2) .MuiCard-root .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
      )
      .nth(0)
      .click()

    await expect(
      page.getByLabel('Pick Color', { exact: true }).nth(0)
    ).toHaveCSS('background-color', `rgb(${color.rgb})`)
    await expect(page.getByLabel('Color', { exact: true }).nth(0)).toHaveValue(
      color.hex
    )
  }

  await page.getByLabel('Pick Color', { exact: true }).nth(0).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Pick Color', exact: true })
  ).toBeVisible()

  await page.getByLabel('Pick Color', { exact: true }).nth(0).click()
  await page.getByLabel('hex').nth(0).fill('FFF000')
  const box = await page
    .getByLabel('Pick Color', { exact: true })
    .nth(0)
    .boundingBox()
  if (box == null) {
    throw new Error('Failed to get button bounding box')
  }

  await page.mouse.click(box.x, box.y, { button: 'left' })
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(0)).toHaveCSS(
    'background-color',
    `rgb(255, 240, 0)`
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(0)).toHaveValue(
    '#fff000'
  )
})

test('Caption Font Color', async () => {
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(2)).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)'
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(2)).toHaveValue(
    '#FFFFFF'
  )

  await page.getByLabel('Color', { exact: true }).nth(2).fill('#3fa156')
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(2)).toHaveCSS(
    'background-color',
    'rgb(63, 161, 86)'
  )

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    await expect(
      page
        .locator(
          `.MuiGrid2-root:nth-child(3) .MuiCard-root .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
        )
        .nth(0)
    ).toHaveAttribute('value', color.hex)
    await page
      .locator(
        `.MuiGrid2-root:nth-child(3) .MuiCard-root .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
      )
      .nth(0)
      .click()

    await expect(
      page.getByLabel('Pick Color', { exact: true }).nth(2)
    ).toHaveCSS('background-color', `rgb(${color.rgb})`)
    await expect(page.getByLabel('Color', { exact: true }).nth(2)).toHaveValue(
      color.hex
    )
  }

  await page.getByLabel('Pick Color', { exact: true }).nth(2).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Pick Color', exact: true })
  ).toBeVisible()

  await page.getByLabel('Pick Color', { exact: true }).nth(2).click()
  await page.getByLabel('hex').nth(2).fill('FFF000')
  const box = await page
    .getByLabel('Pick Color', { exact: true })
    .nth(2)
    .boundingBox()
  if (box == null) {
    throw new Error('Failed to get button bounding box')
  }

  await page.mouse.click(box.x, box.y, { button: 'left' })
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(2)).toHaveCSS(
    'background-color',
    `rgb(255, 240, 0)`
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(2)).toHaveValue(
    '#fff000'
  )
})

test('Big Caption Font Color', async () => {
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(4)).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)'
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(4)).toHaveValue(
    '#FFFFFF'
  )

  await page.getByLabel('Color', { exact: true }).nth(4).fill('#3fa156')
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(4)).toHaveCSS(
    'background-color',
    'rgb(63, 161, 86)'
  )

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    await expect(
      page
        .locator(
          `.MuiGrid2-root:nth-child(4) .MuiCard-root .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
        )
        .nth(0)
    ).toHaveAttribute('value', color.hex)
    await page
      .locator(
        `.MuiGrid2-root:nth-child(4) .MuiCard-root .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
      )
      .nth(0)
      .click()

    await expect(
      page.getByLabel('Pick Color', { exact: true }).nth(4)
    ).toHaveCSS('background-color', `rgb(${color.rgb})`)
    await expect(page.getByLabel('Color', { exact: true }).nth(4)).toHaveValue(
      color.hex
    )
  }

  await page.getByLabel('Pick Color', { exact: true }).nth(4).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Pick Color', exact: true })
  ).toBeVisible()

  await page.getByLabel('Pick Color', { exact: true }).nth(4).click()
  await page.getByLabel('hex').nth(4).fill('FFF000')
  const box = await page
    .getByLabel('Pick Color', { exact: true })
    .nth(4)
    .boundingBox()
  if (box == null) {
    throw new Error('Failed to get button bounding box')
  }

  await page.mouse.click(box.x, box.y, { button: 'left' })
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(4)).toHaveCSS(
    'background-color',
    `rgb(255, 240, 0)`
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(4)).toHaveValue(
    '#fff000'
  )
})

test('Count Font Color', async () => {
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(6)).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)'
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(6)).toHaveValue(
    '#FFFFFF'
  )

  await page.getByLabel('Color', { exact: true }).nth(6).fill('#3fa156')
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(6)).toHaveCSS(
    'background-color',
    'rgb(63, 161, 86)'
  )

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    await expect(
      page
        .locator(
          `.MuiGrid2-root:nth-child(5) .MuiCard-root .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
        )
        .nth(0)
    ).toHaveAttribute('value', color.hex)
    await page
      .locator(
        `.MuiGrid2-root:nth-child(5) .MuiCard-root .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
      )
      .nth(0)
      .click()

    await expect(
      page.getByLabel('Pick Color', { exact: true }).nth(6)
    ).toHaveCSS('background-color', `rgb(${color.rgb})`)
    await expect(page.getByLabel('Color', { exact: true }).nth(6)).toHaveValue(
      color.hex
    )
  }

  await page.getByLabel('Pick Color', { exact: true }).nth(6).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Pick Color', exact: true })
  ).toBeVisible()

  await page.getByLabel('Pick Color', { exact: true }).nth(6).click()
  await page.getByLabel('hex').nth(6).fill('FFF000')
  const box = await page
    .getByLabel('Pick Color', { exact: true })
    .nth(6)
    .boundingBox()
  if (box == null) {
    throw new Error('Failed to get button bounding box')
  }

  await page.mouse.click(box.x, box.y, { button: 'left' })
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(6)).toHaveCSS(
    'background-color',
    `rgb(255, 240, 0)`
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(6)).toHaveValue(
    '#fff000'
  )
})

test('Blink Border', async () => {
  await expect(
    page.getByLabel('Border', { exact: true }).nth(0)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Border', { exact: true }).nth(0)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Width', { exact: true }).nth(0)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Pick Color', { exact: true }).nth(1)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Color', { exact: true }).nth(1)
  ).not.toBeVisible()

  await page.getByLabel('Border', { exact: true }).nth(0).click()
  await expect(page.getByLabel('Border', { exact: true }).nth(0)).toBeChecked()
  await expect(page.getByLabel('Width', { exact: true }).nth(0)).toBeVisible()
  await expect(
    page.getByLabel('Pick Color', { exact: true }).nth(1)
  ).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true }).nth(1)).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/blink' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.border === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Border', { exact: true }).nth(0).click()
  await expect(
    page.getByLabel('Border', { exact: true }).nth(0)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Width', { exact: true }).nth(0)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Pick Color', { exact: true }).nth(1)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Color', { exact: true }).nth(1)
  ).not.toBeVisible()
  await responsePromise
})

test('Caption Border', async () => {
  await expect(
    page.getByLabel('Border', { exact: true }).nth(1)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Border', { exact: true }).nth(1)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Width', { exact: true }).nth(1)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Pick Color', { exact: true }).nth(3)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Color', { exact: true }).nth(3)
  ).not.toBeVisible()

  await page.getByLabel('Border', { exact: true }).nth(1).click()
  await expect(page.getByLabel('Border', { exact: true }).nth(1)).toBeChecked()
  await expect(page.getByLabel('Width', { exact: true }).nth(1)).toBeVisible()
  await expect(
    page.getByLabel('Pick Color', { exact: true }).nth(3)
  ).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true }).nth(3)).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/caption' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.border === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Border', { exact: true }).nth(1).click()
  await expect(
    page.getByLabel('Border', { exact: true }).nth(1)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Width', { exact: true }).nth(1)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Pick Color', { exact: true }).nth(3)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Color', { exact: true }).nth(3)
  ).not.toBeVisible()
  await responsePromise
})

test('Big Caption Border', async () => {
  await expect(
    page.getByLabel('Border', { exact: true }).nth(2)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Border', { exact: true }).nth(2)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Width', { exact: true }).nth(2)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Pick Color', { exact: true }).nth(5)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Color', { exact: true }).nth(5)
  ).not.toBeVisible()

  await page.getByLabel('Border', { exact: true }).nth(2).click()
  await expect(page.getByLabel('Border', { exact: true }).nth(2)).toBeChecked()
  await expect(page.getByLabel('Width', { exact: true }).nth(2)).toBeVisible()
  await expect(
    page.getByLabel('Pick Color', { exact: true }).nth(5)
  ).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true }).nth(5)).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/captionBig' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.border === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Border', { exact: true }).nth(2).click()
  await expect(
    page.getByLabel('Border', { exact: true }).nth(2)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Width', { exact: true }).nth(2)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Pick Color', { exact: true }).nth(5)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Color', { exact: true }).nth(5)
  ).not.toBeVisible()
  await responsePromise
})

test('Count Border', async () => {
  await expect(
    page.getByLabel('Border', { exact: true }).nth(3)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Border', { exact: true }).nth(3)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Width', { exact: true }).nth(3)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Pick Color', { exact: true }).nth(7)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Color', { exact: true }).nth(7)
  ).not.toBeVisible()

  await page.getByLabel('Border', { exact: true }).nth(3).click()
  await expect(page.getByLabel('Border', { exact: true }).nth(3)).toBeChecked()
  await expect(page.getByLabel('Width', { exact: true }).nth(3)).toBeVisible()
  await expect(
    page.getByLabel('Pick Color', { exact: true }).nth(7)
  ).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true }).nth(7)).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/count' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.border === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Border', { exact: true }).nth(3).click()
  await expect(
    page.getByLabel('Border', { exact: true }).nth(3)
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Width', { exact: true }).nth(3)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Pick Color', { exact: true }).nth(7)
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Color', { exact: true }).nth(7)
  ).not.toBeVisible()
  await responsePromise
})

test('Blink Border Width', async () => {
  await page.getByLabel('Border', { exact: true }).nth(0).click()
  await expect(page.getByLabel('Width', { exact: true }).nth(0)).toBeVisible()

  const input = page.getByLabel('Width', { exact: true }).nth(0)
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '1')
  await expect(input).toHaveValue('5')

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
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/blink' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.border === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Border', { exact: true }).nth(0).click()
  await responsePromise
})

test('Caption Border Width', async () => {
  await page.getByLabel('Border', { exact: true }).nth(1).click()
  await expect(page.getByLabel('Width', { exact: true }).nth(1)).toBeVisible()

  const input = page.getByLabel('Width', { exact: true }).nth(1)
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '1')
  await expect(input).toHaveValue('3')

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
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/caption' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.border === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Border', { exact: true }).nth(1).click()
  await responsePromise
})

test('Big Caption Border Width', async () => {
  await page.getByLabel('Border', { exact: true }).nth(2).click()
  await expect(page.getByLabel('Width', { exact: true }).nth(2)).toBeVisible()

  const input = page.getByLabel('Width', { exact: true }).nth(2)
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '1')
  await expect(input).toHaveValue('4')

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
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/captionBig' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.border === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Border', { exact: true }).nth(2).click()
  await responsePromise
})

test('Count Border Width', async () => {
  await page.getByLabel('Border', { exact: true }).nth(3).click()
  await expect(page.getByLabel('Width', { exact: true }).nth(3)).toBeVisible()

  const input = page.getByLabel('Width', { exact: true }).nth(3)
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '1')
  await expect(input).toHaveValue('5')

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
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/count' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.border === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Border', { exact: true }).nth(3).click()
  await responsePromise
})

test('Blink Border Color', async () => {
  await page.getByLabel('Border', { exact: true }).nth(0).click()
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(1)).toHaveCSS(
    'background-color',
    'rgb(0, 0, 0)'
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(1)).toHaveValue(
    '#000000'
  )

  await page.getByLabel('Color', { exact: true }).nth(1).fill('#3fa156')
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(1)).toHaveCSS(
    'background-color',
    'rgb(63, 161, 86)'
  )

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    await expect(
      page
        .locator(
          `.MuiGrid2-root:nth-child(2) .MuiCard-root .MuiCollapse-entered .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
        )
        .nth(0)
    ).toHaveAttribute('value', color.hex)
    await page
      .locator(
        `.MuiGrid2-root:nth-child(2) .MuiCard-root .MuiCollapse-entered .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
      )
      .nth(0)
      .click()

    await expect(
      page.getByLabel('Pick Color', { exact: true }).nth(1)
    ).toHaveCSS('background-color', `rgb(${color.rgb})`)
    await expect(page.getByLabel('Color', { exact: true }).nth(1)).toHaveValue(
      color.hex
    )
  }

  await page.getByLabel('Pick Color', { exact: true }).nth(1).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Pick Color', exact: true })
  ).toBeVisible()

  await page.getByLabel('Pick Color', { exact: true }).nth(1).click()
  await page.getByLabel('hex').nth(1).fill('FFF000')
  const box = await page
    .getByLabel('Pick Color', { exact: true })
    .nth(0)
    .boundingBox()
  if (box == null) {
    throw new Error('Failed to get button bounding box')
  }

  await page.mouse.click(box.x, box.y, { button: 'left' })
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(1)).toHaveCSS(
    'background-color',
    `rgb(255, 240, 0)`
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(1)).toHaveValue(
    '#fff000'
  )

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/blink' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.border === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Border', { exact: true }).nth(0).click()
  await responsePromise
})

test('Caption Border Color', async () => {
  await page.getByLabel('Border', { exact: true }).nth(1).click()
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(3)).toHaveCSS(
    'background-color',
    'rgb(0, 0, 0)'
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(3)).toHaveValue(
    '#000000'
  )

  await page.getByLabel('Color', { exact: true }).nth(3).fill('#3fa156')
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(3)).toHaveCSS(
    'background-color',
    'rgb(63, 161, 86)'
  )

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    await expect(
      page
        .locator(
          `.MuiGrid2-root:nth-child(3) .MuiCard-root .MuiCollapse-entered .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
        )
        .nth(0)
    ).toHaveAttribute('value', color.hex)
    await page
      .locator(
        `.MuiGrid2-root:nth-child(3) .MuiCard-root .MuiCollapse-entered .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
      )
      .nth(0)
      .click()

    await expect(
      page.getByLabel('Pick Color', { exact: true }).nth(3)
    ).toHaveCSS('background-color', `rgb(${color.rgb})`)
    await expect(page.getByLabel('Color', { exact: true }).nth(3)).toHaveValue(
      color.hex
    )
  }

  await page.getByLabel('Pick Color', { exact: true }).nth(3).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Pick Color', exact: true })
  ).toBeVisible()

  await page.getByLabel('Pick Color', { exact: true }).nth(3).click()
  await page.getByLabel('hex').nth(3).fill('FFF000')
  const box = await page
    .getByLabel('Pick Color', { exact: true })
    .nth(2)
    .boundingBox()
  if (box == null) {
    throw new Error('Failed to get button bounding box')
  }

  await page.mouse.click(box.x, box.y, { button: 'left' })
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(3)).toHaveCSS(
    'background-color',
    `rgb(255, 240, 0)`
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(3)).toHaveValue(
    '#fff000'
  )

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/caption' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.border === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Border', { exact: true }).nth(1).click()
  await responsePromise
})

test('Big Caption Border Color', async () => {
  await page.getByLabel('Border', { exact: true }).nth(2).click()
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(5)).toHaveCSS(
    'background-color',
    'rgb(0, 0, 0)'
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(5)).toHaveValue(
    '#000000'
  )

  await page.getByLabel('Color', { exact: true }).nth(5).fill('#3fa156')
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(5)).toHaveCSS(
    'background-color',
    'rgb(63, 161, 86)'
  )

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    await expect(
      page
        .locator(
          `.MuiGrid2-root:nth-child(4) .MuiCard-root .MuiCollapse-entered .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
        )
        .nth(0)
    ).toHaveAttribute('value', color.hex)
    await page
      .locator(
        `.MuiGrid2-root:nth-child(4) .MuiCard-root .MuiCollapse-entered .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
      )
      .nth(0)
      .click()

    await expect(
      page.getByLabel('Pick Color', { exact: true }).nth(5)
    ).toHaveCSS('background-color', `rgb(${color.rgb})`)
    await expect(page.getByLabel('Color', { exact: true }).nth(5)).toHaveValue(
      color.hex
    )
  }

  await page.getByLabel('Pick Color', { exact: true }).nth(5).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Pick Color', exact: true })
  ).toBeVisible()

  await page.getByLabel('Pick Color', { exact: true }).nth(5).click()
  await page.getByLabel('hex').nth(5).fill('FFF000')
  const box = await page
    .getByLabel('Pick Color', { exact: true })
    .nth(4)
    .boundingBox()
  if (box == null) {
    throw new Error('Failed to get button bounding box')
  }

  await page.mouse.click(box.x, box.y, { button: 'left' })
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(5)).toHaveCSS(
    'background-color',
    `rgb(255, 240, 0)`
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(5)).toHaveValue(
    '#fff000'
  )

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/captionBig' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.border === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Border', { exact: true }).nth(2).click()
  await responsePromise
})

test('Count Border Color', async () => {
  await page.getByLabel('Border', { exact: true }).nth(3).click()
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(7)).toHaveCSS(
    'background-color',
    'rgb(0, 0, 0)'
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(7)).toHaveValue(
    '#000000'
  )

  await page.getByLabel('Color', { exact: true }).nth(7).fill('#3fa156')
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(7)).toHaveCSS(
    'background-color',
    'rgb(63, 161, 86)'
  )

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    await expect(
      page
        .locator(
          `.MuiGrid2-root:nth-child(5) .MuiCard-root .MuiCollapse-entered .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
        )
        .nth(0)
    ).toHaveAttribute('value', color.hex)
    await page
      .locator(
        `.MuiGrid2-root:nth-child(5) .MuiCard-root .MuiCollapse-entered .MuiGrid2-root > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
      )
      .nth(0)
      .click()

    await expect(
      page.getByLabel('Pick Color', { exact: true }).nth(7)
    ).toHaveCSS('background-color', `rgb(${color.rgb})`)
    await expect(page.getByLabel('Color', { exact: true }).nth(7)).toHaveValue(
      color.hex
    )
  }

  await page.getByLabel('Pick Color', { exact: true }).nth(7).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Pick Color', exact: true })
  ).toBeVisible()

  await page.getByLabel('Pick Color', { exact: true }).nth(7).click()
  await page.getByLabel('hex').nth(7).fill('FFF000')
  const box = await page
    .getByLabel('Pick Color', { exact: true })
    .nth(6)
    .boundingBox()
  if (box == null) {
    throw new Error('Failed to get button bounding box')
  }

  await page.mouse.click(box.x, box.y, { button: 'left' })
  await expect(page.getByLabel('Pick Color', { exact: true }).nth(7)).toHaveCSS(
    'background-color',
    `rgb(255, 240, 0)`
  )
  await expect(page.getByLabel('Color', { exact: true }).nth(7)).toHaveValue(
    '#fff000'
  )

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname ===
        '/api/caption-scripts/1/font-settings/count' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.border === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Border', { exact: true }).nth(3).click()
  await responsePromise
})
