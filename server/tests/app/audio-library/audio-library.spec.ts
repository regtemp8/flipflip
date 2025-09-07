import { test, expect } from '@playwright/test'
import { dragListItem } from '../utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/audio-library')
})

// TODO add tutorial tests

test('Audio library navigation', async ({ page }) => {
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '288px')

  await page.locator('#vertical-tab-2').click()
  await expect(page).toHaveURL('/audio-library/albums')
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '192px')

  await page.locator('#vertical-tab-1').click()
  await expect(page).toHaveURL('/audio-library/artists')
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '96px')

  await page.locator('#vertical-tab-0').click()
  await expect(page).toHaveURL('/audio-library/playlists')
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '0px')

  await page.locator('#vertical-tab-3').click()
  await expect(page).toHaveURL('/audio-library/tracks')
  await expect(page.locator('.MuiTabs-indicator')).toHaveCSS('top', '288px')

  await page.getByLabel('Manage Tags').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Manage Tags', exact: true })
  ).toBeVisible()
  await page.getByLabel('Manage Tags').click()
  await expect(page).toHaveURL('/tags')
  await page.getByLabel('Back').click()
  await expect(page).toHaveURL('/audio-library/tracks')

  await page.locator('#vertical-tab-2').click()
  await expect(page).toHaveURL('/audio-library/albums')
  await page.getByLabel('Add to Playlist').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Add to Playlist', exact: true })
  ).toBeVisible()
  await page.getByLabel('Add to Playlist').click()
  await expect(page).toHaveURL('/audio-library/tracks')
  await page.getByLabel('Back').click()

  await page.locator('#vertical-tab-2').click()
  await expect(page).toHaveURL('/audio-library/albums')
  await page.getByLabel('Batch Tag').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Batch Tag', exact: true })
  ).toBeVisible()
  await page.getByLabel('Batch Tag').click()
  await expect(page).toHaveURL('/audio-library/tracks')
  await page.getByLabel('Back').click()

  await page.locator('#vertical-tab-2').click()
  await expect(page).toHaveURL('/audio-library/albums')
  await page.getByLabel('Batch Edit').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Batch Edit', exact: true })
  ).toBeVisible()
  await page.getByLabel('Batch Edit').click()
  await expect(page).toHaveURL('/audio-library/tracks')
  await page.getByLabel('Back').click()

  await expect(page.locator('#vertical-tab-0')).toHaveText('')
  await expect(page.locator('#vertical-tab-1')).toHaveText('')
  await expect(page.locator('#vertical-tab-2')).toHaveText('')
  await expect(page.locator('#vertical-tab-3')).toHaveText('')

  await page.getByRole('listitem').getByRole('button').click()
  await expect(page.locator('#root > div > div > div')).toHaveCSS(
    'width',
    '240px'
  )

  await expect(page.locator('#vertical-tab-0')).toHaveText('Playlists')
  await expect(page.locator('#vertical-tab-1')).toHaveText('Artists')
  await expect(page.locator('#vertical-tab-2')).toHaveText('Albums')
  await expect(page.locator('#vertical-tab-3')).toHaveText('Songs')
})

test('Title', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'Audio Library', exact: true })
  ).toBeVisible()
})

test('No Audios', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: '乁( ◔ ౪◔)「', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Nothing here', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Add new tracks', exact: true })
  ).toBeVisible()
  await expect(page.getByTestId('AddIcon')).toBeVisible()
  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await expect(page.getByTestId('SortIcon')).toBeDisabled()
})

test('Batch Tag No Audios', async ({ page }) => {
  await page.getByLabel('Batch Tag').click()
  await expect(
    page.getByRole('heading', { name: '乁( ◔ ౪◔)「', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Nothing here', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Add new tracks', exact: true })
  ).not.toBeVisible()

  await expect(
    page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon')
  ).toBeVisible()
  await expect(
    page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon')
  ).toBeDisabled()

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await expect(page.getByTestId('SortIcon')).toBeDisabled()

  await expect(page.getByTestId('SelectAllIcon')).toBeVisible()
  await page.getByTestId('SelectAllIcon').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Select All', exact: true })
  ).toBeVisible()

  await expect(page.getByTestId('ClearIcon')).toBeVisible()
  await page.getByTestId('ClearIcon').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Clear', exact: true })
  ).toBeVisible()

  await page.getByTestId('ArrowBackIcon').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Back', exact: true })
  ).toBeVisible()
  await page.getByTestId('ArrowBackIcon').click()
  await expect(
    page.getByRole('heading', { name: 'Add new tracks', exact: true })
  ).toBeVisible()

  await expect(
    page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon')
  ).not.toBeVisible()
  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await expect(page.getByTestId('SelectAllIcon')).not.toBeVisible()
  await expect(page.getByTestId('ClearIcon')).not.toBeVisible()
})

test('Add Single Local Audio', async ({ page }) => {
  await page.getByTestId('AddIcon').click()
  await expect(page.getByTestId('AudiotrackIcon').nth(1)).toBeVisible()
  await page.getByTestId('AudiotrackIcon').nth(1).hover()
  await expect(
    page.getByRole('tooltip', { name: 'Local Audio', exact: true })
  ).toBeVisible()
  await page.getByTestId('AudiotrackIcon').nth(1).click()
  await expect(page.getByRole('button', { name: /^audio/ })).toBeVisible()
  await page.getByRole('button', { name: /^audio/ }).dblclick()

  await page.keyboard.down('Shift')
  await page.getByRole('button', { name: /^MBB - Sea.mp3/ }).click()
  await page.keyboard.up('Shift')
  await expect(
    page.getByRole('button', { name: /^Aftertune, Ultimate Mix - Smile.mp3/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', {
      name: /^Hotham, Royalty Free Music - Run Free.mp3/
    })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^MBB - Sea.mp3/ })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', {
      name: /^Put It On The Floor - Otis McDonald.mp3/
    })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^Riyhsal - Bright.mp3/ })
  ).not.toHaveClass(/ Mui-selected /)

  await page.keyboard.down('Shift')
  await page
    .getByRole('button', { name: /^Aftertune, Ultimate Mix - Smile.mp3/ })
    .click()
  await page.keyboard.up('Shift')
  await expect(
    page.getByRole('button', { name: /^Aftertune, Ultimate Mix - Smile.mp3/ })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', {
      name: /^Hotham, Royalty Free Music - Run Free.mp3/
    })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^MBB - Sea.mp3/ })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', {
      name: /^Put It On The Floor - Otis McDonald.mp3/
    })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^Riyhsal - Bright.mp3/ })
  ).not.toHaveClass(/ Mui-selected /)

  await page.keyboard.down('Shift')
  await page.getByRole('button', { name: /^Riyhsal - Bright.mp3/ }).click()
  await page.keyboard.up('Shift')
  await expect(
    page.getByRole('button', { name: /^Aftertune, Ultimate Mix - Smile.mp3/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', {
      name: /^Hotham, Royalty Free Music - Run Free.mp3/
    })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^MBB - Sea.mp3/ })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', {
      name: /^Put It On The Floor - Otis McDonald.mp3/
    })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^Riyhsal - Bright.mp3/ })
  ).toHaveClass(/ Mui-selected /)

  await page.keyboard.down('ControlOrMeta')
  await page
    .getByRole('button', { name: /^Put It On The Floor - Otis McDonald.mp3/ })
    .click()
  await page.keyboard.up('ControlOrMeta')
  await expect(
    page.getByRole('button', { name: /^Aftertune, Ultimate Mix - Smile.mp3/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', {
      name: /^Hotham, Royalty Free Music - Run Free.mp3/
    })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^MBB - Sea.mp3/ })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', {
      name: /^Put It On The Floor - Otis McDonald.mp3/
    })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^Riyhsal - Bright.mp3/ })
  ).toHaveClass(/ Mui-selected /)

  await page.keyboard.down('Shift')
  await page
    .getByRole('button', { name: /^Aftertune, Ultimate Mix - Smile.mp3/ })
    .click()
  await page.keyboard.up('Shift')
  await expect(
    page.getByRole('button', { name: /^Aftertune, Ultimate Mix - Smile.mp3/ })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', {
      name: /^Hotham, Royalty Free Music - Run Free.mp3/
    })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^MBB - Sea.mp3/ })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', {
      name: /^Put It On The Floor - Otis McDonald.mp3/
    })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^Riyhsal - Bright.mp3/ })
  ).not.toHaveClass(/ Mui-selected /)

  await page.getByRole('button', { name: /^MBB - Sea.mp3/ }).click()
  await expect(
    page.getByRole('button', { name: /^Aftertune, Ultimate Mix - Smile.mp3/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', {
      name: /^Hotham, Royalty Free Music - Run Free.mp3/
    })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^MBB - Sea.mp3/ })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', {
      name: /^Put It On The Floor - Otis McDonald.mp3/
    })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^Riyhsal - Bright.mp3/ })
  ).not.toHaveClass(/ Mui-selected /)

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/audios' &&
      request.method() === 'POST' &&
      res.status() === 204
    )
  })
  await page.getByRole('button', { name: 'Choose', exact: true }).click()
  await responsePromise
  await expect(page.locator('#sortable-list li')).toHaveCount(1)
  await expect(page.locator('#sortable-list li')).toHaveText('Sea2:09MBBSea')
  await expect(
    page.getByRole('heading', { name: '乁( ◔ ౪◔)「', exact: true })
  ).not.toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Nothing here', exact: true })
  ).not.toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Add new tracks', exact: true })
  ).not.toBeVisible()
})

