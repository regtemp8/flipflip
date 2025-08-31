import { test, expect } from '@playwright/test'

test('Add audio playlist', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('AddIcon').click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page
    .getByLabel('Add Playlist', { exact: true })
    .getByRole('button')
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(
    'Create Playlist'
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Choose the type of playlist you want to create.'
  )
  await expect(
    page.getByRole('button', { name: 'Audio Playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Scene Playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Script Playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).not.toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Create', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Create', exact: true })
  ).toBeDisabled()

  await page
    .getByRole('button', { name: 'Audio Playlist', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Create', exact: true })
  ).not.toBeDisabled()
  await page.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(page).toHaveURL('/playlists/1')
  await expect(page.locator('#title')).toBeFocused()
  await expect(page.locator('#title')).toHaveValue('New playlist')
  await page.locator('#title').fill('Song playlist')
  await page.locator('#title').press('Enter')
  await expect(page.getByRole('heading')).toHaveText('Song playlist')
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/')
  await page.locator('#vertical-tab-4').click()
  await expect(page).toHaveURL('/playlists')
  await page.getByRole('button', { name: 'Song playlist' }).click()
  await expect(page).toHaveURL('/playlists/1')
})

// TODO add audio playlist tests

test('Delete audio playlist', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await page.goto('/playlists/1')
  await expect(page).toHaveURL('/playlists/1')

  await page
    .getByRole('button', { name: 'Delete Playlist', exact: true })
    .hover()
  await expect(
    page.getByRole('tooltip', { name: 'Delete Playlist', exact: true })
  ).toBeVisible()

  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page
    .getByRole('button', { name: 'Delete Playlist', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(
    "Delete 'Song playlist'"
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Are you sure you want to delete Song playlist? It will be automatically removed from all scenes.'
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
  await expect(page).toHaveURL('/playlists/1')

  await page
    .getByRole('button', { name: 'Delete Playlist', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(page).toHaveURL('/')

  // TODO add playlist to scene, delete playlist, then check if playlist is also deleted in scene
})

test('Add script playlist', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('AddIcon').click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page
    .getByLabel('Add Playlist', { exact: true })
    .getByRole('button')
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(
    'Create Playlist'
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Choose the type of playlist you want to create.'
  )
  await expect(
    page.getByRole('button', { name: 'Audio Playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Scene Playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Script Playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).not.toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Create', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Create', exact: true })
  ).toBeDisabled()

  await page
    .getByRole('button', { name: 'Script Playlist', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Create', exact: true })
  ).not.toBeDisabled()
  await page.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(page).toHaveURL('/playlists/2')
  await expect(page.locator('#title')).toBeFocused()
  await expect(page.locator('#title')).toHaveValue('New playlist')
  await page.locator('#title').fill('Script playlist')
  await page.locator('#title').press('Enter')
  await expect(page.getByRole('heading')).toHaveText('Script playlist')
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/')
  await page.locator('#vertical-tab-4').click()
  await expect(page).toHaveURL('/playlists')
  await page.getByRole('button', { name: 'Script playlist' }).click()
  await expect(page).toHaveURL('/playlists/2')
})

// TODO add script playlist tests

test('Delete script playlist', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await page.goto('/playlists/2')
  await expect(page).toHaveURL('/playlists/2')

  await page
    .getByRole('button', { name: 'Delete Playlist', exact: true })
    .hover()
  await expect(
    page.getByRole('tooltip', { name: 'Delete Playlist', exact: true })
  ).toBeVisible()

  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page
    .getByRole('button', { name: 'Delete Playlist', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(
    "Delete 'Script playlist'"
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Are you sure you want to delete Script playlist? It will be automatically removed from all scenes.'
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
  await expect(page).toHaveURL('/playlists/2')

  await page
    .getByRole('button', { name: 'Delete Playlist', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(page).toHaveURL('/')

  // TODO add playlist to scene, delete playlist, then check if playlist is also deleted in scene
})

test('Add scene playlist', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('AddIcon').click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page
    .getByLabel('Add Playlist', { exact: true })
    .getByRole('button')
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(
    'Create Playlist'
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Choose the type of playlist you want to create.'
  )
  await expect(
    page.getByRole('button', { name: 'Audio Playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Scene Playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Script Playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).not.toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Create', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Create', exact: true })
  ).toBeDisabled()

  await page
    .getByRole('button', { name: 'Scene Playlist', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Create', exact: true })
  ).not.toBeDisabled()
  await page.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(page).toHaveURL('/playlists/3')
  await expect(page.locator('#title')).toBeFocused()
  await expect(page.locator('#title')).toHaveValue('New playlist')
  await page.locator('#title').fill('Scene playlist')
  await page.locator('#title').press('Enter')
  await expect(page.getByRole('heading')).toHaveText('Scene playlist')
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/')
  await page.locator('#vertical-tab-4').click()
  await expect(page).toHaveURL('/playlists')
  await page.getByRole('button', { name: 'Scene playlist' }).click()
  await expect(page).toHaveURL('/playlists/3')
})

// TODO add scene playlist tests

test('Delete scene playlist', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await page.goto('/playlists/3')
  await expect(page).toHaveURL('/playlists/3')

  await page
    .getByRole('button', { name: 'Delete Playlist', exact: true })
    .hover()
  await expect(
    page.getByRole('tooltip', { name: 'Delete Playlist', exact: true })
  ).toBeVisible()

  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page
    .getByRole('button', { name: 'Delete Playlist', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(
    "Delete 'Scene playlist'"
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Are you sure you want to delete Scene playlist? It will be automatically removed from all displays.'
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
  await expect(page).toHaveURL('/playlists/3')

  await page
    .getByRole('button', { name: 'Delete Playlist', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(page).toHaveURL('/')

  // TODO add playlist to display, delete playlist, then check if playlist is also deleted in display
})
