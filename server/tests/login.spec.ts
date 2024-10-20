import { test, expect } from '@playwright/test'

test('Failed password login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/login')

  await page.getByLabel('Username').click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Username').press('Tab');
  await page.getByLabel('Password').fill('incorrect');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/login')
})

test('Successfull password login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/login')

  await page.getByRole('button', { name: 'Sign in with a one-time token' }).click();
  await page.getByRole('button', { name: 'Sign in with username and password' }).click();

  await page.getByLabel('Username').click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Username').press('Tab');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/')
})

test('Failed token login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/login')

  await page.getByRole('button', { name: 'Sign in with a one-time token' }).click();
  await page.getByLabel('Token').click();
  await page.getByLabel('Token').fill('123456');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/login')
})

test('Successfull token login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/login')

  await page.getByRole('button', { name: 'Sign in with a one-time token' }).click();
  await page.getByLabel('Token').click();
  await page.getByLabel('Token').fill('987654');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/')
})