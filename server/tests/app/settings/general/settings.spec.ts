import { test, expect } from '@playwright/test'

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

  await page.getByLabel('Fullscreen', { exact: true }).click()
  await expect(page.getByLabel('Fullscreen', { exact: true })).toBeChecked()

  await page.getByLabel('Fullscreen', { exact: true }).click()
  await expect(page.getByLabel('Fullscreen', { exact: true })).not.toBeChecked()
})

test('Start Immediately setting', async ({ page }) => {
  await expect(
    page.getByLabel('Start Immediately', { exact: true })
  ).not.toBeChecked()

  await page.getByLabel('Start Immediately', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If enabled, the player will start as soon as first image loads. If disabled, the player will load the first set of images from all sources before starting.'
  )

  await page.getByLabel('Start Immediately', { exact: true }).click()
  await expect(
    page.getByLabel('Start Immediately', { exact: true })
  ).toBeChecked()

  await page.getByLabel('Start Immediately', { exact: true }).click()
  await expect(
    page.getByLabel('Start Immediately', { exact: true })
  ).not.toBeChecked()
})

test('Click to Progress setting', async ({ page }) => {
  await expect(
    page.getByLabel('Click to Progress', { exact: true })
  ).toBeChecked()
  await expect(page.getByLabel('While Playing', { exact: true })).toBeVisible()

  await page.getByLabel('Click to Progress', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If enabled, clicking the currently playing image will advance to the next image.'
  )

  await page.getByLabel('Click to Progress', { exact: true }).click()
  await expect(
    page.getByLabel('Click to Progress', { exact: true })
  ).not.toBeChecked()
  await expect(page.getByLabel('While Playing', { exact: true })).toBeHidden()

  await page.getByLabel('Click to Progress', { exact: true }).click()
  await expect(
    page.getByLabel('Click to Progress', { exact: true })
  ).toBeChecked()
  await expect(page.getByLabel('While Playing', { exact: true })).toBeVisible()
})

test('While Playing setting', async ({ page }) => {
  await page.getByLabel('Click to Progress', { exact: true }).click()
  await expect(page.getByLabel('While Playing', { exact: true })).toBeVisible()
  await expect(
    page.getByLabel('While Playing', { exact: true })
  ).not.toBeChecked()

  await page.getByLabel('While Playing', { exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: /If enabled, clicking will/ })
  ).toBeVisible()
  await expect(
    page.getByRole('tooltip', { name: /If enabled, clicking will/ })
  ).toHaveText(
    'If enabled, clicking will advance even during Scene playback. If disabled, clicking will only advance while Scene playback is paused.'
  )

  await page.getByLabel('While Playing', { exact: true }).click()
  await expect(page.getByLabel('While Playing', { exact: true })).toBeChecked()

  await page.getByLabel('While Playing', { exact: true }).click()
  await expect(
    page.getByLabel('While Playing', { exact: true })
  ).not.toBeChecked()
})

test('Show Adv Easing Controls setting', async ({ page }) => {
  await expect(
    page.getByLabel('Show Adv Easing Controls', { exact: true })
  ).not.toBeChecked()

  await page.getByLabel('Show Adv Easing Controls', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    "If enabled, additional controls for controlling 'easing' will be available in the Effect section."
  )

  await page.getByLabel('Show Adv Easing Controls', { exact: true }).click()
  await expect(
    page.getByLabel('Show Adv Easing Controls', { exact: true })
  ).toBeChecked()

  await page.getByLabel('Show Adv Easing Controls', { exact: true }).click()
  await expect(
    page.getByLabel('Show Adv Easing Controls', { exact: true })
  ).not.toBeChecked()
})

test('Show Audio Info setting', async ({ page }) => {
  await expect(
    page.getByLabel('Show Audio Info', { exact: true })
  ).toBeChecked()

  await page.getByLabel('Show Audio Info', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If enabled, track information will appear during playback whenever a new audio track starts.'
  )

  await page.getByLabel('Show Audio Info', { exact: true }).click()
  await expect(
    page.getByLabel('Show Audio Info', { exact: true })
  ).not.toBeChecked()

  await page.getByLabel('Show Audio Info', { exact: true }).click()
  await expect(
    page.getByLabel('Show Audio Info', { exact: true })
  ).toBeChecked()
})

test('Prioritize Performance setting', async ({ page }) => {
  await expect(
    page.getByLabel('Prioritize Performance', { exact: true })
  ).toBeChecked()

  await page.getByLabel('Prioritize Performance', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'Prioritizing performance will smooth image effects, but may dramatically increase load times.Prioritizing loading will decrease load times, but may result in jittery effects during playback'
  )

  await page.getByLabel('Prioritize Performance', { exact: true }).click()
  await expect(
    page.getByLabel('Prioritize Loading', { exact: true })
  ).not.toBeChecked()

  await page.getByLabel('Prioritize Loading', { exact: true }).click()
  await expect(
    page.getByLabel('Prioritize Performance', { exact: true })
  ).toBeChecked()
})

