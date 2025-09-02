import { test, expect } from '@playwright/test'

test('Add scene', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('AddIcon').click()
  await page.getByRole('button', { name: 'Add Scene', exact: true }).click()
  await expect(page).toHaveURL('/scenes/2')
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/2' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.name === 'My scene' &&
      res.status() === 204
    )
  })
  await expect(page.locator('#title')).toBeFocused()
  await expect(page.locator('#title')).toHaveValue('New scene')
  await page.locator('#title').fill('My scene')
  await page.locator('#title').press('Enter')
  await expect(page.getByRole('heading')).toHaveText('My scene')
  await responsePromise
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/')
  await page.locator('#vertical-tab-0').click()
  await expect(page).toHaveURL('/scenes')
  await page.getByRole('button', { name: 'My scene', exact: true }).click()
  await expect(page).toHaveURL('/scenes/2')
})

// TODO add scene tests

test('Clone scene', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await page.goto('/scenes/2')
  await expect(page).toHaveURL('/scenes/2')

  await page.getByRole('button', { name: 'Clone Scene', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Clone Scene', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clone Scene', exact: true }).click()

  await expect(page).toHaveURL('/scenes/3')
  await expect(page.getByRole('alert')).toHaveText('Clone successful!')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/scenes/3' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.name === 'Clone scene' &&
      res.status() === 204
    )
  })
  await expect(page.locator('#title')).toBeFocused()
  await expect(page.locator('#title')).toHaveValue('My scene')
  await page.locator('#title').fill('Clone scene')
  await page.locator('#title').press('Enter')
  await expect(page.getByRole('heading')).toHaveText('Clone scene')
  await responsePromise
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/scenes/2')
  await page.goto('/scenes')
  await expect(page).toHaveURL('/scenes')
  await expect(
    page.getByRole('button', { name: 'My scene', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Clone scene', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clone scene', exact: true }).click()
  await expect(page).toHaveURL('/scenes/3')
})

test('Delete cloned scene', async ({ page }) => {
  await page.goto('/scenes')
  await expect(page).toHaveURL('/scenes')
  await expect(
    page.getByRole('button', { name: 'My scene', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Clone scene', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clone scene', exact: true }).click()
  await expect(page).toHaveURL('/scenes/3')

  await page.getByRole('button', { name: 'Delete Scene', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Delete Scene', exact: true })
  ).toBeVisible()

  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.getByRole('button', { name: 'Delete Scene', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(
    "Delete 'Clone scene'"
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Are you sure you want to delete Clone scene? It will be automatically removed from all playlists.'
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
  await expect(page).toHaveURL('/scenes/3')

  await page.getByRole('button', { name: 'Delete Scene', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(page).toHaveURL('/scenes')
  await expect(
    page.getByRole('button', { name: 'My scene', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Clone scene', exact: true })
  ).not.toBeVisible()
})

test('Delete scene', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await page.goto('/scenes/2')
  await expect(page).toHaveURL('/scenes/2')

  await page.getByRole('button', { name: 'Delete Scene', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Delete Scene', exact: true })
  ).toBeVisible()

  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.getByRole('button', { name: 'Delete Scene', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(
    "Delete 'My scene'"
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Are you sure you want to delete My scene? It will be automatically removed from all playlists.'
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
  await expect(page).toHaveURL('/scenes/2')

  await page.getByRole('button', { name: 'Delete Scene', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(page).toHaveURL('/')
})
