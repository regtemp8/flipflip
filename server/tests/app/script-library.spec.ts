import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/script-library')
})

test('Script library navigation', async ({ page }) => {
  await page.getByLabel('Manage Tags').click()
  await expect(page).toHaveURL('/tags')

  await page.getByLabel('Back').click()
  await expect(page).toHaveURL('/script-library')

  await page.getByLabel('Batch Tag').click()

  await page.getByRole('listitem').getByRole('button').click()
  await expect(page.locator('#root > div > div > div')).toHaveCSS(
    'width',
    '240px'
  )
})