test.fixme('Click Local Audio Source Icon', async () => {
  // TODO click play -> navigates to player
})

test('Shift + Click Local Audio', async ({ page, context }) => {
  const pagePromise = context.waitForEvent('page')
  await page.keyboard.down('Shift')
  await page.getByAltText('Sea').click()
  await page.keyboard.up('Shift')
  const newPage = await pagePromise
  await expect(newPage).toHaveURL('http://localhost:5050/fs/file/audio/1')
  await newPage.close()
})

test('Delete Single Audio', async ({ page }) => {
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/audios/1' &&
      request.method() === 'DELETE' &&
      res.status() === 204
    )
  })
  await page.getByTestId('DeleteIcon').nth(0).click()
  await expect(
    page.getByRole('heading', { name: '乁( ◔ ౪◔)「', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Nothing here', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Add new tracks', exact: true })
  ).toBeVisible()
  await responsePromise
})

test('Add Multiple Local Audios', async ({ page }) => {
  await page.getByTestId('AddIcon').click()
  await expect(page.getByTestId('AudiotrackIcon').nth(1)).toBeVisible()
  await page.getByTestId('AudiotrackIcon').nth(1).click()
  await expect(page.getByRole('button', { name: /^audio/ })).toBeVisible()
  await page.getByRole('button', { name: /^audio/ }).dblclick()

  await page.keyboard.down('Shift')
  await page
    .getByRole('button', { name: /^Aftertune, Ultimate Mix - Smile.mp3/ })
    .click()
  await page.keyboard.up('Shift')
  await page.keyboard.down('Shift')
  await page.getByRole('button', { name: /^MBB - Sea.mp3/ }).click()
  await page.keyboard.up('Shift')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/audios' &&
      request.method() === 'POST' &&
      res.status() === 204
    )
  })
  await page.getByRole('button', { name: 'Choose', exact: true }).click()
  await responsePromise
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
})

test('Add Same Local Audio', async ({ page }) => {
  await page.getByTestId('AddIcon').click()
  await expect(page.getByTestId('AudiotrackIcon').nth(1)).toBeVisible()
  await page.getByTestId('AudiotrackIcon').nth(1).click()
  await expect(page.getByRole('button', { name: /^audio/ })).toBeVisible()
  await page.getByRole('button', { name: /^audio/ }).dblclick()
  await page.getByRole('button', { name: /^MBB - Sea.mp3/ }).click()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/audios' &&
      request.method() === 'POST' &&
      res.status() === 200
    )
  })
  await page.getByRole('button', { name: 'Choose', exact: true }).click()
  await responsePromise
  await expect(
    page.getByText('No new audios added', { exact: true })
  ).toBeVisible()
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
})

