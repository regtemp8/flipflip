import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/session.json' })
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
  await expect(
    page.locator(
      'label:has( > :text-matches("Fullscreen")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)

  await page.getByLabel('Fullscreen', { exact: true }).check()
  await expect(
    page.locator(
      'label:has( > :text-matches("Fullscreen")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)

  await page.getByLabel('Fullscreen', { exact: true }).uncheck()
  await expect(
    page.locator(
      'label:has( > :text-matches("Fullscreen")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)
})

test('Start Immediately setting', async ({ page }) => {
  await expect(
    page.locator(
      'label:has( > :text-matches("Start Immediately")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)

  await page.getByLabel('Start Immediately', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If enabled, the player will start as soon as first image loads. If disabled, the player will load the first set of images from all sources before starting.'
  )

  await page.getByLabel('Start Immediately', { exact: true }).check()
  await expect(
    page.locator(
      'label:has( > :text-matches("Start Immediately")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)

  await page.getByLabel('Start Immediately', { exact: true }).uncheck()
  await expect(
    page.locator(
      'label:has( > :text-matches("Start Immediately")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)
})

test('Click to Progress setting', async ({ page }) => {
  await expect(
    page.locator(
      'label:has( > :text-matches("Click to Progress")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)
  await expect(page.getByLabel('While Playing', { exact: true })).toBeVisible()

  await page.getByLabel('Click to Progress', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If enabled, clicking the currently playing image will advance to the next image.'
  )

  await page.getByLabel('Click to Progress', { exact: true }).uncheck()
  await expect(
    page.locator(
      'label:has( > :text-matches("Click to Progress")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)
  await expect(page.getByLabel('While Playing', { exact: true })).toBeHidden()

  await page.getByLabel('Click to Progress', { exact: true }).check()
  await expect(
    page.locator(
      'label:has( > :text-matches("Click to Progress")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)
  await expect(page.getByLabel('While Playing', { exact: true })).toBeVisible()
})

test('While Playing setting', async ({ page }) => {
  await page.getByLabel('Click to Progress', { exact: true }).check()
  await expect(page.getByLabel('While Playing', { exact: true })).toBeVisible()
  await expect(
    page.locator(
      'label:has( > :text-matches("While Playing")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)

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
  await expect(
    page.locator(
      'label:has( > :text-matches("While Playing")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)

  await page.getByLabel('While Playing', { exact: true }).uncheck()
  await expect(
    page.locator(
      'label:has( > :text-matches("While Playing")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)
})

test('Show Adv Easing Controls setting', async ({ page }) => {
  await expect(
    page.locator(
      'label:has( > :text-matches("Show Adv Easing Controls")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)

  await page.getByLabel('Show Adv Easing Controls', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    "If enabled, additional controls for controlling 'easing' will be available in the Effect section."
  )

  await page.getByLabel('Show Adv Easing Controls', { exact: true }).check()
  await expect(
    page.locator(
      'label:has( > :text-matches("Show Adv Easing Controls")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)

  await page.getByLabel('Show Adv Easing Controls', { exact: true }).uncheck()
  await expect(
    page.locator(
      'label:has( > :text-matches("Show Adv Easing Controls")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)
})

test('Show Audio Info setting', async ({ page }) => {
  await expect(
    page.locator(
      'label:has( > :text-matches("Show Audio Info")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)

  await page.getByLabel('Show Audio Info', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If enabled, track information will appear during playback whenever a new audio track starts.'
  )

  await page.getByLabel('Show Audio Info', { exact: true }).check()
  await expect(
    page.locator(
      'label:has( > :text-matches("Show Audio Info")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)

  await page.getByLabel('Show Audio Info', { exact: true }).uncheck()
  await expect(
    page.locator(
      'label:has( > :text-matches("Show Audio Info")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)
})

test('Prioritize Performance setting', async ({ page }) => {
  await expect(
    page.locator(
      'label:has( > :text-matches("Prioritize Performance")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)

  await page.getByLabel('Prioritize Performance', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'Prioritizing performance will smooth image effects, but may dramatically increase load times.Prioritizing loading will decrease load times, but may result in jittery effects during playback'
  )

  await page.getByLabel('Prioritize Performance', { exact: true }).uncheck()
  await expect(
    page.locator(
      'label:has( > :text-matches("Prioritize Loading")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)

  await page.getByLabel('Prioritize Loading', { exact: true }).check()
  await expect(
    page.locator(
      'label:has( > :text-matches("Prioritize Performance")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)
})

test('Confirm Scene Deletion setting', async ({ page }) => {
  await expect(
    page.locator(
      'label:has( > :text-matches("Confirm Scene Deletion")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)

  await page.getByLabel('Confirm Scene Deletion', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If disabled, no prompt will appear to confirm Scene deletion'
  )

  await page.getByLabel('Confirm Scene Deletion', { exact: true }).uncheck()
  await expect(
    page.locator(
      'label:has( > :text-matches("Confirm Scene Deletion")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)

  await page.getByLabel('Confirm Scene Deletion', { exact: true }).check()
  await expect(
    page.locator(
      'label:has( > :text-matches("Confirm Scene Deletion")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)
})

test('Confirm Blacklist setting', async ({ page }) => {
  await expect(
    page.locator(
      'label:has( > :text-matches("Confirm Blacklist")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)

  await page.getByLabel('Confirm Blacklist', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If disabled, no prompt will appear to confirm blacklisting a file'
  )

  await page.getByLabel('Confirm Blacklist', { exact: true }).uncheck()
  await expect(
    page.locator(
      'label:has( > :text-matches("Confirm Blacklist")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)

  await page.getByLabel('Confirm Blacklist', { exact: true }).check()
  await expect(
    page.locator(
      'label:has( > :text-matches("Confirm Blacklist")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)
})

test('Confirm File Deletion setting', async ({ page }) => {
  await expect(
    page.locator(
      'label:has( > :text-matches("Confirm File Deletion")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)

  await page.getByLabel('Confirm File Deletion', { exact: true }).hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(page.getByRole('tooltip')).toHaveText(
    'If disabled, no prompt will appear to confirm File deletion'
  )

  await page.getByLabel('Confirm File Deletion', { exact: true }).uncheck()
  await expect(
    page.locator(
      'label:has( > :text-matches("Confirm File Deletion")) .MuiSwitch-switchBase'
    )
  ).not.toHaveClass(/Mui-checked/)

  await page.getByLabel('Confirm File Deletion', { exact: true }).check()
  await expect(
    page.locator(
      'label:has( > :text-matches("Confirm File Deletion")) .MuiSwitch-switchBase'
    )
  ).toHaveClass(/Mui-checked/)
})
