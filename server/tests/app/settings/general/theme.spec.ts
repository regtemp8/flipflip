import { test, expect } from '@playwright/test'

test.use({ storageState: 'server/tests/data/session.json' })
test.beforeEach(async ({ page }) => {
  await page.goto('/settings')
})

type Color = {
  name: string
  hex: string
  rgb: string
}

const colors: Color[] = [
  { name: 'red', hex: '#f44336', rgb: '244, 67, 54' },
  { name: 'pink', hex: '#e91e63', rgb: '233, 30, 99' },
  { name: 'purple', hex: '#9c27b0', rgb: '156, 39, 176' },
  { name: 'deep purple', hex: '#673ab7', rgb: '103, 58, 183' },
  { name: 'indigo', hex: '#3f51b5', rgb: '63, 81, 181' },
  { name: 'blue', hex: '#2196f3', rgb: '33, 150, 243' },
  { name: 'light blue', hex: '#03a9f4', rgb: '3, 169, 244' },
  { name: 'cyan', hex: '#00bcd4', rgb: '0, 188, 212' },
  { name: 'teal', hex: '#009688', rgb: '0, 150, 136' },
  { name: 'green', hex: '#4caf50', rgb: '76, 175, 80' },
  { name: 'light green', hex: '#8bc34a', rgb: '139, 195, 74' },
  { name: 'lime', hex: '#cddc39', rgb: '205, 220, 57' },
  { name: 'yellow', hex: '#ffeb3b', rgb: '255, 235, 59' },
  { name: 'amber', hex: '#ffc107', rgb: '255, 193, 7' },
  { name: 'orange', hex: '#ff9800', rgb: '255, 152, 0' },
  { name: 'deep orange', hex: '#ff5722', rgb: '255, 87, 34' },
  { name: 'brown', hex: '#795548', rgb: '121, 85, 72' },
  { name: 'grey', hex: '#9e9e9e', rgb: '158, 158, 158' },
  { name: 'blue grey', hex: '#607d8b', rgb: '96, 125, 139' },
  { name: 'white', hex: '#fff', rgb: '255, 255, 255' },
  { name: 'black', hex: '#000', rgb: '0, 0, 0' }
]

test('Dark Mode setting', async ({ page }) => {
  await expect(page.getByLabel('Dark Mode', { exact: true })).not.toBeChecked()
  await expect(page.locator('.MuiDrawer-root > .MuiPaper-root')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)'
  )
  await expect(
    page.locator('main .MuiContainer-root .MuiPaper-root').first()
  ).toHaveCSS('background-color', 'rgb(255, 255, 255)')

  await page.getByLabel('Dark Mode', { exact: true }).check()
  await expect(page.getByLabel('Dark Mode', { exact: true })).toBeChecked()
  await expect(page.locator('.MuiDrawer-root > .MuiPaper-root')).toHaveCSS(
    'background-color',
    'rgb(18, 18, 18)'
  )
  await expect(
    page.locator('main .MuiContainer-root .MuiPaper-root').first()
  ).toHaveCSS('background-color', 'rgb(18, 18, 18)')

  await page.getByLabel('Dark Mode', { exact: true }).uncheck()
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
        .filter({ hasText: /^Backups: --$/ })
        .nth(1)
    ).toHaveCSS('color', `rgb(${indigo.rgb})`)
  })

  colors.forEach((color, index) => {
    test(`Pick ${color.name} as primary color`, async ({ page }) => {
      await expect(
        page
          .locator(
            `.css-grxim5-themePicker > div > div:nth-child(2) > div > div:nth-child(${index + 1}) > .MuiButtonBase-root`
          )
          .first()
      ).toHaveAttribute('value', color.hex)
      await page
        .locator(
          `.css-grxim5-themePicker > div > div:nth-child(2) > div > div:nth-child(${index + 1}) > .MuiButtonBase-root`
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
          .filter({ hasText: /^Backups: --$/ })
          .nth(1)
      ).toHaveCSS('color', `rgb(${color.rgb})`)
    })
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
        .filter({ hasText: /^Latest: --$/ })
        .nth(1)
    ).toHaveCSS('color', `rgb(${pink.rgb})`)
  })

  colors.forEach((color, index) => {
    test(`Pick ${color.name} as secondary color`, async ({ page }) => {
      await expect(
        page
          .locator(
            `.MuiCardContent-root > div:nth-child(3) > div > div:nth-child(2) > div > div:nth-child(${index + 1}) > .MuiButtonBase-root`
          )
          .first()
      ).toHaveAttribute('value', color.hex)
      await page
        .locator(
          `.MuiCardContent-root > div:nth-child(3) > div > div:nth-child(2) > div > div:nth-child(${index + 1}) > .MuiButtonBase-root`
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
          .filter({ hasText: /^Latest: --$/ })
          .nth(1)
      ).toHaveCSS('color', `rgb(${color.rgb})`)
    })
  })
})
