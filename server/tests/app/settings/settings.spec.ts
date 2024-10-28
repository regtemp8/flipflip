import { test, expect } from '@playwright/test'

test.use({ storageState: 'server/tests/session.json' })
test.beforeEach(async ({ page }) => {
  await page.goto('/settings')
})

test('Settings navigation', async ({ page }) => {
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '192px')

  await page.locator('#vertical-tab-0').click()
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '0px')
  await expect(page).toHaveURL('/settings/scene-options')

  await page.locator('#vertical-tab-1').click()
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '96px')
  await expect(page).toHaveURL('/settings/scene-effects')

  await page.locator('#vertical-tab-2').click()
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '192px')
  await expect(page).toHaveURL('/settings/general')

  await expect(page.locator('#vertical-tab-0')).toHaveText('')
  await expect(page.locator('#vertical-tab-1')).toHaveText('')
  await expect(page.locator('#vertical-tab-2')).toHaveText('')

  await page.getByRole('listitem').getByRole('button').click()
  await expect(page.locator('#root > div > div > div')).toHaveCSS(
    'width',
    '240px'
  )

  await expect(page.locator('#vertical-tab-0')).toHaveText('Default Options')
  await expect(page.locator('#vertical-tab-1')).toHaveText('Default Effects')
  await expect(page.locator('#vertical-tab-2')).toHaveText('General Settings')
})

test('Fullscreen setting', async ({ page }) => {
  await expect(page.getByLabel('Fullscreen', { exact: true })).not.toBeChecked()

  await page.getByLabel('Fullscreen', { exact: true }).check()
  await expect(page.getByLabel('Fullscreen', { exact: true })).toBeChecked()

  await page.getByLabel('Fullscreen', { exact: true }).uncheck()
  await expect(page.getByLabel('Fullscreen', { exact: true })).not.toBeChecked()
})

test('Start Immediately setting', async ({ page }) => {
  await expect(page.getByLabel('Start Immediately', { exact: true })).not.toBeChecked()

  await page.getByLabel('Start Immediately', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If enabled, the player will start as soon as first image loads. If disabled, the player will load the first set of images from all sources before starting.'
  )

  await page.getByLabel('Start Immediately', { exact: true }).check()
  await expect(page.getByLabel('Start Immediately', { exact: true })).toBeChecked()

  await page.getByLabel('Start Immediately', { exact: true }).uncheck()
  await expect(page.getByLabel('Start Immediately', { exact: true })).not.toBeChecked()
})

test('Click to Progress setting', async ({ page }) => {
  await expect(page.getByLabel('Click to Progress', { exact: true })).toBeChecked()
  await expect(page.getByLabel('While Playing', { exact: true })).toBeVisible()

  await page.getByLabel('Click to Progress', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If enabled, clicking the currently playing image will advance to the next image.'
  )

  await page.getByLabel('Click to Progress', { exact: true }).uncheck()
  await expect(page.getByLabel('Click to Progress', { exact: true })).not.toBeChecked()
  await expect(page.getByLabel('While Playing', { exact: true })).toBeHidden()

  await page.getByLabel('Click to Progress', { exact: true }).check()
  await expect(page.getByLabel('Click to Progress', { exact: true })).toBeChecked()
  await expect(page.getByLabel('While Playing', { exact: true })).toBeVisible()
})

test('While Playing setting', async ({ page }) => {
  await page.getByLabel('Click to Progress', { exact: true }).check()
  await expect(page.getByLabel('While Playing', { exact: true })).toBeVisible()
  await expect(page.getByLabel('While Playing', { exact: true })).not.toBeChecked()

  await page.getByLabel('While Playing', { exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: /If enabled, clicking will/ })
  ).toBeVisible()
  await expect(
    page.getByRole('tooltip', { name: /If enabled, clicking will/ })
  ).toHaveText(
    'If enabled, clicking will advance even during Scene playback. If disabled, clicking will only advance while Scene playback is paused.'
  )

  await page.getByLabel('While Playing', { exact: true }).check()
  await expect(page.getByLabel('While Playing', { exact: true })).toBeChecked()

  await page.getByLabel('While Playing', { exact: true }).uncheck()
  await expect(page.getByLabel('While Playing', { exact: true })).not.toBeChecked()
})