test('Add Remote Audio', async ({ page }) => {
  await page.getByTestId('AddIcon').click()
  await expect(page.getByTestId('HttpIcon')).toBeVisible()
  await page.getByTestId('HttpIcon').hover()
  await expect(
    page.getByRole('tooltip', { name: 'URL', exact: true })
  ).toBeVisible()
  await expect(page.getByText('Add Audio URL')).not.toBeVisible()
  await expect(
    page.getByText('Enter the URL of the audio file:')
  ).not.toBeVisible()

  // empty url not allowed
  await page.getByTestId('HttpIcon').click()
  await expect(page.getByText('Add Audio URL')).toBeVisible()
  await expect(page.getByText('Enter the URL of the audio file:')).toBeVisible()
  await expect(page.getByText('Import')).toBeDisabled()
  await page.getByLabel('Audio URL', { exact: true }).fill('test disabled')
  await expect(page.getByText('Import')).not.toBeDisabled()
  await page.getByLabel('Audio URL', { exact: true }).fill('')
  await expect(page.getByText('Import')).toBeDisabled()

  // invalid url
  await page
    .getByLabel('Audio URL', { exact: true })
    .fill(
      'https://feeds.soundcloud.com/stream/336839158-royaltyfreemusic-nocopyrightmusic-sugar-vibe-tracks.jpg'
    )
  await expect(page.getByLabel('Audio URL', { exact: true })).toHaveValue(
    'https://feeds.soundcloud.com/stream/336839158-royaltyfreemusic-nocopyrightmusic-sugar-vibe-tracks.jpg'
  )
  await page.getByText('Import').click()
  await expect(
    page.getByText(
      'Invalid audio URL: https://feeds.soundcloud.com/stream/336839158-royaltyfreemusic-nocopyrightmusic-sugar-vibe-tracks.jpg',
      { exact: true }
    )
  ).toBeVisible()
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )

  // add remote url
  await page.getByTestId('AddIcon').click()
  await page.getByTestId('HttpIcon').click()
  await expect(page.getByText('Add Audio URL')).toBeVisible()
  await expect(page.getByText('Enter the URL of the audio file:')).toBeVisible()
  await page
    .getByLabel('Audio URL', { exact: true })
    .fill(
      'https://feeds.soundcloud.com/stream/336839158-royaltyfreemusic-nocopyrightmusic-sugar-vibe-tracks.mp3'
    )
  await expect(page.getByLabel('Audio URL', { exact: true })).toHaveValue(
    'https://feeds.soundcloud.com/stream/336839158-royaltyfreemusic-nocopyrightmusic-sugar-vibe-tracks.mp3'
  )
  await page.getByText('Import').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(4)
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'Sea2:09MBBSea'
  )

  // duplicate url
  await page.getByTestId('AddIcon').click()
  await page.getByTestId('HttpIcon').click()
  await expect(page.getByText('Add Audio URL')).toBeVisible()
  await expect(page.getByText('Enter the URL of the audio file:')).toBeVisible()
  await page
    .getByLabel('Audio URL', { exact: true })
    .fill(
      'https://feeds.soundcloud.com/stream/336839158-royaltyfreemusic-nocopyrightmusic-sugar-vibe-tracks.mp3'
    )
  await expect(page.getByLabel('Audio URL', { exact: true })).toHaveValue(
    'https://feeds.soundcloud.com/stream/336839158-royaltyfreemusic-nocopyrightmusic-sugar-vibe-tracks.mp3'
  )
  await page.getByText('Import').click()
  await expect(
    page.getByText('No new audios added', { exact: true })
  ).toBeVisible()
  await expect(page.locator('#sortable-list li')).toHaveCount(4)
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'Sea2:09MBBSea'
  )

  await page.getByTestId('AddIcon').click()
  await page.getByTestId('HttpIcon').click()
  await expect(page.getByText('Add Audio URL')).toBeVisible()
  await expect(page.getByText('Enter the URL of the audio file:')).toBeVisible()
  await page
    .getByLabel('Audio URL', { exact: true })
    .fill(
      'https://feeds.soundcloud.com/stream/337111059-royaltyfreemusic-nocopyrightmusic-vibe-tracks-take-you-home-tonight.mp3'
    )
  await expect(page.getByLabel('Audio URL', { exact: true })).toHaveValue(
    'https://feeds.soundcloud.com/stream/337111059-royaltyfreemusic-nocopyrightmusic-vibe-tracks-take-you-home-tonight.mp3'
  )
  await page.getByText('Import').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(5)
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    'Sea2:09MBBSea'
  )

  await page.getByTestId('AddIcon').click()
  await page.getByTestId('HttpIcon').click()
  await expect(page.getByText('Add Audio URL')).toBeVisible()
  await expect(page.getByText('Enter the URL of the audio file:')).toBeVisible()
  await page
    .getByLabel('Audio URL', { exact: true })
    .fill(
      'https://feeds.soundcloud.com/stream/338313073-royaltyfreemusic-nocopyrightmusic-foundation-vibe-tracks-free-download.mp3'
    )
  await expect(page.getByLabel('Audio URL', { exact: true })).toHaveValue(
    'https://feeds.soundcloud.com/stream/338313073-royaltyfreemusic-nocopyrightmusic-foundation-vibe-tracks-free-download.mp3'
  )
  await page.getByText('Import').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    'Sea2:09MBBSea'
  )
})

test.fixme('Click Remote Audio Source Icon', async () => {
  // TODO play remote audio
})

test('Shift + Click Remote Audio', async ({ page, context }) => {
  const pagePromise = context.waitForEvent('page')
  await page.keyboard.down('Shift')
  await page
    .locator('#sortable-list li')
    .nth(0)
    .getByTestId('AudiotrackIcon')
    .click()
  await page.keyboard.up('Shift')
  const newPage = await pagePromise
  await expect(newPage).toHaveURL('http://localhost:5050/fs/file/audio/9')
  await newPage.close()
})

test('Sort By URL', async ({ page }) => {
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    'Sea2:09MBBSea'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('#sort-menu li').nth(0)).toHaveText('By URL')
  await expect(
    page.locator('#sort-menu li').nth(0).getByTestId('ArrowUpwardIcon')
  ).toBeVisible()
  await expect(
    page.locator('#sort-menu li').nth(0).getByTestId('ArrowDownwardIcon')
  ).toBeVisible()

  await page
    .locator('#sort-menu li')
    .nth(0)
    .getByTestId('ArrowDownwardIcon')
    .click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sort-menu li').nth(0)).not.toBeVisible()
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await page
    .locator('#sort-menu li')
    .nth(0)
    .getByTestId('ArrowUpwardIcon')
    .click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sort-menu li').nth(0)).not.toBeVisible()
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
})

test('Sort By Name', async ({ page }) => {
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('#sort-menu li').nth(1)).toHaveText('By Name')
  await expect(
    page.locator('#sort-menu li').nth(1).getByTestId('ArrowUpwardIcon')
  ).toBeVisible()
  await expect(
    page.locator('#sort-menu li').nth(1).getByTestId('ArrowDownwardIcon')
  ).toBeVisible()

  await page
    .locator('#sort-menu li')
    .nth(1)
    .getByTestId('ArrowDownwardIcon')
    .click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sort-menu li').nth(1)).not.toBeVisible()
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await page
    .locator('#sort-menu li')
    .nth(1)
    .getByTestId('ArrowUpwardIcon')
    .click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sort-menu li').nth(1)).not.toBeVisible()
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
})

test('Sort By Artist', async ({ page }) => {
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('#sort-menu li').nth(2)).toHaveText('By Artist')
  await expect(
    page.locator('#sort-menu li').nth(2).getByTestId('ArrowUpwardIcon')
  ).toBeVisible()
  await expect(
    page.locator('#sort-menu li').nth(2).getByTestId('ArrowDownwardIcon')
  ).toBeVisible()

  await page
    .locator('#sort-menu li')
    .nth(2)
    .getByTestId('ArrowDownwardIcon')
    .click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sort-menu li').nth(2)).not.toBeVisible()
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await page
    .locator('#sort-menu li')
    .nth(2)
    .getByTestId('ArrowUpwardIcon')
    .click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sort-menu li').nth(2)).not.toBeVisible()
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
})

test('Sort By Album', async ({ page }) => {
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('#sort-menu li').nth(3)).toHaveText('By Album')
  await expect(
    page.locator('#sort-menu li').nth(3).getByTestId('ArrowUpwardIcon')
  ).toBeVisible()
  await expect(
    page.locator('#sort-menu li').nth(3).getByTestId('ArrowDownwardIcon')
  ).toBeVisible()

  await page
    .locator('#sort-menu li')
    .nth(3)
    .getByTestId('ArrowDownwardIcon')
    .click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sort-menu li').nth(3)).not.toBeVisible()
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await page
    .locator('#sort-menu li')
    .nth(3)
    .getByTestId('ArrowUpwardIcon')
    .click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sort-menu li').nth(3)).not.toBeVisible()
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
})

test('Sort By Date', async ({ page }) => {
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('#sort-menu li').nth(4)).toHaveText('By Date')
  await expect(
    page.locator('#sort-menu li').nth(4).getByTestId('ArrowUpwardIcon')
  ).toBeVisible()
  await expect(
    page.locator('#sort-menu li').nth(4).getByTestId('ArrowDownwardIcon')
  ).toBeVisible()

  await page
    .locator('#sort-menu li')
    .nth(4)
    .getByTestId('ArrowDownwardIcon')
    .click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sort-menu li').nth(4)).not.toBeVisible()
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    'Sea2:09MBBSea'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await page
    .locator('#sort-menu li')
    .nth(4)
    .getByTestId('ArrowUpwardIcon')
    .click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sort-menu li').nth(4)).not.toBeVisible()
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
})

