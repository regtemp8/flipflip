import path from 'path'
import { test, expect } from '@playwright/test'
import { RP } from 'flipflip-common'
import { dragAndDrop } from '../utils'

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
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/playlists/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.name === 'Song playlist' &&
      res.status() === 204
    )
  })
  await expect(page.locator('#title')).toBeFocused()
  await expect(page.locator('#title')).toHaveValue('New playlist')
  await page.locator('#title').fill('Song playlist')
  await page.locator('#title').press('Enter')
  await expect(page.getByRole('heading')).toHaveText('Song playlist')
  await responsePromise
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/')
  await page.locator('#vertical-tab-4').click()
  await expect(page).toHaveURL('/playlists')
  await page.getByRole('button', { name: 'Song playlist', exact: true }).click()
  await expect(page).toHaveURL('/playlists/1')
})

test('Shuffle audio playlist', async ({ page }) => {
  await page.goto('/playlists/1')
  await expect(page).toHaveURL('/playlists/1')

  await expect(page.getByTestId('ShuffleIcon')).toHaveCSS(
    'color',
    'rgba(0, 0, 0, 0.54)'
  )
  await page.getByRole('button', { name: 'Shuffle (Off)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Shuffle (Off)', exact: true })
  ).toBeVisible()

  await page.getByRole('button', { name: 'Shuffle (Off)', exact: true }).click()
  await expect(page.getByTestId('ShuffleIcon')).toHaveCSS(
    'color',
    'rgb(63, 81, 181)'
  )
  await page.getByRole('button', { name: 'Shuffle (On)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Shuffle (On)', exact: true })
  ).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/playlists/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.shuffle === false &&
      res.status() === 204
    )
  })
  await page.getByRole('button', { name: 'Shuffle (On)', exact: true }).click()
  await expect(page.getByTestId('ShuffleIcon')).toHaveCSS(
    'color',
    'rgba(0, 0, 0, 0.54)'
  )
  await page.getByRole('button', { name: 'Shuffle (Off)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Shuffle (Off)', exact: true })
  ).toBeVisible()
  await responsePromise
})

test('Repeat audio playlist', async ({ page }) => {
  await page.goto('/playlists/1')
  await expect(page).toHaveURL('/playlists/1')

  await expect(page.getByTestId('RepeatIcon')).toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).not.toBeVisible()
  await expect(page.getByTestId('RepeatIcon')).toHaveCSS(
    'color',
    'rgb(63, 81, 181)'
  )
  await page.getByRole('button', { name: 'Repeat (All)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Repeat (All)', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Repeat (All)', exact: true }).click()

  await expect(page.getByTestId('RepeatIcon')).not.toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).toHaveCSS(
    'color',
    'rgb(63, 81, 181)'
  )
  await page.getByRole('button', { name: 'Repeat (One)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Repeat (One)', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Repeat (One)', exact: true }).click()

  await expect(page.getByTestId('RepeatIcon')).toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).not.toBeVisible()
  await expect(page.getByTestId('RepeatIcon')).toHaveCSS(
    'color',
    'rgba(0, 0, 0, 0.54)'
  )
  await page.getByRole('button', { name: 'Repeat (Off)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Repeat (Off)', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Repeat (Off)', exact: true }).click()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/playlists/1' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.repeat === RP.all &&
      res.status() === 204
    )
  })
  await expect(page.getByTestId('RepeatIcon')).toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).not.toBeVisible()
  await expect(page.getByTestId('RepeatIcon')).toHaveCSS(
    'color',
    'rgb(63, 81, 181)'
  )
  await page.getByRole('button', { name: 'Repeat (All)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Repeat (All)', exact: true })
  ).toBeVisible()
  await responsePromise
})

// TODO add audio playlist tests

