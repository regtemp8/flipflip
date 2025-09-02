import { test, expect } from '@playwright/test'
import { colors, changeSlider } from '../../utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/settings/scene-options')
})

test('Background options', async ({ page }) => {
  await expect(page.getByText('BackgroundBlurred')).toBeVisible()
  await expect(
    page.locator('.MuiCollapse-entered:has-text("Blur: ")')
  ).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).not.toBeVisible()
  await expect(page.getByLabel('Add Color', { exact: true })).not.toBeVisible()
  await expect(
    page.getByLabel('Clear Colors', { exact: true })
  ).not.toBeVisible()

  await page.getByRole('combobox').nth(2).click()
  await page.getByRole('option', { name: 'Solid Color', exact: true }).click()
  await expect(page.getByText('BackgroundSolid Color')).toBeVisible()
  await expect(
    page.locator('.MuiCollapse-entered:has-text("Blur: ")')
  ).not.toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Add Color', { exact: true })).not.toBeVisible()
  await expect(
    page.getByLabel('Clear Colors', { exact: true })
  ).not.toBeVisible()

  await page.getByRole('combobox').nth(2).click()
  await page.getByRole('option', { name: 'Set of Colors', exact: true }).click()
  await expect(page.getByText('BackgroundSet of Colors')).toBeVisible()
  await expect(
    page.locator('.MuiCollapse-entered:has-text("Blur: ")')
  ).not.toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).not.toBeVisible()
  await expect(page.getByLabel('Add Color', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Clear Colors', { exact: true })).toBeVisible()

  await page.getByRole('combobox').nth(2).click()
  await page.getByRole('option', { name: 'Random Colors', exact: true }).click()
  await expect(page.getByText('BackgroundRandom Colors')).toBeVisible()
  await expect(
    page.locator('.MuiCollapse-entered:has-text("Blur: ")')
  ).not.toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).not.toBeVisible()
  await expect(page.getByLabel('Add Color', { exact: true })).not.toBeVisible()
  await expect(
    page.getByLabel('Clear Colors', { exact: true })
  ).not.toBeVisible()

  await page.getByRole('combobox').nth(2).click()
  await page.getByRole('option', { name: 'None', exact: true }).click()
  await expect(page.getByText('BackgroundNone')).toBeVisible()
  await expect(
    page.locator('.MuiCollapse-entered:has-text("Blur: ")')
  ).not.toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).not.toBeVisible()
  await expect(page.getByLabel('Add Color', { exact: true })).not.toBeVisible()
  await expect(
    page.getByLabel('Clear Colors', { exact: true })
  ).not.toBeVisible()

  await page.getByRole('combobox').nth(2).click()
  await page.getByRole('option', { name: 'Blurred', exact: true }).click()
  await expect(page.getByText('BackgroundBlurred')).toBeVisible()
  await expect(
    page.locator('.MuiCollapse-entered:has-text("Blur: ")')
  ).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).not.toBeVisible()
  await expect(page.getByLabel('Add Color', { exact: true })).not.toBeVisible()
  await expect(
    page.getByLabel('Clear Colors', { exact: true })
  ).not.toBeVisible()
})

test('Blurred background', async ({ page }) => {
  await page.getByRole('combobox').nth(2).click()
  await page.getByRole('option', { name: 'Blurred', exact: true }).click()

  const container = page.locator('.MuiCollapse-entered:has-text("Blur: ")')
  const slider = container.locator('.MuiSlider-root')
  await expect(slider).toBeVisible()
  const thumb = slider.locator('.MuiSlider-thumb')
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('8px')
  await expect(page.getByText('Blur: 8px', { exact: true })).toBeVisible()

  await changeSlider(page, thumb, slider, 0)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0px')
  await expect(page.getByText('Blur: 0px', { exact: true })).toBeVisible()

  await changeSlider(page, thumb, slider, 0.03)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1px')
  await expect(page.getByText('Blur: 1px', { exact: true })).toBeVisible()

  await changeSlider(page, thumb, slider, 0.97)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('29px')
  await expect(page.getByText('Blur: 29px', { exact: true })).toBeVisible()

  await changeSlider(page, thumb, slider, 1)
  await thumb.hover()
  await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('30px')
  await expect(page.getByText('Blur: 30px', { exact: true })).toBeVisible()
})

test('Solid Color background', async ({ page }) => {
  await page.getByRole('combobox').nth(2).click()
  await page.getByRole('option', { name: 'Solid Color', exact: true }).click()

  await expect(page.getByLabel('Pick Color', { exact: true })).toHaveCSS(
    'background-color',
    'rgb(0, 0, 0)'
  )
  await expect(page.getByLabel('Color', { exact: true })).toHaveValue('#000000')

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
  await expect(
    page.getByRole('tooltip', { name: 'Pick Color', exact: true })
  ).toBeVisible()

  await page.getByLabel('Pick Color').click()
  await page.getByLabel('hex').fill('FFF000')
  await page.locator('.MuiBackdrop-root').click()
  await expect(page.getByLabel('Pick Color')).toHaveCSS(
    'background-color',
    `rgb(255, 240, 0)`
  )
  await expect(page.getByLabel('Color', { exact: true })).toHaveValue('#fff000')
})

test('Set of Colors background', async ({ page }) => {
  await page.getByRole('combobox').nth(2).click()
  await page.getByRole('option', { name: 'Set of Colors', exact: true }).click()
  await expect(page.locator('#color-0')).not.toBeVisible()
  await expect(page.locator('#color-1')).not.toBeVisible()

  await page.getByLabel('Add Color', { exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Add Color', exact: true })
  ).toBeVisible()

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
  await expect(
    page.getByRole('tooltip', { name: 'Clear Colors', exact: true })
  ).toBeVisible()
  await page.getByLabel('Clear Colors', { exact: true }).click()
  await expect(page.locator('#color-0')).not.toBeVisible()
  await expect(page.locator('#color-1')).not.toBeVisible()
})