test('Sort By Duration', async ({ page }) => {
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('#sort-menu li').nth(5)).toHaveText('By Duration')
  await expect(
    page.locator('#sort-menu li').nth(5).getByTestId('ArrowUpwardIcon')
  ).toBeVisible()
  await expect(
    page.locator('#sort-menu li').nth(5).getByTestId('ArrowDownwardIcon')
  ).toBeVisible()

  await page
    .locator('#sort-menu li')
    .nth(5)
    .getByTestId('ArrowDownwardIcon')
    .click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sort-menu li').nth(5)).not.toBeVisible()
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await page
    .locator('#sort-menu li')
    .nth(5)
    .getByTestId('ArrowUpwardIcon')
    .click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sort-menu li').nth(5)).not.toBeVisible()
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
})

test('Sort By Play Count', async ({ page }) => {
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('#sort-menu li').nth(6)).toHaveText('By Play Count')
  await expect(
    page.locator('#sort-menu li').nth(6).getByTestId('ArrowUpwardIcon')
  ).toBeVisible()
  await expect(
    page.locator('#sort-menu li').nth(6).getByTestId('ArrowDownwardIcon')
  ).toBeVisible()

  await page
    .locator('#sort-menu li')
    .nth(6)
    .getByTestId('ArrowDownwardIcon')
    .click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sort-menu li').nth(6)).not.toBeVisible()
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await page
    .locator('#sort-menu li')
    .nth(6)
    .getByTestId('ArrowUpwardIcon')
    .click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sort-menu li').nth(6)).not.toBeVisible()
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
})

test('Move Audio Down', async ({ page }) => {
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/audios/move' &&
      request.method() === 'POST' &&
      res.status() === 204
    )
  })

  const start = await page.locator('#sortable-list li').nth(0).boundingBox()
  if (start == null) {
    throw new Error('Failed to get list item bounding box')
  }
  const end = await page.locator('#sortable-list li').nth(5).boundingBox()
  if (end == null) {
    throw new Error('Failed to get list item bounding box')
  }
  await dragListItem(page, start, end)
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await responsePromise
})

test('Move Audio Up', async ({ page }) => {
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/audios/move' &&
      request.method() === 'POST' &&
      res.status() === 204
    )
  })

  const start = await page.locator('#sortable-list li').nth(4).boundingBox()
  if (start == null) {
    throw new Error('Failed to get list item bounding box')
  }
  const end = await page.locator('#sortable-list li').nth(0).boundingBox()
  if (end == null) {
    throw new Error('Failed to get list item bounding box')
  }
  await dragListItem(page, start, end)
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )
  await responsePromise
})

test('Batch Tag Select With Shift', async ({ page }) => {
  await page.getByLabel('Batch Tag').click()
  await expect(page.getByRole('checkbox')).toHaveCount(6)
  await page.getByRole('checkbox').nth(1).click()
  await expect(page.getByRole('checkbox').nth(1)).toBeChecked()
  await page.keyboard.down('Shift')
  await page.getByRole('checkbox').nth(3).click()
  await page.keyboard.up('Shift')
  await expect(page.getByRole('checkbox').nth(0)).not.toBeChecked()
  await expect(page.getByRole('checkbox').nth(1)).toBeChecked()
  await expect(page.getByRole('checkbox').nth(2)).toBeChecked()
  await expect(page.getByRole('checkbox').nth(3)).toBeChecked()
  await expect(page.getByRole('checkbox').nth(4)).not.toBeChecked()
  await expect(page.getByRole('checkbox').nth(5)).not.toBeChecked()
})

test('Batch Tag Select All', async ({ page }) => {
  await page.getByLabel('Batch Tag').click()
  await expect(page.getByRole('checkbox')).toHaveCount(6)
  for (let i = 0; i < 6; i++) {
    await expect(page.getByRole('checkbox').nth(i)).not.toBeChecked()
  }

  await expect(page.getByTestId('SelectAllIcon')).toBeVisible()
  await page.getByTestId('SelectAllIcon').click()
  for (let i = 0; i < 6; i++) {
    await expect(page.getByRole('checkbox').nth(i)).toBeChecked()
  }
})

test('Batch Tag Select None', async ({ page }) => {
  await page.getByLabel('Batch Tag').click()
  await page.getByTestId('SelectAllIcon').click()
  await expect(page.getByRole('checkbox')).toHaveCount(6)
  for (let i = 0; i < 6; i++) {
    await expect(page.getByRole('checkbox').nth(i)).toBeChecked()
  }

  await expect(page.getByTestId('ClearIcon')).toBeVisible()
  await page.getByTestId('ClearIcon').click()
  for (let i = 0; i < 6; i++) {
    await expect(page.getByRole('checkbox').nth(i)).not.toBeChecked()
  }
})

test('Batch Tag Select All With Filter', async ({ page }) => {
  await page.getByLabel('Batch Tag').click()
  await page.getByRole('combobox').fill('Vibe')
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Foundation3:41Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
  ).toBeVisible()

  await page.getByRole('checkbox').nth(0).click()
  await page.getByRole('checkbox').nth(1).click()
  await page.getByRole('checkbox').nth(2).click()
  await expect(page.getByRole('checkbox').nth(0)).toBeChecked()
  await expect(page.getByRole('checkbox').nth(1)).toBeChecked()
  await expect(page.getByRole('checkbox').nth(2)).toBeChecked()

  await page.getByRole('combobox').click()
  await page.locator('.MuiAutocomplete-root').getByLabel('Clear').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
      })
      .getByRole('checkbox')
  ).not.toBeChecked()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
      })
      .getByRole('checkbox')
  ).not.toBeChecked()
  await expect(
    page
      .locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
      .getByRole('checkbox')
  ).not.toBeChecked()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .getByRole('checkbox')
  ).toBeChecked()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .getByRole('checkbox')
  ).toBeChecked()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .getByRole('checkbox')
  ).toBeChecked()

  await page.getByTestId('ClearIcon').click()
  for (let i = 0; i < 6; i++) {
    await expect(page.getByRole('checkbox').nth(i)).not.toBeChecked()
  }

  await page.getByRole('combobox').fill('Vibe')
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Foundation3:41Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
  ).toBeVisible()

  await page.getByTestId('SelectAllIcon').click()
  for (let i = 0; i < 3; i++) {
    await expect(page.getByRole('checkbox').nth(i)).toBeChecked()
  }

  await page.getByRole('combobox').click()
  await page.locator('.MuiAutocomplete-root').getByLabel('Clear').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
      })
      .getByRole('checkbox')
  ).not.toBeChecked()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
      })
      .getByRole('checkbox')
  ).not.toBeChecked()
  await expect(
    page
      .locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
      .getByRole('checkbox')
  ).not.toBeChecked()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .getByRole('checkbox')
  ).toBeChecked()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .getByRole('checkbox')
  ).toBeChecked()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .getByRole('checkbox')
  ).toBeChecked()
})