test('Clone audio playlist', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await page.goto('/playlists/1')
  await expect(page).toHaveURL('/playlists/1')

  await page
    .getByRole('button', { name: 'Clone Playlist', exact: true })
    .hover()
  await expect(
    page.getByRole('tooltip', { name: 'Clone Playlist', exact: true })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Clone Playlist', exact: true })
    .click()

  await expect(page).toHaveURL('/playlists/2')
  await expect(page.getByRole('alert')).toHaveText('Clone successful!')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/playlists/2' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.name === 'Song clone' &&
      res.status() === 204
    )
  })
  await expect(page.locator('#title')).toBeFocused()
  await expect(page.locator('#title')).toHaveValue('Song playlist')
  await page.locator('#title').fill('Song clone')
  await page.locator('#title').press('Enter')
  await expect(page.getByRole('heading')).toHaveText('Song clone')
  await responsePromise
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/playlists/1')
  await page.goto('/playlists')
  await expect(page).toHaveURL('/playlists')
  await expect(
    page.getByRole('button', { name: 'Song playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Song clone', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Song clone', exact: true }).click()
  await expect(page).toHaveURL('/playlists/2')
})

test('Delete cloned audio playlist', async ({ page }) => {
  await page.goto('/playlists')
  await expect(page).toHaveURL('/playlists')
  await expect(
    page.getByRole('button', { name: 'Song playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Song clone', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Song clone', exact: true }).click()
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
    "Delete 'Song clone'"
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Are you sure you want to delete Song clone? It will be automatically removed from all scenes.'
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
  await expect(page).toHaveURL('/playlists')
  await expect(
    page.getByRole('button', { name: 'Song playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Song clone', exact: true })
  ).not.toBeVisible()

  // TODO add playlist to scene, delete playlist, then check if playlist is also deleted in scene
})

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
  await expect(page).toHaveURL('/playlists/3')
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/playlists/3' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.name === 'Script playlist' &&
      res.status() === 204
    )
  })
  await expect(page.locator('#title')).toBeFocused()
  await expect(page.locator('#title')).toHaveValue('New playlist')
  await page.locator('#title').fill('Script playlist')
  await page.locator('#title').press('Enter')
  await expect(page.getByRole('heading')).toHaveText('Script playlist')
  await responsePromise
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/')
  await page.locator('#vertical-tab-4').click()
  await expect(page).toHaveURL('/playlists')
  await page
    .getByRole('button', { name: 'Script playlist', exact: true })
    .click()
  await expect(page).toHaveURL('/playlists/3')
})

test('Shuffle script playlist', async ({ page }) => {
  await page.goto('/playlists/3')
  await expect(page).toHaveURL('/playlists/3')

  await expect(page.getByTestId('ShuffleIcon')).toHaveCSS(
    'color',
    'rgba(0, 0, 0, 0.54)'
  )
  await page.getByRole('button', { name: 'Shuffle (Off)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Shuffle (Off)', exact: true })
  ).toBeVisible()

  await page.getByRole('button', { name: 'Shuffle (Off)', exact: true }).click()
  await expect(page.getByTestId('ShuffleIcon')).toHaveCSS(
    'color',
    'rgb(63, 81, 181)'
  )
  await page.getByRole('button', { name: 'Shuffle (On)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Shuffle (On)', exact: true })
  ).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/playlists/3' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.shuffle === false &&
      res.status() === 204
    )
  })
  await page.getByRole('button', { name: 'Shuffle (On)', exact: true }).click()
  await expect(page.getByTestId('ShuffleIcon')).toHaveCSS(
    'color',
    'rgba(0, 0, 0, 0.54)'
  )
  await page.getByRole('button', { name: 'Shuffle (Off)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Shuffle (Off)', exact: true })
  ).toBeVisible()
  await responsePromise
})