test('Confirm Scene Deletion setting', async ({ page }) => {
  await expect(
    page.getByLabel('Confirm Scene Deletion', { exact: true })
  ).toBeChecked()

  await page.getByLabel('Confirm Scene Deletion', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If disabled, no prompt will appear to confirm Scene deletion'
  )

  await page.getByLabel('Confirm Scene Deletion', { exact: true }).click()
  await expect(
    page.getByLabel('Confirm Scene Deletion', { exact: true })
  ).not.toBeChecked()

  await page.getByLabel('Confirm Scene Deletion', { exact: true }).click()
  await expect(
    page.getByLabel('Confirm Scene Deletion', { exact: true })
  ).toBeChecked()
})

test('Confirm Blacklist setting', async ({ page }) => {
  await expect(
    page.getByLabel('Confirm Blacklist', { exact: true })
  ).toBeChecked()

  await page.getByLabel('Confirm Blacklist', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If disabled, no prompt will appear to confirm blacklisting a file'
  )

  await page.getByLabel('Confirm Blacklist', { exact: true }).click()
  await expect(
    page.getByLabel('Confirm Blacklist', { exact: true })
  ).not.toBeChecked()

  await page.getByLabel('Confirm Blacklist', { exact: true }).click()
  await expect(
    page.getByLabel('Confirm Blacklist', { exact: true })
  ).toBeChecked()
})

test('Confirm File Deletion setting', async ({ page }) => {
  await expect(
    page.getByLabel('Confirm File Deletion', { exact: true })
  ).toBeChecked()

  await page.getByLabel('Confirm File Deletion', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If disabled, no prompt will appear to confirm File deletion'
  )

  await page.getByLabel('Confirm File Deletion', { exact: true }).click()
  await expect(
    page.getByLabel('Confirm File Deletion', { exact: true })
  ).not.toBeChecked()

  await page.getByLabel('Confirm File Deletion', { exact: true }).click()
  await expect(
    page.getByLabel('Confirm File Deletion', { exact: true })
  ).toBeChecked()
})

test('Min Image Size setting', async ({ page }) => {
  await expect(
    page.getByLabel('Min Image Size', { exact: true })
  ).toHaveAttribute('type', 'number')
  await page.getByLabel('Min Image Size', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'Images under this size (width or height) will be skipped'
  )

  await page.getByLabel('Min Image Size', { exact: true }).click()
  await page.getByLabel('Min Image Size', { exact: true }).fill('-1')
  await page.getByLabel('Min Image Size', { exact: true }).blur()
  await expect(page.getByLabel('Min Image Size', { exact: true })).toHaveValue(
    '0'
  )

  await page.getByLabel('Min Image Size', { exact: true }).click()
  await page.getByLabel('Min Image Size', { exact: true }).fill('0')
  await page.getByLabel('Min Image Size', { exact: true }).blur()
  await expect(page.getByLabel('Min Image Size', { exact: true })).toHaveValue(
    '0'
  )

  await page.getByLabel('Min Image Size', { exact: true }).click()
  await page.getByLabel('Min Image Size', { exact: true }).fill('1234567890')
  await page.getByLabel('Min Image Size', { exact: true }).blur()
  await expect(page.getByLabel('Min Image Size')).toHaveValue('1234567890')
})

test('Min Video Size setting', async ({ page }) => {
  await expect(
    page.getByLabel('Min Video Size', { exact: true })
  ).toHaveAttribute('type', 'number')
  await page.getByLabel('Min Video Size', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'Videos under this size (width or height) will be skipped'
  )

  await page.getByLabel('Min Video Size', { exact: true }).click()
  await page.getByLabel('Min Video Size', { exact: true }).fill('-1')
  await page.getByLabel('Min Video Size', { exact: true }).blur()
  await expect(page.getByLabel('Min Video Size', { exact: true })).toHaveValue(
    '0'
  )

  await page.getByLabel('Min Video Size', { exact: true }).click()
  await page.getByLabel('Min Video Size', { exact: true }).fill('0')
  await page.getByLabel('Min Video Size', { exact: true }).blur()
  await expect(page.getByLabel('Min Video Size', { exact: true })).toHaveValue(
    '0'
  )

  await page.getByLabel('Min Video Size', { exact: true }).click()
  await page.getByLabel('Min Video Size', { exact: true }).fill('1234567890')
  await page.getByLabel('Min Video Size', { exact: true }).blur()
  await expect(page.getByLabel('Min Video Size')).toHaveValue('1234567890')
})

