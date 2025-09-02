import { test, expect } from '@playwright/test'
import { Color, colors } from '../../utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/settings')
})

test('Dark Mode setting', async ({ page }) => {
  await expect(page.getByLabel('Dark Mode', { exact: true })).not.toBeChecked()
  await expect(page.locator('.MuiDrawer-root > .MuiPaper-root')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)'
  )
  await expect(
    page.locator('main .MuiContainer-root .MuiPaper-root').first()
  ).toHaveCSS('background-color', 'rgb(255, 255, 255)')

  await page.getByLabel('Dark Mode', { exact: true }).click()
  await expect(page.getByLabel('Dark Mode', { exact: true })).toBeChecked()
  await expect(page.locator('.MuiDrawer-root > .MuiPaper-root')).toHaveCSS(
    'background-color',
    'rgb(18, 18, 18)'
  )
  await expect(
    page.locator('main .MuiContainer-root .MuiPaper-root').first()
  ).toHaveCSS('background-color', 'rgb(18, 18, 18)')

  await page.getByLabel('Dark Mode', { exact: true }).click()
  await expect(page.getByLabel('Dark Mode', { exact: true })).not.toBeChecked()
  await expect(page.locator('.MuiDrawer-root > .MuiPaper-root')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)'
  )
  await expect(
    page.locator('main .MuiContainer-root .MuiPaper-root').first()
  ).toHaveCSS('background-color', 'rgb(255, 255, 255)')
})

test.describe('Primary color theme setting', () => {
  test('Primary color input is readonly', async ({ page }) => {
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Primary ColorColor$/ })
        .getByLabel('Color')
    ).toHaveAttribute('readonly')
  })

  test('Default primary color is indigo', async ({ page }) => {
    const indigo = colors.find((c) => c.name === 'indigo') as Color
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Primary ColorColor$/ })
        .getByLabel('Color')
    ).toHaveValue(indigo.hex)
    await expect(
      page
        .locator('.css-grxim5-themePicker > div > div > .MuiButtonBase-root')
        .first()
    ).toHaveCSS('background-color', `rgb(${indigo.rgb})`)
    await expect(page.locator('header')).toHaveCSS(
      'background-color',
      `rgb(${indigo.rgb})`
    )
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Backups: 29$/ })
        .nth(1)
    ).toHaveCSS('color', `rgb(${indigo.rgb})`)
  })

  test('Pick colors', async ({ page }) => {
    for (let i = 0; i < colors.length; i++) {
      const color = colors[i]
      await expect(
        page
          .locator(
            `.css-grxim5-themePicker > div > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
          )
          .first()
      ).toHaveAttribute('value', color.hex)
      await page
        .locator(
          `.css-grxim5-themePicker > div > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
        )
        .first()
        .click()

      await expect(
        page
          .locator('div')
          .filter({ hasText: /^Primary ColorColor$/ })
          .getByLabel('Color')
      ).toHaveValue(color.hex)
      await expect(
        page
          .locator('.css-grxim5-themePicker > div > div > .MuiButtonBase-root')
          .first()
      ).toHaveCSS('background-color', `rgb(${color.rgb})`)
      await expect(page.locator('header')).toHaveCSS(
        'background-color',
        `rgb(${color.rgb})`
      )
      await expect(
        page
          .locator('div')
          .filter({ hasText: /^Backups: 29$/ })
          .nth(1)
      ).toHaveCSS('color', `rgb(${color.rgb})`)
    }
  })
})

test.describe('Secondary color theme setting', () => {
  test('Secondary color input is readonly', async ({ page }) => {
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Secondary ColorColor$/ })
        .getByLabel('Color')
    ).toHaveAttribute('readonly')
  })

  test('Default secondary color is pink', async ({ page }) => {
    const pink = colors.find((c) => c.name === 'pink') as Color
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Secondary ColorColor$/ })
        .getByLabel('Color')
    ).toHaveValue(pink.hex)
    await expect(
      page.locator(
        '.MuiCardContent-root > div:nth-child(3) > div > div > .MuiButtonBase-root'
      )
    ).toHaveCSS('background-color', `rgb(${pink.rgb})`)
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Latest: 10\/18\/2024, 12:00:00 AM \(224 KB\)$/ })
        .nth(1)
    ).toHaveCSS('color', `rgb(${pink.rgb})`)
  })

  test('Pick colors', async ({ page }) => {
    for (let i = 0; i < colors.length; i++) {
      const color = colors[i]
      await expect(
        page
          .locator(
            `.MuiCardContent-root > div:nth-child(3) > div > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
          )
          .first()
      ).toHaveAttribute('value', color.hex)
      await page
        .locator(
          `.MuiCardContent-root > div:nth-child(3) > div > div:nth-child(2) > div > div:nth-child(${i + 1}) > .MuiButtonBase-root`
        )
        .first()
        .click()

      await expect(
        page
          .locator('div')
          .filter({ hasText: /^Secondary ColorColor$/ })
          .getByLabel('Color')
      ).toHaveValue(color.hex)
      await expect(
        page.locator(
          '.MuiCardContent-root > div:nth-child(3) > div > div > .MuiButtonBase-root'
        )
      ).toHaveCSS('background-color', `rgb(${color.rgb})`)
      await expect(
        page
          .locator('div')
          .filter({ hasText: /^Latest: 10\/18\/2024, 12:00:00 AM \(224 KB\)$/ })
          .nth(1)
      ).toHaveCSS('color', `rgb(${color.rgb})`)
    }
  })
})