test('Repeat script playlist', async ({ page }) => {
  await page.goto('/playlists/3')
  await expect(page).toHaveURL('/playlists/3')

  await expect(page.getByTestId('RepeatIcon')).toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).not.toBeVisible()
  await expect(page.getByTestId('RepeatIcon')).toHaveCSS(
    'color',
    'rgb(63, 81, 181)'
  )
  await page.getByRole('button', { name: 'Repeat (All)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Repeat (All)', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Repeat (All)', exact: true }).click()

  await expect(page.getByTestId('RepeatIcon')).not.toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).toHaveCSS(
    'color',
    'rgb(63, 81, 181)'
  )
  await page.getByRole('button', { name: 'Repeat (One)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Repeat (One)', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Repeat (One)', exact: true }).click()

  await expect(page.getByTestId('RepeatIcon')).toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).not.toBeVisible()
  await expect(page.getByTestId('RepeatIcon')).toHaveCSS(
    'color',
    'rgba(0, 0, 0, 0.54)'
  )
  await page.getByRole('button', { name: 'Repeat (Off)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Repeat (Off)', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Repeat (Off)', exact: true }).click()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/playlists/3' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.repeat === RP.all &&
      res.status() === 204
    )
  })
  await expect(page.getByTestId('RepeatIcon')).toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).not.toBeVisible()
  await expect(page.getByTestId('RepeatIcon')).toHaveCSS(
    'color',
    'rgb(63, 81, 181)'
  )
  await page.getByRole('button', { name: 'Repeat (All)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Repeat (All)', exact: true })
  ).toBeVisible()
  await responsePromise
})

// TODO add script playlist tests

test('Clone script playlist', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await page.goto('/playlists/3')
  await expect(page).toHaveURL('/playlists/3')

  await page
    .getByRole('button', { name: 'Clone Playlist', exact: true })
    .hover()
  await expect(
    page.getByRole('tooltip', { name: 'Clone Playlist', exact: true })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Clone Playlist', exact: true })
    .click()

  await expect(page).toHaveURL('/playlists/4')
  await expect(page.getByRole('alert')).toHaveText('Clone successful!')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/playlists/4' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.name === 'Script clone' &&
      res.status() === 204
    )
  })
  await expect(page.locator('#title')).toBeFocused()
  await expect(page.locator('#title')).toHaveValue('Script playlist')
  await page.locator('#title').fill('Script clone')
  await page.locator('#title').press('Enter')
  await expect(page.getByRole('heading')).toHaveText('Script clone')
  await responsePromise
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/playlists/3')
  await page.goto('/playlists')
  await expect(page).toHaveURL('/playlists')
  await expect(
    page.getByRole('button', { name: 'Script playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Script clone', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Script clone', exact: true }).click()
  await expect(page).toHaveURL('/playlists/4')
})

test('Delete cloned script playlist', async ({ page }) => {
  await page.goto('/playlists')
  await expect(page).toHaveURL('/playlists')
  await expect(
    page.getByRole('button', { name: 'Script playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Script clone', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Script clone', exact: true }).click()
  await expect(page).toHaveURL('/playlists/4')

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
    "Delete 'Script clone'"
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Are you sure you want to delete Script clone? It will be automatically removed from all scenes.'
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
  await expect(page).toHaveURL('/playlists/4')

  await page
    .getByRole('button', { name: 'Delete Playlist', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(page).toHaveURL('/playlists')
  await expect(
    page.getByRole('button', { name: 'Script playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Script clone', exact: true })
  ).not.toBeVisible()

  // TODO add playlist to scene, delete playlist, then check if playlist is also deleted in scene
})

test('Delete script playlist', async ({ page }) => {
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
  await expect(page).toHaveURL('/playlists/3')

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
  await expect(page).toHaveURL('/playlists/5')
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/playlists/5' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.name === 'Scene playlist' &&
      res.status() === 204
    )
  })
  await expect(page.locator('#title')).toBeFocused()
  await expect(page.locator('#title')).toHaveValue('New playlist')
  await page.locator('#title').fill('Scene playlist')
  await page.locator('#title').press('Enter')
  await expect(page.getByRole('heading')).toHaveText('Scene playlist')
  await responsePromise
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/')
  await page.locator('#vertical-tab-4').click()
  await expect(page).toHaveURL('/playlists')
  await page
    .getByRole('button', { name: 'Scene playlist', exact: true })
    .click()
  await expect(page).toHaveURL('/playlists/5')
})

test('Shuffle scene playlist', async ({ page }) => {
  await page.goto('/playlists/5')
  await expect(page).toHaveURL('/playlists/5')

  await expect(page.getByTestId('ShuffleIcon')).toHaveCSS(
    'color',
    'rgba(0, 0, 0, 0.54)'
  )
  await page.getByRole('button', { name: 'Shuffle (Off)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Shuffle (Off)', exact: true })
  ).toBeVisible()

  await page.getByRole('button', { name: 'Shuffle (Off)', exact: true }).click()
  await expect(page.getByTestId('ShuffleIcon')).toHaveCSS(
    'color',
    'rgb(63, 81, 181)'
  )
  await page.getByRole('button', { name: 'Shuffle (On)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Shuffle (On)', exact: true })
  ).toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/playlists/5' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.shuffle === false &&
      res.status() === 204
    )
  })
  await page.getByRole('button', { name: 'Shuffle (On)', exact: true }).click()
  await expect(page.getByTestId('ShuffleIcon')).toHaveCSS(
    'color',
    'rgba(0, 0, 0, 0.54)'
  )
  await page.getByRole('button', { name: 'Shuffle (Off)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Shuffle (Off)', exact: true })
  ).toBeVisible()
  await responsePromise
})