test('Show Adv Easing Controls setting', async ({ page }) => {
  await expect(page.getByLabel('Show Adv Easing Controls', { exact: true })).not.toBeChecked()

  await page.getByLabel('Show Adv Easing Controls', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    "If enabled, additional controls for controlling 'easing' will be available in the Effect section."
  )

  await page.getByLabel('Show Adv Easing Controls', { exact: true }).check()
  await expect(page.getByLabel('Show Adv Easing Controls', { exact: true })).toBeChecked()

  await page.getByLabel('Show Adv Easing Controls', { exact: true }).uncheck()
  await expect(page.getByLabel('Show Adv Easing Controls', { exact: true })).not.toBeChecked()
})

test('Show Audio Info setting', async ({ page }) => {
  await expect(page.getByLabel('Show Audio Info', { exact: true })).not.toBeChecked()

  await page.getByLabel('Show Audio Info', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If enabled, track information will appear during playback whenever a new audio track starts.'
  )

  await page.getByLabel('Show Audio Info', { exact: true }).check()
  await expect(page.getByLabel('Show Audio Info', { exact: true })).toBeChecked()

  await page.getByLabel('Show Audio Info', { exact: true }).uncheck()
  await expect(page.getByLabel('Show Audio Info', { exact: true })).not.toBeChecked()
})

test('Prioritize Performance setting', async ({ page }) => {
  await expect(page.getByLabel('Prioritize Performance', { exact: true })).toBeChecked()

  await page.getByLabel('Prioritize Performance', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'Prioritizing performance will smooth image effects, but may dramatically increase load times.Prioritizing loading will decrease load times, but may result in jittery effects during playback'
  )

  await page.getByLabel('Prioritize Performance', { exact: true }).uncheck()
  await expect(page.getByLabel('Prioritize Loading', { exact: true })).not.toBeChecked()

  await page.getByLabel('Prioritize Loading', { exact: true }).check()
  await expect(page.getByLabel('Prioritize Performance', { exact: true })).toBeChecked()
})

test('Confirm Scene Deletion setting', async ({ page }) => {
  await expect(page.getByLabel('Confirm Scene Deletion', { exact: true })).toBeChecked()

  await page.getByLabel('Confirm Scene Deletion', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If disabled, no prompt will appear to confirm Scene deletion'
  )

  await page.getByLabel('Confirm Scene Deletion', { exact: true }).uncheck()
  await expect(page.getByLabel('Confirm Scene Deletion', { exact: true })).not.toBeChecked()

  await page.getByLabel('Confirm Scene Deletion', { exact: true }).check()
  await expect(page.getByLabel('Confirm Scene Deletion', { exact: true })).toBeChecked()
})

test('Confirm Blacklist setting', async ({ page }) => {
  await expect(page.getByLabel('Confirm Blacklist', { exact: true })).toBeChecked()

  await page.getByLabel('Confirm Blacklist', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If disabled, no prompt will appear to confirm blacklisting a file'
  )

  await page.getByLabel('Confirm Blacklist', { exact: true }).uncheck()
  await expect(page.getByLabel('Confirm Blacklist', { exact: true })).not.toBeChecked()

  await page.getByLabel('Confirm Blacklist', { exact: true }).check()
  await expect(page.getByLabel('Confirm Blacklist', { exact: true })).toBeChecked()
})

test('Confirm File Deletion setting', async ({ page }) => {
  await expect(page.getByLabel('Confirm File Deletion', { exact: true })).toBeChecked()

  await page.getByLabel('Confirm File Deletion', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If disabled, no prompt will appear to confirm File deletion'
  )

  await page.getByLabel('Confirm File Deletion', { exact: true }).uncheck()
  await expect(page.getByLabel('Confirm File Deletion', { exact: true })).not.toBeChecked()

  await page.getByLabel('Confirm File Deletion', { exact: true }).check()
  await expect(page.getByLabel('Confirm File Deletion', { exact: true })).toBeChecked()
})

