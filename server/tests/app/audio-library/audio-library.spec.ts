import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/audio-library')
})

// TODO add tutorial tests

test('Audio library navigation', async ({ page }) => {
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '288px')

  await page.locator('#vertical-tab-2').click()
  await expect(page).toHaveURL('/audio-library/albums')
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '192px')

  await page.locator('#vertical-tab-1').click()
  await expect(page).toHaveURL('/audio-library/artists')
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '96px')

  await page.locator('#vertical-tab-0').click()
  await expect(page).toHaveURL('/audio-library/playlists')
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '0px')

  await page.locator('#vertical-tab-3').click()
  await expect(page).toHaveURL('/audio-library/tracks')
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '288px')

  await expect(page.locator('#vertical-tab-0')).toHaveText('')
  await expect(page.locator('#vertical-tab-1')).toHaveText('')
  await expect(page.locator('#vertical-tab-2')).toHaveText('')
  await expect(page.locator('#vertical-tab-3')).toHaveText('')

  await page.getByRole('listitem').getByRole('button').click()
  await expect(page.locator('#root > div > div > div')).toHaveCSS(
    'width',
    '240px'
  )

  await expect(page.locator('#vertical-tab-0')).toHaveText('Playlists')
  await expect(page.locator('#vertical-tab-1')).toHaveText('Artists')
  await expect(page.locator('#vertical-tab-2')).toHaveText('Albums')
  await expect(page.locator('#vertical-tab-3')).toHaveText('Songs')
})
