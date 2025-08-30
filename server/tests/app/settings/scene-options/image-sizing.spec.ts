import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/settings/scene-options')
})

test('Image Sizing', async ({ page }) => {
  await page.getByRole('combobox').nth(1).click()
  await page
    .getByRole('option', { name: 'Fit Best (Clip Edges)', exact: true })
    .click()
  await expect(
    page.getByText('Image SizingFit Best (Clip Edges)')
  ).toBeVisible()

  await page.getByRole('combobox').nth(1).click()
  await page.getByRole('option', { name: 'Stretch', exact: true }).click()
  await expect(page.getByText('Image SizingStretch')).toBeVisible()

  await page.getByRole('combobox').nth(1).click()
  await page.getByRole('option', { name: 'Center', exact: true }).click()
  await expect(page.getByText('Image SizingCenter')).toBeVisible()

  await page.getByRole('combobox').nth(1).click()
  await page
    .getByRole('option', { name: 'Center (No Clipping)', exact: true })
    .click()
  await expect(page.getByText('Image SizingCenter (No Clipping)')).toBeVisible()

  await page.getByRole('combobox').nth(1).click()
  await page.getByRole('option', { name: 'Fit Width', exact: true }).click()
  await expect(page.getByText('Image SizingFit Width')).toBeVisible()

  await page.getByRole('combobox').nth(1).click()
  await page.getByRole('option', { name: 'Fit Height', exact: true }).click()
  await expect(page.getByText('Image SizingFit Height')).toBeVisible()

  await page.getByRole('combobox').nth(1).click()
  await page
    .getByRole('option', { name: 'Fit Best (No Clipping)', exact: true })
    .click()
  await expect(
    page.getByText('Image SizingFit Best (No Clipping)')
  ).toBeVisible()
})