test('Batch Tag Single Audio', async ({ page }) => {
  test.slow()
  await page.getByLabel('Manage Tags').click()
  await expect(page).toHaveURL('/tags')
  await page.getByTestId('AddIcon').click()
  await page.getByLabel('Name *', { exact: true }).fill('pets')
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await page.getByTestId('AddIcon').click()
  await page.getByLabel('Name *', { exact: true }).fill('animals')
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await page.getByTestId('AddIcon').click()
  await page.getByLabel('Name *', { exact: true }).fill('car')
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await page.getByLabel('Back').click()
  await expect(page).toHaveURL('/audio-library')

  await page.getByLabel('Batch Tag').click()
  await expect(
    page.getByLabel('Batch Tag').getByTestId('LocalOfferIcon')
  ).toBeVisible()
  await expect(
    page.getByLabel('Batch Tag').getByTestId('LocalOfferIcon')
  ).toBeDisabled()
  await page.getByRole('checkbox').nth(0).click()
  await expect(
    page.getByLabel('Batch Tag').getByTestId('LocalOfferIcon')
  ).toBeVisible()
  await expect(
    page.getByLabel('Batch Tag').getByTestId('LocalOfferIcon')
  ).not.toBeDisabled()
  await expect(
    page.getByLabel('Batch Tag').locator('.MuiBadge-badge')
  ).toHaveText('1')

  // Add tags
  await page.getByLabel('Batch Tag').getByTestId('LocalOfferIcon').click()
  await expect(page.getByRole('heading')).toHaveText('Batch Tag')
  await expect(
    page.getByText(
      'Choose tags to add, remove, or overwrite on the selected source(s)'
    )
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: '- Remove', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: '+ Add', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Overwrite', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: '- Remove', exact: true })
  ).toBeDisabled()
  await expect(
    page.getByRole('button', { name: '+ Add', exact: true })
  ).toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Overwrite', exact: true })
  ).not.toBeDisabled()
  await expect(page.getByRole('combobox')).toHaveAttribute(
    'placeholder',
    'Tag These Sources'
  )

  await page.getByRole('combobox').click()
  await expect(
    page.getByRole('presentation').getByRole('listbox').getByRole('option')
  ).toHaveCount(3)
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('animals (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('car (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('pets (0)')

  await page.getByRole('combobox').fill('s')
  await expect(
    page.getByRole('presentation').getByRole('listbox').getByRole('option')
  ).toHaveCount(2)
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('animals (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('pets (0)')

  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(1)
    .click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('pets')
  await expect(
    page.getByRole('presentation').getByRole('listbox').getByRole('option')
  ).toHaveCount(3)
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('pets (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveAttribute('aria-selected', 'true')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveAttribute('aria-selected', 'false')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveAttribute('aria-selected', 'false')
  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(1)
    .click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('pets')
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('animals')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('pets (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('animals (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveAttribute('aria-selected', 'true')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveAttribute('aria-selected', 'true')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveAttribute('aria-selected', 'false')
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: '+ Add', exact: true }).click()
  await page.getByLabel('Back').click()
  await expect(page.getByRole('checkbox')).not.toBeVisible()
  await page
    .locator('#sortable-list li')
    .nth(0)
    .getByTestId('AudiotrackIcon')
    .hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('pets')

  // Add duplicate tag
  await page.getByLabel('Batch Tag').click()
  await page.getByRole('checkbox').nth(0).click()
  await page.getByLabel('Batch Tag').getByTestId('LocalOfferIcon').click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('pets')
  await page.getByRole('combobox').click()
  await expect(
    page.getByRole('presentation').getByRole('listbox').getByRole('option')
  ).toHaveCount(3)
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('animals (1)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('pets (1)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('car (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveAttribute('aria-selected', 'true')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveAttribute('aria-selected', 'true')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveAttribute('aria-selected', 'false')

  await page
    .getByRole('presentation')
    .locator('.MuiChip-root')
    .nth(0)
    .getByTestId('CancelIcon')
    .click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('pets')
  await page.getByRole('combobox').click()
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('pets (1)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('animals (1)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('car (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveAttribute('aria-selected', 'true')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveAttribute('aria-selected', 'false')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveAttribute('aria-selected', 'false')
  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(2)
    .click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('pets')
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('pets (1)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('car (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('animals (1)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveAttribute('aria-selected', 'true')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveAttribute('aria-selected', 'true')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveAttribute('aria-selected', 'false')

  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: '+ Add', exact: true }).click()
  await page.getByLabel('Back').click()
  await expect(page.getByRole('checkbox')).not.toBeVisible()
  await page
    .locator('#sortable-list li')
    .nth(0)
    .getByTestId('AudiotrackIcon')
    .hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(3)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('car')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(2)
  ).toHaveText('pets')

  // Remove tags
  await page.getByLabel('Batch Tag').click()
  await page.getByRole('checkbox').nth(0).click()
  await page.getByLabel('Batch Tag').getByTestId('LocalOfferIcon').click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(3)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(2)
  ).toHaveText('pets')
  await page
    .getByRole('presentation')
    .locator('.MuiChip-root')
    .nth(1)
    .getByTestId('CancelIcon')
    .click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('pets')
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: '- Remove', exact: true }).click()
  await page.getByLabel('Back').click()
  await expect(page.getByRole('checkbox')).not.toBeVisible()
  await page
    .locator('#sortable-list li')
    .nth(0)
    .getByTestId('AudiotrackIcon')
    .hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('car')

  // Overwrite same tag
  await page.getByLabel('Batch Tag').click()
  await page.getByRole('checkbox').nth(0).click()
  await page.getByLabel('Batch Tag').getByTestId('LocalOfferIcon').click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')
  await page.getByRole('combobox').click()
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('car (1)')
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: 'Overwrite', exact: true }).click()
  await page.getByLabel('Back').click()
  await expect(page.getByRole('checkbox')).not.toBeVisible()
  await page
    .locator('#sortable-list li')
    .nth(0)
    .getByTestId('AudiotrackIcon')
    .hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('car')

  // Overwrite different tags
  await page.getByLabel('Batch Tag').click()
  await page.getByRole('checkbox').nth(0).click()
  await page.getByLabel('Batch Tag').getByTestId('LocalOfferIcon').click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')
  await page
    .getByRole('presentation')
    .locator('.MuiChip-root')
    .nth(0)
    .getByTestId('CancelIcon')
    .click()
  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(2)
    .click()
  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(2)
    .click()
  await page.getByRole('combobox').click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('pets')
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('animals')
  await page.getByRole('button', { name: 'Overwrite', exact: true }).click()
  await page.getByLabel('Back').click()
  await expect(page.getByRole('checkbox')).not.toBeVisible()
  await page
    .locator('#sortable-list li')
    .nth(0)
    .getByTestId('AudiotrackIcon')
    .hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('pets')

  // Overwrite tag overlap
  await page.getByLabel('Batch Tag').click()
  await page.getByRole('checkbox').nth(0).click()
  await page.getByLabel('Batch Tag').getByTestId('LocalOfferIcon').click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('pets')
  await page
    .getByRole('presentation')
    .locator('.MuiChip-root')
    .nth(1)
    .getByTestId('CancelIcon')
    .click()
  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(2)
    .click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: 'Overwrite', exact: true }).click()
  await page.getByLabel('Back').click()
  await expect(page.getByRole('checkbox')).not.toBeVisible()
  await page
    .locator('#sortable-list li')
    .nth(0)
    .getByTestId('AudiotrackIcon')
    .hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('car')

  // Overwrite no tags selected
  await page.getByLabel('Batch Tag').click()
  await page.getByRole('checkbox').nth(0).click()
  await page.getByLabel('Batch Tag').getByTestId('LocalOfferIcon').click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await page.getByRole('presentation').locator('.MuiAutocomplete-root').hover()
  await page.getByRole('presentation').getByTestId('CloseIcon').click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: 'Overwrite', exact: true }).click()
  await page.getByLabel('Back').click()
  await expect(page.getByRole('checkbox')).not.toBeVisible()
  await page
    .locator('#sortable-list li')
    .nth(0)
    .getByTestId('AudiotrackIcon')
    .hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
})

