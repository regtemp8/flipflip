import { test, expect } from '@playwright/test'
import { login } from './utils'

test.beforeEach(async ({ page }) => {
  await login(page)
})

test('Account navigation', async ({ page }) => {
  await page.goto('/account')
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '0px')

  await page.locator('#vertical-tab-1').click();
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '96px')
  await expect(page).toHaveURL('/account/manage')
  await expect(page.getByRole('heading', { name: 'Manage Account' })).toBeVisible();

  await page.locator('#vertical-tab-0').click();
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '0px')
  await expect(page).toHaveURL('/account/connect')
  await expect(page.getByRole('heading', { name: 'Connect Devices' })).toBeVisible();


  await expect(page.locator('#vertical-tab-0')).toHaveText('')
  await expect(page.locator('#vertical-tab-1')).toHaveText('')

  await page.getByRole('listitem').getByRole('button').click();
  await expect(page.locator('#root > div > div > div')).toHaveCSS('width', '240px')

  await expect(page.locator('#vertical-tab-0')).toHaveText('Connect')
  await expect(page.locator('#vertical-tab-1')).toHaveText('Manage Account')
})