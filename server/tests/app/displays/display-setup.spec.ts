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

test('No playlist selected', async ({ page }) => {
  await page.goto('/displays/1')
  await expect(page).toHaveURL('/displays/1')

  const item = page.locator('#sortable-list').getByRole('listitem')
  await expect(item).toHaveCount(1)
  await expect(item.getByTestId('PlayDisabledIcon')).toBeVisible()
  await item.getByTestId('PlayDisabledIcon').hover()
  await expect(
    page.getByRole('tooltip', { name: 'No playlist selected', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Play', exact: true })
  ).toBeDisabled()
})

test('No synced view selected', async ({ page }) => {
  await page.goto('/displays/1')
  await expect(page).toHaveURL('/displays/1')

  const item = page.locator('#sortable-list').getByRole('listitem')
  await expect(item).toHaveCount(1)

  await page
    .getByLabel('Clone View', { exact: true })
    .getByRole('button')
    .click()
  await expect(item).toHaveCount(2)

  await page.getByText('Sync', { exact: true }).click()
  await expect(item.nth(1).getByTestId('PlayDisabledIcon')).toBeVisible()
  await item.nth(1).getByTestId('PlayDisabledIcon').hover()
  await expect(
    page.getByRole('tooltip', { name: 'No synced view selected', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Play', exact: true })
  ).toBeDisabled()
})

test('Synced view disabled', async ({ page }) => {
  await page.goto('/displays/1')
  await expect(page).toHaveURL('/displays/1')

  const item = page.locator('#sortable-list').getByRole('listitem')
  await expect(item).toHaveCount(2)

  await item.nth(1).click()
  await page.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'New view', exact: true }).click()
  await expect(item.nth(1).getByTestId('PlayDisabledIcon')).toBeVisible()
  await item.nth(1).getByTestId('PlayDisabledIcon').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Synced view is disabled', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Play', exact: true })
  ).toBeDisabled()
})

test('Playlist selected', async ({ page }) => {
  await page.goto('/displays/1')
  await expect(page).toHaveURL('/displays/1')

  const item = page.locator('#sortable-list').getByRole('listitem')
  await expect(item).toHaveCount(2)
  await expect(item.getByTestId('PlayDisabledIcon')).toHaveCount(2)

  await page
    .getByRole('combobox', { name: 'Scene Playlist', exact: true })
    .click()
  await page
    .getByRole('combobox', { name: 'Scene Playlist', exact: true })
    .fill('New playlist')
  await page
    .getByRole('option', { name: 'Add "New playlist"', exact: true })
    .click()
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/playlists/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.name === 'New playlist' &&
      res.status() === 204
    )
  })
  await expect(page).toHaveURL('/playlists/1')
  await page.locator('#title').press('Enter')
  await responsePromise
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/displays/1')
  await expect(
    page.getByRole('combobox', { name: 'Scene Playlist', exact: true })
  ).toHaveValue('New playlist')

  await page.getByLabel('Open Scene Playlist').getByRole('button').click()
  await page.getByRole('heading', { name: 'New playlist' }).dblclick()
  await page.locator('#title').fill('My Playlist')
  await page.locator('#title').press('Enter')
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/displays/1')
  await expect(
    page.getByRole('combobox', { name: 'Scene Playlist', exact: true })
  ).toHaveValue('My Playlist')

  await expect(item).toHaveCount(2)
  await expect(item.getByTestId('PlayDisabledIcon')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Play', exact: true })
  ).not.toBeDisabled()
})

test('Synced view hidden', async ({ page }) => {
  await page.goto('/displays/1')
  await expect(page).toHaveURL('/displays/1')

  const item = page.locator('#sortable-list').getByRole('listitem')
  await expect(item).toHaveCount(2)
  await expect(item.getByTestId('PlayDisabledIcon')).toHaveCount(0)

  await page.locator('#sortable-list').getByRole('button').first().click()
  await expect(item.getByTestId('PlayDisabledIcon')).toHaveCount(1)
  await expect(item.nth(1).getByTestId('PlayDisabledIcon')).toBeVisible()
  await item.nth(1).getByTestId('PlayDisabledIcon').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Synced view is hidden', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Play', exact: true })
  ).toBeDisabled()
})

// TODO add display tests

test('Clone display', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await page.goto('/displays/1')
  await expect(page).toHaveURL('/displays/1')

  await page.getByRole('button', { name: 'Clone Display', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Clone Display', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clone Display', exact: true }).click()

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
  await expect(
    page.getByRole('button', { name: 'My display', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Clone display', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clone display', exact: true }).click()
  await expect(page).toHaveURL('/displays/2')
})

test('Delete cloned display', async ({ page }) => {
  await page.goto('/displays')
  await expect(page).toHaveURL('/displays')
  await expect(
    page.getByRole('button', { name: 'My display', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Clone display', exact: true })
  ).toBeVisible()
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
  await expect(
    page.getByRole('button', { name: 'My display', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Clone display', exact: true })
  ).not.toBeVisible()
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