test('Add Same Remote Audio', async ({ page }) => {
  await page.getByLabel('Batch Tag').click()
  await page
    .locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
    .getByRole('checkbox')
    .click()
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
  await page.getByRole('combobox').click()
  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(0)
    .click()
  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(1)
    .click()
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: '+ Add', exact: true }).click()

  await page.getByLabel('Back').click()
  await expect(page.getByRole('checkbox')).not.toBeVisible()
  await page
    .locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
    .nth(0)
    .getByTestId('AudiotrackIcon')
    .hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('car')

  await page.getByTestId('AddIcon').click()
  await page.getByTestId('HttpIcon').click()
  await expect(page.getByText('Add Audio URL')).toBeVisible()
  await expect(page.getByText('Enter the URL of the audio file:')).toBeVisible()
  await page
    .getByLabel('Audio URL', { exact: true })
    .fill(
      'https://feeds.soundcloud.com/stream/337111059-royaltyfreemusic-nocopyrightmusic-vibe-tracks-take-you-home-tonight.mp3'
    )
  await expect(page.getByLabel('Audio URL', { exact: true })).toHaveValue(
    'https://feeds.soundcloud.com/stream/337111059-royaltyfreemusic-nocopyrightmusic-vibe-tracks-take-you-home-tonight.mp3'
  )
  await page.getByText('Import').click()

  await expect(
    page.getByText('No new audios added', { exact: true })
  ).toBeVisible()
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )

  await page
    .locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
    .nth(0)
    .getByTestId('AudiotrackIcon')
    .hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('car')

  await page.getByLabel('Batch Tag').click()
  await page
    .locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
    .getByRole('checkbox')
    .click()
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
  await page.getByRole('button', { name: '- Remove', exact: true }).click()
})

test('Randomize Order', async ({ page }) => {
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    '32Take You Home Tonight3:33Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    'Run Free1:45Hotham, Royalty Free MusicRun Free'
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'Sea2:09MBBSea'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    '32Foundation3:41Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    '32Sugar3:50Vibe Tracks'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    'Smile2:04Aftertune, Ultimate MixSmile'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('#sort-menu li').nth(7)).toHaveText(
    'Randomize Order'
  )
  await expect(
    page.locator('#sort-menu li').nth(7).getByTestId('ShuffleIcon')
  ).toBeVisible()
  await page.locator('#sort-menu li').nth(7).getByTestId('ShuffleIcon').click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()

  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Foundation3:41Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
    })
  ).toBeVisible()
})

test('Batch Tag Multiple Audios', async ({ page }) => {
  test.slow()
  // Add tags
  await page.getByLabel('Batch Tag').click()
  await page.getByRole('checkbox').nth(0).click()
  await page.getByRole('checkbox').nth(1).click()
  await page.getByRole('checkbox').nth(2).click()
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await page.getByRole('combobox').click()
  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(1)
    .click()
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('car (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('animals (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('pets (0)')
  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(1)
    .click()
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('animals')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('car (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('animals (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('pets (0)')
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: '+ Add', exact: true }).click()

  await page.getByLabel('Back').click()
  await expect(page.getByRole('checkbox')).not.toBeVisible()
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(0).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('car')
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(1).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('car')
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(2).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('car')

  await page.getByLabel('Batch Tag').click()
  await page.getByRole('checkbox').nth(2).click()
  await page.getByRole('checkbox').nth(3).click()
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await page.getByRole('combobox').click()
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('animals (3)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('car (3)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('pets (0)')
  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(2)
    .click()
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('pets')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('pets (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('animals (3)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('car (3)')
  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(2)
    .click()
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('pets')
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('pets (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('car (3)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('animals (3)')
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: '+ Add', exact: true }).click()

  await page.getByLabel('Back').click()
  await expect(page.getByRole('checkbox')).not.toBeVisible()
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(0).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('car')
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(1).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('car')
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(2).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(3)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('car')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(2)
  ).toHaveText('pets')
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(3).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('car')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('pets')

  // Overwrite tags
  await page.getByLabel('Batch Tag').click()
  await page.getByRole('checkbox').nth(1).click()
  await page.getByRole('checkbox').nth(2).click()
  await page.getByRole('checkbox').nth(3).click()
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')
  await page.getByRole('combobox').click()
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('car (4)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('animals (3)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('pets (2)')
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: 'Overwrite', exact: true }).click()

  await page.getByLabel('Back').click()
  await expect(page.getByRole('checkbox')).not.toBeVisible()
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(0).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('car')
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(1).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('car')
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(2).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('car')
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(3).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('car')

  // Add with overlapping tags
  await page.getByLabel('Batch Tag').click()
  await page.getByRole('checkbox').nth(0).click()
  await page.getByRole('checkbox').nth(2).click()
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')
  await page
    .getByRole('presentation')
    .locator('.MuiChip-root')
    .nth(0)
    .getByTestId('CancelIcon')
    .click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('car (4)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('animals (1)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('pets (0)')
  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(2)
    .click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('pets')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('pets (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('car (4)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('animals (1)')
  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(2)
    .click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('pets')
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('animals')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('pets (0)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('animals (1)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('car (4)')
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: '+ Add', exact: true }).click()

  await page.getByLabel('Back').click()
  await expect(page.getByRole('checkbox')).not.toBeVisible()
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(0).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(3)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('car')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(2)
  ).toHaveText('pets')
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(1).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('car')
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(2).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(3)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('car')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(2)
  ).toHaveText('pets')
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(3).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('car')

  // Remove tag
  await page.getByLabel('Batch Tag').click()
  await page.getByRole('checkbox').nth(0).click()
  await page.getByRole('checkbox').nth(1).click()
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
  await page.getByRole('combobox').click()
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('car (4)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('animals (2)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('pets (2)')
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')
  await page
    .getByRole('presentation')
    .locator('.MuiChip-root')
    .nth(0)
    .getByTestId('CancelIcon')
    .click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await page.getByRole('combobox').click()
  await page
    .getByRole('presentation')
    .getByRole('listbox')
    .getByRole('option')
    .nth(1)
    .click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .getByRole('presentation')
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(0)
  ).toHaveText('animals (2)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(1)
  ).toHaveText('car (4)')
  await expect(
    page
      .getByRole('presentation')
      .getByRole('listbox')
      .getByRole('option')
      .nth(2)
  ).toHaveText('pets (2)')
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: '- Remove', exact: true }).click()

  await page.getByLabel('Back').click()
  await expect(page.getByRole('checkbox')).not.toBeVisible()
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(0).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('car')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('pets')
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(1).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('car')
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(2).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(3)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('animals')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(1)
  ).toHaveText('car')
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(2)
  ).toHaveText('pets')
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(3).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label').nth(0)
  ).toHaveText('car')

  // Remove all tags using overwrite action
  await page.getByLabel('Batch Tag').click()
  await page.getByTestId('SelectAllIcon').click()
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Overwrite', exact: true }).click()

  await page.getByLabel('Back').click()
  await expect(page.getByRole('checkbox')).not.toBeVisible()
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(0).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(1).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(2).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(3).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(4).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await page.locator('#sortable-list li .MuiListItemAvatar-root').nth(5).hover()
  await expect(
    page.getByRole('tooltip').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
})

