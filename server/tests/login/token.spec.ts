import { test, expect } from '@playwright/test'

test('Failed token login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/login')

  await page
    .getByRole('button', { name: 'Sign in with a one-time token' })
    .click()
  await page.getByLabel('Token').click()
  await page.getByLabel('Token').fill('123456')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL('/login')
})

test('Successfull token login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/login')

  await page
    .getByRole('button', { name: 'Sign in with a one-time token' })
    .click()
  await page.getByLabel('Token').click()
  await page.getByLabel('Token').fill('987654')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL('/')
})
