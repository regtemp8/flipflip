import { test, expect } from '@playwright/test'

const url = 'https://pastebin.com/raw/ZNJ5A40S'
test.beforeAll(async ({ page }) => {
  await page.goto('/script-library')
  await page.getByTestId('AddIcon').click()
  await expect(page.getByTestId('HttpIcon')).toBeVisible()

  let responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/1' &&
      request.method() === 'GET' &&
      res.status() === 200
    )
  })
  await page.getByTestId('HttpIcon').click()

  await expect(page.locator('#sortable-list li')).toHaveCount(1)
  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/1' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await page.locator('#sortable-list li input').fill(url)
  await expect(page.locator('#sortable-list li input')).toHaveValue(url)
  await page.locator('.MuiDrawer-root').click()
  await responsePromise
})

test.afterAll(async ({page}) => {
  await page.goto('/script-library')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/1' &&
      request.method() === 'DELETE' &&
      res.status() === 204
    )
  })
  await page.getByTestId('DeleteIcon').nth(0).click()
  await responsePromise
})

test.beforeEach(async ({ page }) => {
  await page.goto('/scripts/1/options')
})

test('Title', async ({page}) => {
  await expect(
    page.getByRole('heading', { name: url, exact: true })
  ).toBeVisible()
})