test('Max in History setting', async ({ page }) => {
  await expect(
    page.getByLabel('Max in History', { exact: true })
  ).toHaveAttribute('type', 'number')
  await page.getByLabel('Max in History', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'The maximum number of images/videos to keep in player history. Reduce this number to reduce memory usage and improve performance.'
  )

  await page.getByLabel('Max in History', { exact: true }).click()
  await page.getByLabel('Max in History', { exact: true }).fill('-1')
  await page.getByLabel('Max in History', { exact: true }).blur()
  await expect(page.getByLabel('Max in History', { exact: true })).toHaveValue(
    '0'
  )

  await page.getByLabel('Max in History', { exact: true }).click()
  await page.getByLabel('Max in History', { exact: true }).fill('0')
  await page.getByLabel('Max in History', { exact: true }).blur()
  await expect(page.getByLabel('Max in History', { exact: true })).toHaveValue(
    '0'
  )

  await page.getByLabel('Max in History', { exact: true }).click()
  await page.getByLabel('Max in History', { exact: true }).fill('1234567890')
  await page.getByLabel('Max in History', { exact: true }).blur()
  await expect(page.getByLabel('Max in History')).toHaveValue('1234567890')
})

test('Max in Memory setting', async ({ page }) => {
  await expect(
    page.getByLabel('Max in Memory', { exact: true })
  ).toHaveAttribute('type', 'number')
  await page.getByLabel('Max in Memory', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'The maximum number of images/videos to queue up for rendering. Reduce this number to reduce memory usage and improve performance.'
  )

  await page.getByLabel('Max in Memory', { exact: true }).click()
  await page.getByLabel('Max in Memory', { exact: true }).fill('-1')
  await page.getByLabel('Max in Memory', { exact: true }).blur()
  await expect(page.getByLabel('Max in Memory', { exact: true })).toHaveValue(
    '0'
  )

  await page.getByLabel('Max in Memory', { exact: true }).click()
  await page.getByLabel('Max in Memory', { exact: true }).fill('0')
  await page.getByLabel('Max in Memory', { exact: true }).blur()
  await expect(page.getByLabel('Max in Memory', { exact: true })).toHaveValue(
    '0'
  )

  await page.getByLabel('Max in Memory', { exact: true }).click()
  await page.getByLabel('Max in Memory', { exact: true }).fill('1234567890')
  await page.getByLabel('Max in Memory', { exact: true }).blur()
  await expect(page.getByLabel('Max in Memory')).toHaveValue('1234567890')
})

test('Max Loading at Once setting', async ({ page }) => {
  await expect(
    page.getByLabel('Max Loading at Once', { exact: true })
  ).toHaveAttribute('type', 'number')
  await page.getByLabel('Max Loading at Once', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'The maximum number of simultaneous images/videos loading. Increase this number to load sources faster. Reduce this number to improve display performance.'
  )

  await page.getByLabel('Max Loading at Once', { exact: true }).click()
  await page.getByLabel('Max Loading at Once', { exact: true }).fill('-1')
  await page.getByLabel('Max Loading at Once', { exact: true }).blur()
  await expect(
    page.getByLabel('Max Loading at Once', { exact: true })
  ).toHaveValue('0')

  await page.getByLabel('Max Loading at Once', { exact: true }).click()
  await page.getByLabel('Max Loading at Once', { exact: true }).fill('0')
  await page.getByLabel('Max Loading at Once', { exact: true }).blur()
  await expect(
    page.getByLabel('Max Loading at Once', { exact: true })
  ).toHaveValue('0')

  await page.getByLabel('Max Loading at Once', { exact: true }).click()
  await page
    .getByLabel('Max Loading at Once', { exact: true })
    .fill('1234567890')
  await page.getByLabel('Max Loading at Once', { exact: true }).blur()
  await expect(page.getByLabel('Max Loading at Once')).toHaveValue('1234567890')
})

test('Restore Defaults', async ({ page }) => {
  await page.getByLabel('Restore Defaults', { exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Restore Defaults', exact: true })
  ).toBeVisible()
  await expect(page.getByRole('dialog')).not.toBeVisible()

  await page.getByLabel('Restore Defaults', { exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(
    'Restore Defaults'
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Are you sure you want to restore all settings to their defaults? This will also reset any configured APIs.'
  )

  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()

  await page.getByLabel('Enable Watermark', { exact: true }).click()
  await page.getByLabel('Restore Defaults').click()
  await page.getByRole('button', { name: 'OK' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(
    page.getByLabel('Enable Watermark', { exact: true })
  ).not.toBeChecked()
})

// TODO ignored tags setting

// TODO API sign in tests

// TODO reset tutorials test