test('Batch Tag Escape Key Navigates Back', async ({ page }) => {
  await expect(page.getByRole('checkbox')).toHaveCount(0)
  await page.getByLabel('Batch Tag').click()
  await expect(page.getByRole('checkbox')).toHaveCount(6)
  await page.getByTestId('SelectAllIcon').click()
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
  await expect(page.getByRole('heading')).toHaveText('Batch Tag')

  // close batch tag dialog
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('heading', { name: 'Batch Tag', exact: true })
  ).not.toBeVisible()
  await expect(page.getByRole('checkbox')).toHaveCount(6)

  // go back to audio library
  await page.keyboard.press('Escape')
  await expect(page.getByRole('checkbox')).toHaveCount(0)
  await expect(page).toHaveURL('/audio-library')

  // extra Esc press does nothing
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/audio-library')
})

test('Mark Audios', async ({ page }) => {
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()

  await page.keyboard.press('Alt+m')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')

  await page.keyboard.press('Alt+m')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()

  await page.getByPlaceholder('Search').fill('Vibe')
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()

  await page.keyboard.press('Alt+m')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')

  await page.getByLabel('Clear').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()

  await page.keyboard.press('Alt+m')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: '32Take You Home Tonight3:33Vibe Tracks'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Foundation3:41Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiListItemAvatar-root button')
  ).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(
    page
      .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
  await expect(
    page
      .locator('#sortable-list li', {
        hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
      })
      .locator('.MuiBadge-anchorOriginTopLeft')
  ).not.toBeVisible()
})

test.fixme('Search Audios', async ({ page }) => {
  test.slow()
  /*
  audio filtering differences compared to caption script filtering:
  - artist, positive + negative filter
  - album, positive + negative filter
  - playlist, no negative filter
  - comment, positive + negative filter
  - playedCount, > = <
  - free text search on not just url, but also name, artist, album
  */

  await page.goto('/')
  await page.getByLabel('Audio Library').click()
  await expect(page).toHaveURL('/audio-library')

  // negative url filter (starts with -)
  await page.getByRole('combobox').fill('-soundcloud.com')
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
    })
  ).toBeVisible()

  // url filter (no prefix)
  await page.getByLabel('Clear').click()
  await page.getByRole('combobox').fill('vibe')
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Foundation3:41Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
  ).toBeVisible()

  // negative url filter (starts with -')
  await page.getByLabel('Clear').click()
  await page.getByRole('combobox').fill("-'AM'")
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(2)
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
  ).toBeVisible()

  // url filter (starts with ')
  await page.getByLabel('Clear').click()
  await page.getByRole('combobox').fill("'OU'")
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Foundation3:41Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
  ).toBeVisible()

  // negative url filter (starts with -")
  await page.getByLabel('Clear').click()
  await page.getByRole('combobox').fill('-"Vibe Tracks"')
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
  ).toBeVisible()

  // url filter (starts with ")
  await page.getByLabel('Clear').click()
  await page.getByRole('combobox').fill('"soundcloud"')
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Foundation3:41Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
  ).toBeVisible()

  // regex expression
  await page.getByLabel('Clear').click()
  await page.getByRole('combobox').fill('"Smile (Ultimate Mix)"')
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(0)
  await page.getByLabel('Clear').click()
  await page
    .locator('#sortable-list li', {
      hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
    })
    .getByTestId('EditIcon')
    .click()
  await page.getByLabel('Name').fill('Smile (Ultimate Mix)')
  await page.getByLabel('Artist').fill('Aftertune')
  await page.getByText('Save').click()
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Smile (Ultimate Mix)2:04AftertuneSmile'
    })
  ).toBeVisible()
  await page.getByRole('combobox').fill('"Smile (Ultimate Mix)"')
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(1)
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Smile (Ultimate Mix)2:04AftertuneSmile'
    })
  ).toBeVisible()
  await page
    .locator('#sortable-list li', {
      hasText: 'Smile (Ultimate Mix)2:04AftertuneSmile'
    })
    .getByTestId('EditIcon')
    .click()
  await page.getByLabel('Name').fill('Smile')
  await page.getByLabel('Artist').fill('Aftertune, Ultimate Mix')
  await page.getByText('Save').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(0)
  await page.getByLabel('Clear').click()

  // marked filter
  await page.keyboard.press('Alt+m')
  await expect(
    page.locator('#sortable-list li .MuiListItemAvatar-root button').nth(0)
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page.locator('#sortable-list li .MuiListItemAvatar-root button').nth(1)
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page.locator('#sortable-list li .MuiListItemAvatar-root button').nth(2)
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')

  await page.getByLabel('Clear').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await page.getByRole('combobox').fill('marked')
  await page.getByRole('option', { name: '<Marked> (3)' }).click()
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(
    page.locator('#sortable-list li .MuiListItemAvatar-root button').nth(0)
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page.locator('#sortable-list li .MuiListItemAvatar-root button').nth(1)
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(
    page.locator('#sortable-list li .MuiListItemAvatar-root button').nth(2)
  ).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await page.keyboard.press('Alt+m')
  await page.getByLabel('Clear').click()

  // setup: add tags
  await page.getByLabel('Batch Tag').click()
  await page
    .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
    .getByRole('checkbox')
    .click()
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
  await page.getByPlaceholder('Tag These Sources').click()
  await page.getByRole('option', { name: 'car (0)' }).click()
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: '+ Add' }).click()
  await page
    .locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
    .getByRole('checkbox')
    .click()
  await page
    .locator('#sortable-list li', {
      hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
    })
    .getByRole('checkbox')
    .click()
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
  await page.getByPlaceholder('Tag These Sources').click()
  await page.getByRole('option', { name: 'pets (0)' }).click()
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: '+ Add' }).click()
  await page.getByLabel('Back').click()

  // untagged filter
  await page.getByRole('combobox').fill('untag')
  await page.getByRole('option', { name: '<Untagged> (4)' }).click()
  await expect(page.locator('#sortable-list li')).toHaveCount(4)
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Foundation3:41Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
  ).toBeVisible()

  // type tag filter (starts with [)
  await page.getByLabel('Clear').click()
  await page.getByRole('combobox').fill('[car]')
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(1)
  await expect(
    page.locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
  ).toBeVisible()

  // type negative tag filter (starts with -[)
  await page.getByLabel('Clear').click()
  await page.getByRole('combobox').fill('-[pets]')
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(5)
  await expect(
    page.locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Foundation3:41Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
  ).toBeVisible()

  // choose tag filter option
  await page.getByLabel('Clear').click()
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: 'pets (1)' }).click()
  await expect(page.locator('#sortable-list li')).toHaveCount(1)
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
    })
  ).toBeVisible()

  // choose negative tag filter option
  await page.getByLabel('Clear').click()
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: '-car (5)' }).click()
  await expect(page.locator('#sortable-list li')).toHaveCount(5)
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Foundation3:41Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
  ).toBeVisible()

  // combine multiple filters
  await page.getByRole('combobox').fill('tracks')
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(2)
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Foundation3:41Vibe Tracks'
    })
  ).toBeVisible()

  // remove a filter by clicking X of chip
  await page
    .getByRole('button', { name: '-[car]' })
    .getByTestId('CancelIcon')
    .click()
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(
    page.locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Foundation3:41Vibe Tracks'
    })
  ).toBeVisible()

  // filter stays applied when navigating to another page
  await page.getByLabel('Back').click()
  await expect(page).toHaveURL('/')
  await page.getByLabel('Audio Library').click()
  await expect(page).toHaveURL('/audio-library')
  await expect(
    page.getByRole('button', { name: 'tracks' }).first()
  ).toBeVisible()

  // clear all filters
  await page.getByRole('combobox').click()
  await page.getByLabel('Clear').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Foundation3:41Vibe Tracks'
    })
  ).toBeVisible()
})