test('Min Image Size setting', async ({ page }) => {
  await expect(page.getByLabel('Min Image Size', { exact: true })).toHaveAttribute('type', 'number')
  await page.getByLabel('Min Image Size', { exact: true }).hover();
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'Images under this size (width or height) will be skipped'
  )

  await page.getByLabel('Min Image Size', { exact: true }).click();
  await page.getByLabel('Min Image Size', { exact: true }).fill('-1');
  await page.getByLabel('Min Image Size', { exact: true }).blur()
  await expect(page.getByLabel('Min Image Size', { exact: true })).toHaveValue('0')

  await page.getByLabel('Min Image Size', { exact: true }).click();
  await page.getByLabel('Min Image Size', { exact: true }).fill('0');
  await page.getByLabel('Min Image Size', { exact: true }).blur()
  await expect(page.getByLabel('Min Image Size', { exact: true })).toHaveValue('0')

  await page.getByLabel('Min Image Size', { exact: true }).click();
  await page.getByLabel('Min Image Size', { exact: true }).fill('1234567890');
  await page.getByLabel('Min Image Size', { exact: true }).blur()
  await expect(page.getByLabel('Min Image Size')).toHaveValue('1234567890')
})

test('Min Video Size setting', async ({ page }) => {
  await expect(page.getByLabel('Min Video Size', { exact: true })).toHaveAttribute('type', 'number')
  await page.getByLabel('Min Video Size', { exact: true }).hover();
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'Videos under this size (width or height) will be skipped'
  )

  await page.getByLabel('Min Video Size', { exact: true }).click();
  await page.getByLabel('Min Video Size', { exact: true }).fill('-1');
  await page.getByLabel('Min Video Size', { exact: true }).blur()
  await expect(page.getByLabel('Min Video Size', { exact: true })).toHaveValue('0')

  await page.getByLabel('Min Video Size', { exact: true }).click();
  await page.getByLabel('Min Video Size', { exact: true }).fill('0');
  await page.getByLabel('Min Video Size', { exact: true }).blur()
  await expect(page.getByLabel('Min Video Size', { exact: true })).toHaveValue('0')

  await page.getByLabel('Min Video Size', { exact: true }).click();
  await page.getByLabel('Min Video Size', { exact: true }).fill('1234567890');
  await page.getByLabel('Min Video Size', { exact: true }).blur()
  await expect(page.getByLabel('Min Video Size')).toHaveValue('1234567890')
})

test('Max in History setting', async ({ page }) => {
  await expect(page.getByLabel('Max in History', { exact: true })).toHaveAttribute('type', 'number')
  await page.getByLabel('Max in History', { exact: true }).hover();
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'The maximum number of images/videos to keep in player history. Reduce this number to reduce memory usage and improve performance.'
  )

  await page.getByLabel('Max in History', { exact: true }).click();
  await page.getByLabel('Max in History', { exact: true }).fill('-1');
  await page.getByLabel('Max in History', { exact: true }).blur()
  await expect(page.getByLabel('Max in History', { exact: true })).toHaveValue('0')

  await page.getByLabel('Max in History', { exact: true }).click();
  await page.getByLabel('Max in History', { exact: true }).fill('0');
  await page.getByLabel('Max in History', { exact: true }).blur()
  await expect(page.getByLabel('Max in History', { exact: true })).toHaveValue('0')

  await page.getByLabel('Max in History', { exact: true }).click();
  await page.getByLabel('Max in History', { exact: true }).fill('1234567890');
  await page.getByLabel('Max in History', { exact: true }).blur()
  await expect(page.getByLabel('Max in History')).toHaveValue('1234567890')
})

test('Max in Memory setting', async ({ page }) => {
  await expect(page.getByLabel('Max in Memory', { exact: true })).toHaveAttribute('type', 'number')
  await page.getByLabel('Max in Memory', { exact: true }).hover();
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'The maximum number of images/videos to queue up for rendering. Reduce this number to reduce memory usage and improve performance.'
  )

  await page.getByLabel('Max in Memory', { exact: true }).click();
  await page.getByLabel('Max in Memory', { exact: true }).fill('-1');
  await page.getByLabel('Max in Memory', { exact: true }).blur()
  await expect(page.getByLabel('Max in Memory', { exact: true })).toHaveValue('0')

  await page.getByLabel('Max in Memory', { exact: true }).click();
  await page.getByLabel('Max in Memory', { exact: true }).fill('0');
  await page.getByLabel('Max in Memory', { exact: true }).blur()
  await expect(page.getByLabel('Max in Memory', { exact: true })).toHaveValue('0')

  await page.getByLabel('Max in Memory', { exact: true }).click();
  await page.getByLabel('Max in Memory', { exact: true }).fill('1234567890');
  await page.getByLabel('Max in Memory', { exact: true }).blur()
  await expect(page.getByLabel('Max in Memory')).toHaveValue('1234567890')
})

