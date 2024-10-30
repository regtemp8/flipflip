import { test, expect } from '@playwright/test'

test('Authentication', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('Username').click()
  await page.getByLabel('Username').fill('admin')
  await page.getByLabel('Password').click()
  await page.getByLabel('Password').fill('admin')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL('/')

  await page.context().storageState({ path: 'server/tests/session.json' })
})