test('Save Position Audio List', async ({ page }) => {
  test.slow()
  await page.goto('/')
  await page.getByLabel('Audio Library').click()
  await expect(page).toHaveURL('/audio-library')

  // setup: make list scrollable
  for (let i = 0; i < 10; i++) {
    await page.getByTestId('AddIcon').click()
    await expect(page.getByTestId('HttpIcon')).toBeVisible()

    const responsePromise = page.waitForResponse((res) => {
      const request = res.request()
      return (
        new URL(request.url()).pathname === `/api/audios/${11 + i}` &&
        request.method() === 'GET' &&
        res.status() === 200
      )
    })
    await page.getByTestId('HttpIcon').click()
    await page
      .getByLabel('Audio URL', { exact: true })
      .fill(
        `https://feeds.soundcloud.com/stream/336839158-royaltyfreemusic-nocopyrightmusic-sugar-vibe-tracks-${i}.mp3`
      )
    await page.getByText('Import').click()

    await expect(page.locator('#sortable-list li')).toHaveCount(7 + i)
    await responsePromise
  }
  await expect(page.locator('#sortable-list li')).toHaveCount(16)
  await page
    .locator('#sortable-list > div > div > div')
    .last()
    .scrollIntoViewIfNeeded()
  await expect(page.locator('#sortable-list li').last()).toBeInViewport()

  // audio library tracks position stays same after navigating to albums tab
  await page.locator('#vertical-tab-2').click()
  await expect(page).toHaveURL('/audio-library/albums')

  await page.locator('#vertical-tab-3').click()
  await expect(page).toHaveURL('/audio-library/tracks')
  await expect(page.locator('#sortable-list li').last()).toBeInViewport()

  // audio library tracks position stays same after navigating to artists tab
  await page.locator('#vertical-tab-1').click()
  await expect(page).toHaveURL('/audio-library/artists')

  await page.locator('#vertical-tab-3').click()
  await expect(page).toHaveURL('/audio-library/tracks')
  await expect(page.locator('#sortable-list li').last()).toBeInViewport()

  // audio library tracks position stays same after navigating to playlists tab
  await page.locator('#vertical-tab-0').click()
  await expect(page).toHaveURL('/audio-library/playlists')

  await page.locator('#vertical-tab-3').click()
  await expect(page).toHaveURL('/audio-library/tracks')
  await expect(page.locator('#sortable-list li').last()).toBeInViewport()

  // audio library tracks position stays same after navigating back
  await page.getByLabel('Back').click()
  await expect(page).toHaveURL('/')
  await page.getByLabel('Audio Library').click()
  await expect(page).toHaveURL('/audio-library')
  await expect(page.locator('#sortable-list li').last()).toBeInViewport()

  // audio library position stays same after navigating to tags
  await page.getByLabel('Manage Tags').click()
  await expect(page).toHaveURL('/tags')
  await page.getByLabel('Back').click()
  await expect(page).toHaveURL('/audio-library')
  await expect(page.locator('#sortable-list li').last()).toBeInViewport()

  // TODO audio library yOffset is saved when playing scene
})

test('Delete Visible Audios', async ({ page }) => {
  await page.getByRole('combobox').fill('-Vibe')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: '-Vibe' })).toBeVisible()
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Smile2:04Aftertune, Ultimate MixSmile'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: 'Sea2:09MBBSea' })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: 'Run Free1:45Hotham, Royalty Free MusicRun Free'
    })
  ).toBeVisible()

  await page.getByTestId('DeleteSweepIcon').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Delete These Tracks', exact: true })
  ).toBeVisible()
  await page.getByTestId('DeleteSweepIcon').click()

  await expect(
    page.getByText('Delete Audio Tracks', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByText(
      'Are you sure you want to remove these tracks from your library?',
      { exact: true }
    )
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).not.toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Confirm', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Confirm', exact: true })
  ).not.toBeDisabled()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(
    page.getByText('Delete Audio Tracks', { exact: true })
  ).not.toBeVisible()
  await expect(page.locator('#sortable-list li')).toHaveCount(3)

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/audios' &&
      request.method() === 'DELETE' &&
      res.status() === 204
    )
  })
  await page.getByTestId('DeleteSweepIcon').click()
  await expect(
    page.getByText('Delete Audio Tracks', { exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Confirm', exact: true }).click()
  await expect(page.getByRole('button', { name: '-Vibe' })).not.toBeVisible()
  await expect(page.locator('#sortable-list li')).toHaveCount(13)
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Take You Home Tonight3:33Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', {
      hasText: '32Foundation3:41Vibe Tracks'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li', { hasText: '32Sugar3:50Vibe Tracks' })
  ).toHaveCount(11)
  await responsePromise
})

test('Delete All Audios', async ({ page }) => {
  await expect(page.locator('#sortable-list li')).toHaveCount(13)
  await page.getByTestId('DeleteSweepIcon').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Delete All Tracks', exact: true })
  ).toBeVisible()
  await page.getByTestId('DeleteSweepIcon').click()

  await expect(
    page.getByText('Delete Audio Library', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByText(
      'Are you sure you want to delete your entire audio library?',
      { exact: true }
    )
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).not.toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Confirm', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Confirm', exact: true })
  ).not.toBeDisabled()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(
    page.getByText('Delete Audio Library', { exact: true })
  ).not.toBeVisible()
  await expect(page.locator('#sortable-list li')).toHaveCount(13)

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/audios' &&
      request.method() === 'DELETE' &&
      res.status() === 204
    )
  })
  await page.getByTestId('DeleteSweepIcon').click()
  await expect(
    page.getByText('Delete Audio Library', { exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Confirm', exact: true }).click()
  await expect(page.locator('#sortable-list li')).toHaveCount(0)
  await responsePromise
})