test('Max Loading at Once setting', async ({ page }) => {
  await expect(page.getByLabel('Max Loading at Once', { exact: true })).toHaveAttribute('type', 'number')
  await page.getByLabel('Max Loading at Once', { exact: true }).hover();
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'The maximum number of simultaneous images/videos loading. Increase this number to load sources faster. Reduce this number to improve display performance.'
  )

  await page.getByLabel('Max Loading at Once', { exact: true }).click();
  await page.getByLabel('Max Loading at Once', { exact: true }).fill('-1');
  await page.getByLabel('Max Loading at Once', { exact: true }).blur()
  await expect(page.getByLabel('Max Loading at Once', { exact: true })).toHaveValue('0')

  await page.getByLabel('Max Loading at Once', { exact: true }).click();
  await page.getByLabel('Max Loading at Once', { exact: true }).fill('0');
  await page.getByLabel('Max Loading at Once', { exact: true }).blur()
  await expect(page.getByLabel('Max Loading at Once', { exact: true })).toHaveValue('0')

  await page.getByLabel('Max Loading at Once', { exact: true }).click();
  await page.getByLabel('Max Loading at Once', { exact: true }).fill('1234567890');
  await page.getByLabel('Max Loading at Once', { exact: true }).blur()
  await expect(page.getByLabel('Max Loading at Once')).toHaveValue('1234567890')
})

