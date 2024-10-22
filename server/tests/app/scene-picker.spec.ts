import { test, expect } from '@playwright/test'
import { login } from '../utils'

test.beforeEach(async ({ page }) => {
    await login(page)
  })
  
  test('Scene picker navigation', async ({ page }) => {
    await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '0px')
  
    await page.locator('#vertical-tab-1').click();
    await expect(page).toHaveURL('/generators')
    await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '80px')
  
    await page.locator('#vertical-tab-3').click();
    await expect(page).toHaveURL('/displays')
    await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '160px')
  
    await page.locator('#vertical-tab-4').click();
    await expect(page).toHaveURL('/playlists')
    await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '240px')
  
    await page.locator('#vertical-tab-0').click();
    await expect(page).toHaveURL('/scenes')
    await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '0px')
  
    await page.getByLabel('Library', { exact: true }).click();
    await expect(page).toHaveURL('/content-library')
    await page.getByLabel('Back').click();
  
    await page.getByLabel('Audio Library').click();
    await expect(page).toHaveURL('/audio-library')
    await page.getByLabel('Back').click();
  
    await page.getByLabel('Script Library').click();
    await expect(page).toHaveURL('/script-library')
    await page.getByLabel('Back').click();
  
    await page.getByLabel('Caption Scripter').click();
    await expect(page).toHaveURL('/scripter')
    await page.getByLabel('Back').click();
  
    await page.getByLabel('Account').click();
    await expect(page).toHaveURL('/account')
    await page.getByLabel('Back').click();
  
    await page.getByLabel('Settings').click();
    await expect(page).toHaveURL('/settings')
    await page.getByLabel('Back', { exact: true }).click();
  
    await expect(page.locator('#vertical-tab-1')).toHaveText('')
    await expect(page.locator('#vertical-tab-3')).toHaveText('')
    await expect(page.locator('#vertical-tab-4')).toHaveText('')
    await expect(page.locator('#vertical-tab-0')).toHaveText('')
  
    await page.getByRole('banner').getByLabel('Toggle Drawer').click();
    await expect(page.locator('#root > div > div > div')).toHaveCSS('width', '240px')
  
    await expect(page.locator('#vertical-tab-1')).toHaveText('Scene Generators (0)')
    await expect(page.locator('#vertical-tab-3')).toHaveText('Displays (0)')
    await expect(page.locator('#vertical-tab-4')).toHaveText('Playlists (0)')
    await expect(page.locator('#vertical-tab-0')).toHaveText('Scenes (0)')
  })