import { test, expect } from '@playwright/test'
import { login } from './utils'

test.beforeEach(async ({ page }) => {
  await login(page)
})

test('Settings navigation', async ({ page }) => {
  await page.goto('/settings')
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '192px')

  await page.locator('#vertical-tab-0').click();
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '0px')
  await expect(page).toHaveURL('/settings/scene-options')

  await page.locator('#vertical-tab-1').click();
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '96px')
  await expect(page).toHaveURL('/settings/scene-effects')

  await page.locator('#vertical-tab-2').click();
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '192px')
  await expect(page).toHaveURL('/settings/general')

  await expect(page.locator('#vertical-tab-0')).toHaveText('')
  await expect(page.locator('#vertical-tab-1')).toHaveText('')
  await expect(page.locator('#vertical-tab-2')).toHaveText('')
  
  await page.getByRole('listitem').getByRole('button').click();
  await expect(page.locator('#root > div > div > div')).toHaveCSS('width', '240px')

  await expect(page.locator('#vertical-tab-0')).toHaveText('Default Options')
  await expect(page.locator('#vertical-tab-1')).toHaveText('Default Effects')
  await expect(page.locator('#vertical-tab-2')).toHaveText('General Settings')
})