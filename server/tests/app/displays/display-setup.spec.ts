import { test, expect } from '@playwright/test'

test('Add display', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('AddIcon').click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page
    .getByLabel('Add Display', { exact: true })
    .getByRole('button')
    .click()
  
  await expect(page).toHaveURL('/displays/1')
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/displays/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.name === 'My display' &&
      res.status() === 204
    )
  })
  await expect(page.locator('#title')).toBeFocused()
  await expect(page.locator('#title')).toHaveValue('New display')
  await page.locator('#title').fill('My display')
  await page.locator('#title').press('Enter')
  await expect(page.getByRole('heading')).toHaveText('My display')
  await responsePromise
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/')
  await page.locator('#vertical-tab-3').click()
  await expect(page).toHaveURL('/displays')
  await page.getByRole('button', { name: 'My display', exact: true }).click()
  await expect(page).toHaveURL('/displays/1')
})

// TODO add display tests

test('Clone display', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await page.goto('/displays/1')
  await expect(page).toHaveURL('/displays/1')

  await page
    .getByRole('button', { name: 'Clone Display', exact: true })
    .hover()
  await expect(
    page.getByRole('tooltip', { name: 'Clone Display', exact: true })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Clone Display', exact: true })
    .click()

  await expect(page).toHaveURL('/displays/2')
  await expect(page.getByRole('alert')).toHaveText('Clone successful!')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/displays/2' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.name === 'Clone display' &&
      res.status() === 204
    )
  })
  await expect(page.locator('#title')).toBeFocused()
  await expect(page.locator('#title')).toHaveValue('My display')
  await page.locator('#title').fill('Clone display')
  await page.locator('#title').press('Enter')
  await expect(page.getByRole('heading')).toHaveText('Clone display')
  await responsePromise
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/displays/1')
  await page.goto('/displays')
  await expect(page).toHaveURL('/displays')
  await expect(page.getByRole('button', { name: 'My display', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Clone display', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Clone display', exact: true }).click()
  await expect(page).toHaveURL('/displays/2')
})

test('Delete cloned display', async ({ page }) => {
  await page.goto('/displays')
  await expect(page).toHaveURL('/displays')
  await expect(page.getByRole('button', { name: 'My display', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Clone display', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Clone display', exact: true }).click()
  await expect(page).toHaveURL('/displays/2')

  await page
    .getByRole('button', { name: 'Delete Display', exact: true })
    .hover()
  await expect(
    page.getByRole('tooltip', { name: 'Delete Display', exact: true })
  ).toBeVisible()

  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page
    .getByRole('button', { name: 'Delete Display', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(
    "Delete 'Clone display'"
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Are you sure you want to delete Clone display?'
  )
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).not.toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'OK', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'OK', exact: true })
  ).not.toBeDisabled()

  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page).toHaveURL('/displays/2')

  await page
    .getByRole('button', { name: 'Delete Display', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(page).toHaveURL('/displays')
  await expect(page.getByRole('button', { name: 'My display', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Clone display', exact: true })).not.toBeVisible()
})

test('Delete display', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await page.goto('/displays/1')
  await expect(page).toHaveURL('/displays/1')

  await page
    .getByRole('button', { name: 'Delete Display', exact: true })
    .hover()
  await expect(
    page.getByRole('tooltip', { name: 'Delete Display', exact: true })
  ).toBeVisible()

  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page
    .getByRole('button', { name: 'Delete Display', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(
    "Delete 'My display'"
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Are you sure you want to delete My display?'
  )
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).not.toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'OK', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'OK', exact: true })
  ).not.toBeDisabled()

  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page).toHaveURL('/displays/1')

  await page
    .getByRole('button', { name: 'Delete Display', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(page).toHaveURL('/')
})