test('Repeat scene playlist', async ({ page }) => {
  await page.goto('/playlists/5')
  await expect(page).toHaveURL('/playlists/5')

  await expect(page.getByTestId('RepeatIcon')).toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).not.toBeVisible()
  await expect(page.getByTestId('RepeatIcon')).toHaveCSS(
    'color',
    'rgb(63, 81, 181)'
  )
  await page.getByRole('button', { name: 'Repeat (All)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Repeat (All)', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Repeat (All)', exact: true }).click()

  await expect(page.getByTestId('RepeatIcon')).not.toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).toHaveCSS(
    'color',
    'rgb(63, 81, 181)'
  )
  await page.getByRole('button', { name: 'Repeat (One)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Repeat (One)', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Repeat (One)', exact: true }).click()

  await expect(page.getByTestId('RepeatIcon')).toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).not.toBeVisible()
  await expect(page.getByTestId('RepeatIcon')).toHaveCSS(
    'color',
    'rgba(0, 0, 0, 0.54)'
  )
  await page.getByRole('button', { name: 'Repeat (Off)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Repeat (Off)', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Repeat (Off)', exact: true }).click()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/playlists/5' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.repeat === RP.all &&
      res.status() === 204
    )
  })
  await expect(page.getByTestId('RepeatIcon')).toBeVisible()
  await expect(page.getByTestId('RepeatOneIcon')).not.toBeVisible()
  await expect(page.getByTestId('RepeatIcon')).toHaveCSS(
    'color',
    'rgb(63, 81, 181)'
  )
  await page.getByRole('button', { name: 'Repeat (All)', exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Repeat (All)', exact: true })
  ).toBeVisible()
  await responsePromise
})

test('Clone scene playlist', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await page.goto('/playlists/5')
  await expect(page).toHaveURL('/playlists/5')

  await page
    .getByRole('button', { name: 'Clone Playlist', exact: true })
    .hover()
  await expect(
    page.getByRole('tooltip', { name: 'Clone Playlist', exact: true })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Clone Playlist', exact: true })
    .click()

  await expect(page).toHaveURL('/playlists/6')
  await expect(page.getByRole('alert')).toHaveText('Clone successful!')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/playlists/6' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.name === 'Scene clone' &&
      res.status() === 204
    )
  })
  await expect(page.locator('#title')).toBeFocused()
  await expect(page.locator('#title')).toHaveValue('Scene playlist')
  await page.locator('#title').fill('Scene clone')
  await page.locator('#title').press('Enter')
  await expect(page.getByRole('heading')).toHaveText('Scene clone')
  await responsePromise
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/playlists/5')
  await page.goto('/playlists')
  await expect(page).toHaveURL('/playlists')
  await expect(
    page.getByRole('button', { name: 'Scene playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Scene clone', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Scene clone', exact: true }).click()
  await expect(page).toHaveURL('/playlists/6')
})

test('Delete cloned scene playlist', async ({ page }) => {
  await page.goto('/playlists')
  await expect(page).toHaveURL('/playlists')
  await expect(
    page.getByRole('button', { name: 'Scene playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Scene clone', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Scene clone', exact: true }).click()
  await expect(page).toHaveURL('/playlists/6')

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
    "Delete 'Scene clone'"
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Are you sure you want to delete Scene clone? It will be automatically removed from all displays.'
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
  await expect(page).toHaveURL('/playlists/6')

  await page
    .getByRole('button', { name: 'Delete Playlist', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(page).toHaveURL('/playlists')
  await expect(
    page.getByRole('button', { name: 'Scene playlist', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Scene clone', exact: true })
  ).not.toBeVisible()

  // TODO add playlist to scene, delete playlist, then check if playlist is also deleted in scene
})

// TODO add scene playlist tests
test('Add scene playlist items', async ({ page }) => {
  await page.goto('/playlists/5')
  await expect(page).toHaveURL('/playlists/5')
  const listItems = page.locator('#scene-playlist-items li')
  await expect(listItems).toHaveCount(0)

  await page.getByRole('button', { name: 'Add Scenes' }).click()
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(listItems).toHaveCount(0)

  await page.getByRole('button', { name: 'Add Scenes' }).click()
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(listItems).toHaveCount(1)
  await expect(listItems.nth(0)).toHaveText('None')

  await page.getByRole('button', { name: 'Add Scenes' }).click()
  await page.locator('#scene-playlist-item-scene-select').click()
  await page.getByRole('option', { name: 'Random' }).click()
  await page.locator('#multi-scene-select').click()
  await page.getByRole('option', { name: 'None' }).click()
  await page
    .locator('div')
    .filter({ hasText: 'SceneSelect which scenes to' })
    .nth(1)
    .click()
  await page.getByRole('spinbutton', { name: 'Play for' }).click()
  await page.getByRole('spinbutton', { name: 'Play for' }).fill('300000')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(listItems).toHaveCount(2)
  await expect(listItems.nth(0)).toHaveText('None')
  await expect(listItems.nth(1)).toHaveText('Random')

  await page.getByRole('button', { name: 'Add Scenes' }).click();
  await page.locator('#scene-playlist-item-scene-select').click();
  await page.locator('#scene-playlist-item-scene-select').fill('Test');
  await expect(page.getByRole('option', { name: 'Add "Test"' })).toBeVisible();
  await page.getByRole('option', { name: 'Add "Test"' }).click();
  await expect(page).toHaveURL('/scenes/1')
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByTestId('ErrorOutlineIcon').nth(0)).toBeVisible();
  await page.locator('#scene-playlist-item-scene-select').click();
  await expect(page.getByRole('option', { name: 'Test' }).getByTestId('ErrorOutlineIcon')).toBeVisible();
  await page.getByText('CancelSave').click();
  await page.getByRole('spinbutton', { name: 'Play for' }).click();
  await page.getByRole('spinbutton', { name: 'Play for' }).fill('400000');
  await expect(page.getByRole('spinbutton', { name: 'Play for' })).toHaveValue('400000');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(listItems).toHaveCount(3)
  await expect(listItems.nth(0)).toHaveText('None')
  await expect(listItems.nth(1)).toHaveText('Random')
  await expect(listItems.nth(2)).toHaveText('Test')

  await page.getByRole('listitem').filter({ hasText: 'Test' }).getByLabel('Open Scene').getByRole('button').click();
  await expect(page).toHaveURL('/scenes/1')
  await page.locator('#vertical-tab-3').click();
  await expect(page).toHaveURL('/scenes/1/sources')
  await page.locator('.MuiButtonBase-root.MuiFab-root.MuiFab-circular.MuiFab-sizeLarge.MuiFab-default').click();
  await page.getByRole('button', { name: 'Local Directory' }).click();
  await page.getByRole('button', { name: /^thumbs/ }).click();
  await page.getByRole('button', { name: 'Choose' }).click();
  await expect(page.locator('#sortable-list li p')).toHaveText(
    path.resolve(__dirname, '..', '..', 'data', 'thumbs')
  )
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL('/playlists/5')
  await page.getByRole('listitem').filter({ hasText: 'Test' }).getByRole('button').nth(1).click();
  await expect(page.getByTestId('ErrorOutlineIcon')).not.toBeVisible();
  await page.locator('#scene-playlist-item-scene-select').click();
  await expect(page.getByRole('option', { name: 'Test' }).getByTestId('ErrorOutlineIcon')).not.toBeVisible();
  await page.getByText('CancelSave').click();
  await page.getByRole('checkbox', { name: 'Play After All Images' }).check();
  await expect(page.getByRole('checkbox', { name: 'Play After All Images' })).toBeChecked();
  await expect(page.getByRole('spinbutton', { name: 'Play for' })).not.toBeVisible();
  await page.getByRole('checkbox', { name: 'Play After All Images' }).uncheck();
  await expect(page.getByRole('checkbox', { name: 'Play After All Images' })).not.toBeChecked();
  await expect(page.getByRole('spinbutton', { name: 'Play for' })).toBeVisible();
  await expect(page.getByRole('spinbutton', { name: 'Play for' })).toHaveValue('400000');
  await page.getByRole('spinbutton', { name: 'Play for' }).click();
  await page.getByRole('spinbutton', { name: 'Play for' }).fill('450000');
  await expect(page.getByRole('spinbutton', { name: 'Play for' })).toHaveValue('450000');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(listItems).toHaveCount(3)
  await expect(listItems.nth(0)).toHaveText('None')
  await expect(listItems.nth(1)).toHaveText('Random')
  await expect(listItems.nth(2)).toHaveText('Test')

  await page.getByRole('listitem').filter({ hasText: 'Test' }).getByRole('button').nth(1).click();
  await expect(page.getByRole('spinbutton', { name: 'Play for' })).toHaveValue('450000');
  await page.getByRole('button', { name: 'Cancel' }).click();
})

test('Move scene playlist item', async ({ page }) => {
  await page.goto('/playlists/5')
  await expect(page).toHaveURL('/playlists/5')
  const listItems = page.locator('#scene-playlist-items li')
  await expect(listItems).toHaveCount(3)
  await expect(listItems.nth(0)).toHaveText('None')
  await expect(listItems.nth(1)).toHaveText('Random')
  await expect(listItems.nth(2)).toHaveText('Test')

  await dragAndDrop(page, '#scene-playlist-items li:last-child', '#scene-playlist-items li:first-child')
  await expect(listItems.nth(0)).toHaveText('Test')
  await expect(listItems.nth(1)).toHaveText('None')
  await expect(listItems.nth(2)).toHaveText('Random')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/playlists/5/move' &&
      request.method() === 'POST' &&
      res.status() === 204
    )
  })
  await page.waitForTimeout(2000)
  await dragAndDrop(page, '#scene-playlist-items li:nth-child(2)', '#scene-playlist-items li:first-child')
  await expect(listItems.nth(0)).toHaveText('None')
  await expect(listItems.nth(1)).toHaveText('Test')
  await expect(listItems.nth(2)).toHaveText('Random')
  await responsePromise
})

test('Delete scene playlist', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await page.goto('/playlists/5')
  await expect(page).toHaveURL('/playlists/5')

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
  await expect(page).toHaveURL('/playlists/5')

  await page
    .getByRole('button', { name: 'Delete Playlist', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(page).toHaveURL('/')

  // TODO add playlist to display, delete playlist, then check if playlist is also deleted in display
})