test('Dark Mode setting', async ({ page }) => {
  await expect(page.getByLabel('Dark Mode', { exact: true })).not.toBeChecked()
  await expect(page.locator('.MuiDrawer-root > .MuiPaper-root')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(page.locator('main .MuiContainer-root .MuiPaper-root').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)')

  await page.getByLabel('Dark Mode', { exact: true }).check()
  await expect(page.getByLabel('Dark Mode', { exact: true })).toBeChecked()
  await expect(page.locator('.MuiDrawer-root > .MuiPaper-root')).toHaveCSS('background-color', 'rgb(18, 18, 18)')
  await expect(page.locator('main .MuiContainer-root .MuiPaper-root').first()).toHaveCSS('background-color', 'rgb(18, 18, 18)')

  await page.getByLabel('Dark Mode', { exact: true }).uncheck()
  await expect(page.getByLabel('Dark Mode', { exact: true })).not.toBeChecked()
  await expect(page.locator('.MuiDrawer-root > .MuiPaper-root')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(page.locator('main .MuiContainer-root .MuiPaper-root').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)')
})

type Color = {
  name: string
  hex: string
  rgb: string
}

const colors: Color[] = [
  { name: 'red', hex: '#f44336', rgb: '244, 67, 54'},
  { name: 'pink', hex: '#e91e63', rgb: '233, 30, 99'},
  { name: 'purple', hex: '#9c27b0', rgb: '156, 39, 176'},
  { name: 'deep purple', hex: '#673ab7', rgb: '103, 58, 183'},
  { name: 'indigo', hex: '#3f51b5', rgb: '63, 81, 181'},
  { name: 'blue', hex: '#2196f3', rgb: '33, 150, 243'},
  { name: 'light blue', hex: '#03a9f4', rgb: '3, 169, 244'},
  { name: 'cyan', hex: '#00bcd4', rgb: '0, 188, 212'},
  { name: 'teal', hex: '#009688', rgb: '0, 150, 136'},
  { name: 'green', hex: '#4caf50', rgb: '76, 175, 80'},
  { name: 'light green', hex: '#8bc34a', rgb: '139, 195, 74'},
  { name: 'lime', hex: '#cddc39', rgb: '205, 220, 57'},
  { name: 'yellow', hex: '#ffeb3b', rgb: '255, 235, 59'},
  { name: 'amber', hex: '#ffc107', rgb: '255, 193, 7'},
  { name: 'orange', hex: '#ff9800', rgb: '255, 152, 0'},
  { name: 'deep orange', hex: '#ff5722', rgb: '255, 87, 34'},
  { name: 'brown', hex: '#795548', rgb: '121, 85, 72'},
  { name: 'grey', hex: '#9e9e9e', rgb: '158, 158, 158'},
  { name: 'blue grey', hex: '#607d8b', rgb: '96, 125, 139'},
  { name: 'white', hex: '#fff', rgb: '255, 255, 255'},
  { name: 'black', hex: '#000', rgb: '0, 0, 0'}
]

test.describe('Primary color theme setting', () => {
  test('Primary color input is readonly', async ({ page }) => {
    await expect(page.locator('div').filter({ hasText: /^Primary ColorColor$/ }).getByLabel('Color')).toHaveAttribute('readonly')
  })

  test('Default primary color is indigo', async ({ page }) => {
    const indigo = colors.find((c) => c.name === 'indigo') as Color
    await expect(page.locator('div').filter({ hasText: /^Primary ColorColor$/ }).getByLabel('Color')).toHaveValue(indigo.hex)
    await expect(page.locator('.css-grxim5-themePicker > div > div > .MuiButtonBase-root').first()).toHaveCSS('background-color', `rgb(${indigo.rgb})`)
    await expect(page.locator('header')).toHaveCSS('background-color', `rgb(${indigo.rgb})`)
    await expect(page.locator('div').filter({ hasText: /^Backups: --$/ }).nth(1)).toHaveCSS('color', `rgb(${indigo.rgb})`)
  })

  colors.forEach((color, index) => {
    test(`Pick ${color.name} as primary color`, async ({page}) => {
      await expect(page.locator(`.css-grxim5-themePicker > div > div:nth-child(2) > div > div:nth-child(${index + 1}) > .MuiButtonBase-root`).first()).toHaveAttribute('value', color.hex)
      await page.locator(`.css-grxim5-themePicker > div > div:nth-child(2) > div > div:nth-child(${index + 1}) > .MuiButtonBase-root`).first().click()
     
      await expect(page.locator('div').filter({ hasText: /^Primary ColorColor$/ }).getByLabel('Color')).toHaveValue(color.hex)
      await expect(page.locator('.css-grxim5-themePicker > div > div > .MuiButtonBase-root').first()).toHaveCSS('background-color', `rgb(${color.rgb})`)
      await expect(page.locator('header')).toHaveCSS('background-color', `rgb(${color.rgb})`)
      await expect(page.locator('div').filter({ hasText: /^Backups: --$/ }).nth(1)).toHaveCSS('color', `rgb(${color.rgb})`)
    })
  })
})

test.describe('Secondary color theme setting', () => {
  test('Secondary color input is readonly', async ({ page }) => {
    await expect(page.locator('div').filter({ hasText: /^Secondary ColorColor$/ }).getByLabel('Color')).toHaveAttribute('readonly')
  })

  test('Default secondary color is pink', async ({ page }) => {
    const pink = colors.find((c) => c.name === 'pink') as Color
    await expect(page.locator('div').filter({ hasText: /^Secondary ColorColor$/ }).getByLabel('Color')).toHaveValue(pink.hex)
    await expect(page.locator('.MuiCardContent-root > div:nth-child(3) > div > div > .MuiButtonBase-root')).toHaveCSS('background-color', `rgb(${pink.rgb})`)
    await expect(page.locator('div').filter({ hasText: /^Latest: --$/ }).nth(1)).toHaveCSS('color', `rgb(${pink.rgb})`)
  })

  colors.forEach((color, index) => {
    test(`Pick ${color.name} as secondary color`, async ({page}) => {
      await expect(page.locator(`.MuiCardContent-root > div:nth-child(3) > div > div:nth-child(2) > div > div:nth-child(${index + 1}) > .MuiButtonBase-root`).first()).toHaveAttribute('value', color.hex)
      await page.locator(`.MuiCardContent-root > div:nth-child(3) > div > div:nth-child(2) > div > div:nth-child(${index + 1}) > .MuiButtonBase-root`).first().click();
     
      await expect(page.locator('div').filter({ hasText: /^Secondary ColorColor$/ }).getByLabel('Color')).toHaveValue(color.hex)
      await expect(page.locator('.MuiCardContent-root > div:nth-child(3) > div > div > .MuiButtonBase-root')).toHaveCSS('background-color', `rgb(${color.rgb})`)
      await expect(page.locator('div').filter({ hasText: /^Latest: --$/ }).nth(1)).toHaveCSS('color', `rgb(${color.rgb})`)
    })
  })
})

// TODO caching settings

// TODO backup settings

// TODO ignored tags setting

// TODO API sign in tests