import path from 'path'
import { test, expect } from '@playwright/test'
import { dragListItem } from '../utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/script-library')
})

test('Script library navigation', async ({ page }) => {
  await page.getByLabel('Manage Tags').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Manage Tags', exact: true })
  ).toBeVisible()
  await page.getByLabel('Manage Tags').click()
  await expect(page).toHaveURL('/tags')

  await page.getByLabel('Back').click()
  await expect(page).toHaveURL('/script-library')

  await page.getByLabel('Batch Tag').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Batch Tag', exact: true })
  ).toBeVisible()
  await page.getByLabel('Batch Tag').click()

  await page.getByLabel('Back').click()
  await page.getByRole('listitem').getByRole('button').click()
  await expect(page.locator('#root > div > div > div')).toHaveCSS(
    'width',
    '240px'
  )
  await page.getByRole('listitem').getByRole('button').click()
})

test('Title', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'Caption Script Library', exact: true })
  ).toBeVisible()
})

test('No Caption Scripts', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: '乁( ◔ ౪◔)「', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Nothing here', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Add new scripts', exact: true })
  ).toBeVisible()
  await expect(page.getByTestId('AddIcon')).toBeVisible()
  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await expect(page.getByTestId('SortIcon')).toBeDisabled()
})

test('Batch Tag No Caption Scripts', async ({ page }) => {
  await page.getByLabel('Batch Tag').click()
  await expect(
    page.getByRole('heading', { name: '乁( ◔ ౪◔)「', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Nothing here', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Add new scripts', exact: true })
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
    page.getByRole('heading', { name: 'Add new scripts', exact: true })
  ).toBeVisible()

  await expect(
    page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon')
  ).not.toBeVisible()
  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await expect(page.getByTestId('SelectAllIcon')).not.toBeVisible()
  await expect(page.getByTestId('ClearIcon')).not.toBeVisible()
})

test('Add Single Local Caption Script', async ({ page }) => {
  await page.getByTestId('AddIcon').click()
  await expect(page.getByTestId('DescriptionIcon')).toBeVisible()
  await page.getByTestId('DescriptionIcon').hover()
  await expect(page.getByRole('tooltip')).toHaveText('Local Script')
  await page.getByTestId('DescriptionIcon').click()
  await expect(page.getByRole('button', { name: /^scripts/ })).toBeVisible()
  await page.getByRole('button', { name: /^scripts/ }).dblclick()

  await page.keyboard.down('Shift')
  await page.getByRole('button', { name: /^phrases.txt/ }).click()
  await page.keyboard.up('Shift')
  await expect(
    page.getByRole('button', { name: /^bpm-timing.txt/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^phrase-groups.txt/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(page.getByRole('button', { name: /^phrases.txt/ })).toHaveClass(
    / Mui-selected /
  )
  await expect(
    page.getByRole('button', { name: /^random-timing.txt/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^wave-timing.txt/ })
  ).not.toHaveClass(/ Mui-selected /)

  await page.keyboard.down('Shift')
  await page.getByRole('button', { name: /^bpm-timing.txt/ }).click()
  await page.keyboard.up('Shift')
  await expect(
    page.getByRole('button', { name: /^bpm-timing.txt/ })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^phrase-groups.txt/ })
  ).toHaveClass(/ Mui-selected /)
  await expect(page.getByRole('button', { name: /^phrases.txt/ })).toHaveClass(
    / Mui-selected /
  )
  await expect(
    page.getByRole('button', { name: /^random-timing.txt/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^wave-timing.txt/ })
  ).not.toHaveClass(/ Mui-selected /)

  await page.keyboard.down('Shift')
  await page.getByRole('button', { name: /^wave-timing.txt/ }).click()
  await page.keyboard.up('Shift')
  await expect(
    page.getByRole('button', { name: /^bpm-timing.txt/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^phrase-groups.txt/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(page.getByRole('button', { name: /^phrases.txt/ })).toHaveClass(
    / Mui-selected /
  )
  await expect(
    page.getByRole('button', { name: /^random-timing.txt/ })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^wave-timing.txt/ })
  ).toHaveClass(/ Mui-selected /)

  await page.keyboard.down('Control')
  await page.getByRole('button', { name: /^random-timing.txt/ }).click()
  await page.keyboard.up('Control')
  await expect(
    page.getByRole('button', { name: /^bpm-timing.txt/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^phrase-groups.txt/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(page.getByRole('button', { name: /^phrases.txt/ })).toHaveClass(
    / Mui-selected /
  )
  await expect(
    page.getByRole('button', { name: /^random-timing.txt/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^wave-timing.txt/ })
  ).toHaveClass(/ Mui-selected /)

  await page.keyboard.down('Shift')
  await page.getByRole('button', { name: /^bpm-timing.txt/ }).click()
  await page.keyboard.up('Shift')
  await expect(
    page.getByRole('button', { name: /^bpm-timing.txt/ })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^phrase-groups.txt/ })
  ).toHaveClass(/ Mui-selected /)
  await expect(page.getByRole('button', { name: /^phrases.txt/ })).toHaveClass(
    / Mui-selected /
  )
  await expect(
    page.getByRole('button', { name: /^random-timing.txt/ })
  ).toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^wave-timing.txt/ })
  ).not.toHaveClass(/ Mui-selected /)

  await page.getByRole('button', { name: /^phrases.txt/ }).click()
  await expect(
    page.getByRole('button', { name: /^bpm-timing.txt/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^phrase-groups.txt/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(page.getByRole('button', { name: /^phrases.txt/ })).toHaveClass(
    / Mui-selected /
  )
  await expect(
    page.getByRole('button', { name: /^random-timing.txt/ })
  ).not.toHaveClass(/ Mui-selected /)
  await expect(
    page.getByRole('button', { name: /^wave-timing.txt/ })
  ).not.toHaveClass(/ Mui-selected /)

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts' &&
      request.method() === 'POST' &&
      res.status() === 204
    )
  })
  await page.getByRole('button', { name: 'Choose', exact: true }).click()
  await expect(page.locator('#sortable-list li')).toHaveCount(1)
  await expect(page.locator('#sortable-list li p')).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await expect(
    page.getByRole('heading', { name: '乁( ◔ ౪◔)「', exact: true })
  ).not.toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Nothing here', exact: true })
  ).not.toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Add new scripts', exact: true })
  ).not.toBeVisible()
  await responsePromise
})

test('Click Script Source Icon', async ({ page }) => {
  await page.getByTestId('ListIcon').nth(0).click()
  await expect(
    page.getByText('Choose a scene to test with:', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).not.toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Play', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Play', exact: true })
  ).toBeDisabled()

  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(
    page.getByText('Choose a scene to test with:', { exact: true })
  ).not.toBeVisible()

  // TODO Test change play with scene
  // TODO play is NOT disabled
  // TODO click play -> navigates to player
})

test('Shift + Click Local Script', async ({ page }) => {
  await page.keyboard.down('Shift')
  await page.getByTestId('ListIcon').nth(0).click()
  await page.keyboard.up('Shift')
  await expect(page).toHaveURL('http://localhost:5050/fs/open/caption-script/1')
  await page.goBack()
  await expect(page).toHaveURL('/script-library')
})

test('Edit Caption Script Options', async ({ page }) => {
  await page.getByTestId('BuildIcon').nth(0).click()
  await expect(page).toHaveURL('/scripts/1/options')
  await page.getByTestId('ArrowBackIcon').click()
  await expect(page).toHaveURL('/script-library')
})

test('Edit Caption Script in Scriptor', async ({ page }) => {
  await page.getByTestId('EditIcon').nth(0).click()
  await expect(page).toHaveURL('/scriptor/1')
  await page.getByTestId('ArrowBackIcon').click()
  await expect(page).toHaveURL('/script-library')
})

test('Delete Single Caption Script', async ({ page }) => {
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/1' &&
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
    page.getByRole('heading', { name: 'Add new scripts', exact: true })
  ).toBeVisible()
  await responsePromise
})

test('Add Multiple Local Caption Scripts', async ({ page }) => {
  await page.getByTestId('AddIcon').click()
  await expect(page.getByTestId('DescriptionIcon')).toBeVisible()
  await page.getByTestId('DescriptionIcon').click()
  await expect(page.getByRole('button', { name: /^scripts/ })).toBeVisible()
  await page.getByRole('button', { name: /^scripts/ }).dblclick()

  await page.keyboard.down('Shift')
  await page.getByRole('button', { name: /^bpm-timing.txt/ }).click()
  await page.keyboard.up('Shift')
  await page.keyboard.down('Shift')
  await page.getByRole('button', { name: /^phrases.txt/ }).click()
  await page.keyboard.up('Shift')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts' &&
      request.method() === 'POST' &&
      res.status() === 204
    )
  })
  await page.getByRole('button', { name: 'Choose', exact: true }).click()
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(page.locator('#sortable-list li p').nth(0)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(1)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(2)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await responsePromise
})

test('Add Same Local Caption Script', async ({ page }) => {
  await page.getByTestId('AddIcon').click()
  await expect(page.getByTestId('DescriptionIcon')).toBeVisible()
  await page.getByTestId('DescriptionIcon').click()
  await expect(page.getByRole('button', { name: /^scripts/ })).toBeVisible()
  await page.getByRole('button', { name: /^scripts/ }).dblclick()
  await page.getByRole('button', { name: /^phrases.txt/ }).click()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts' &&
      request.method() === 'POST' &&
      res.status() === 204
    )
  })
  await page.getByRole('button', { name: 'Choose', exact: true }).click()
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await expect(page.locator('#sortable-list li p').nth(0)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(1)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(2)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await responsePromise
})

test('Add Remote Caption Script', async ({ page }) => {
  await page.getByTestId('AddIcon').click()
  await expect(page.getByTestId('HttpIcon')).toBeVisible()
  await page.getByTestId('HttpIcon').hover()
  await expect(page.getByRole('tooltip')).toHaveText('URL')

  let responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/4' &&
      request.method() === 'GET' &&
      res.status() === 200
    )
  })
  await page.getByTestId('HttpIcon').click()

  await expect(page.locator('#sortable-list li')).toHaveCount(4)
  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/4' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await page
    .locator('#sortable-list li input')
    .fill('https://pastebin.com/raw/ZNJ5A40S')
  await expect(page.locator('#sortable-list li input')).toHaveValue(
    'https://pastebin.com/raw/ZNJ5A40S'
  )

  await page.getByTestId('AddIcon').click()
  await expect(page.getByTestId('HttpIcon')).toBeVisible()

  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/5' &&
      request.method() === 'GET' &&
      res.status() === 200
    )
  })
  await page.getByTestId('HttpIcon').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(5)

  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/5' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await page
    .locator('#sortable-list li input')
    .fill('https://pastebin.com/raw/LDvJvg0C')
  await expect(page.locator('#sortable-list li input')).toHaveValue(
    'https://pastebin.com/raw/LDvJvg0C'
  )

  await page.getByTestId('AddIcon').click()
  await expect(page.getByTestId('HttpIcon')).toBeVisible()

  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/6' &&
      request.method() === 'GET' &&
      res.status() === 200
    )
  })
  await page.getByTestId('HttpIcon').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(6)

  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/6' &&
      request.method() === 'PATCH' &&
      res.status() === 204
    )
  })
  await page
    .locator('#sortable-list li input')
    .fill('https://pastebin.com/raw/48LPhQD3')
  await expect(page.locator('#sortable-list li input')).toHaveValue(
    'https://pastebin.com/raw/48LPhQD3'
  )
  await page.locator('.MuiDrawer-root').click()
  await expect(page.locator('#sortable-list li p').nth(0)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
  )
  await responsePromise
})

test('Add Same Remote Caption Script', async ({ page }) => {
  // TODO add tags to test if they are kept

  await page.getByTestId('AddIcon').click()
  await expect(page.getByTestId('HttpIcon')).toBeVisible()

  let responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/7' &&
      request.method() === 'GET' &&
      res.status() === 200
    )
  })
  await page.getByTestId('HttpIcon').click()

  await expect(page.locator('#sortable-list li')).toHaveCount(7)
  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/7' &&
      request.method() === 'PATCH' &&
      res.status() === 205
    )
  })
  await page
    .locator('#sortable-list li input')
    .fill('https://pastebin.com/raw/ZNJ5A40S')
  await expect(page.locator('#sortable-list li input')).toHaveValue(
    'https://pastebin.com/raw/ZNJ5A40S'
  )
  await page.locator('.MuiDrawer-root').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await expect(page.locator('#sortable-list li p').nth(0)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )
  await expect(page.locator('#sortable-list li p').nth(1)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
  )
  await expect(page.locator('#sortable-list li p').nth(2)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li p').nth(3)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(4)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(5)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await responsePromise
})

test('Shift + Click Remote Script', async ({ page }) => {
  await page.keyboard.down('Shift')
  await page.getByTestId('ListIcon').nth(0).click()
  await page.keyboard.up('Shift')
  await expect(page).toHaveURL('https://pastebin.com/raw/ZNJ5A40S')
  await page.goBack()
  await expect(page).toHaveURL('/script-library')
})

test('Sort By Title', async ({ page }) => {
  await expect(page.locator('#sortable-list li p').nth(0)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )
  await expect(page.locator('#sortable-list li p').nth(1)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
  )
  await expect(page.locator('#sortable-list li p').nth(2)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li p').nth(3)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(4)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(5)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('#sort-menu li').nth(0)).toHaveText('By Title')
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
  await expect(page.locator('#sortable-list li p').nth(0)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )
  await expect(page.locator('#sortable-list li p').nth(1)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(2)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(3)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li p').nth(4)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(5)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
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
  await expect(page.locator('#sortable-list li p').nth(0)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
  )
  await expect(page.locator('#sortable-list li p').nth(1)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(2)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li p').nth(3)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(4)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(5)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )
})

test('Sort By Full Title', async ({ page }) => {
  await expect(page.locator('#sortable-list li p').nth(0)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
  )
  await expect(page.locator('#sortable-list li p').nth(1)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(2)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li p').nth(3)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(4)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(5)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('#sort-menu li').nth(1)).toHaveText('By Full Title')
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
  await expect(page.locator('#sortable-list li p').nth(0)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )
  await expect(page.locator('#sortable-list li p').nth(1)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li p').nth(2)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
  )
  await expect(page.locator('#sortable-list li p').nth(3)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(4)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(5)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
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
  await expect(page.locator('#sortable-list li p').nth(0)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(1)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(2)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(3)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
  )
  await expect(page.locator('#sortable-list li p').nth(4)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li p').nth(5)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )
})

test('Sort By Date', async ({ page }) => {
  await expect(page.locator('#sortable-list li p').nth(0)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(1)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(2)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(3)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
  )
  await expect(page.locator('#sortable-list li p').nth(4)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li p').nth(5)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('#sort-menu li').nth(2)).toHaveText('By Date')
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
  await expect(page.locator('#sortable-list li p').nth(0)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
  )
  await expect(page.locator('#sortable-list li p').nth(1)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li p').nth(2)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )
  await expect(page.locator('#sortable-list li p').nth(3)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(4)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(5)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
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

  await expect(page.locator('#sortable-list li p').nth(0)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(1)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(2)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await expect(page.locator('#sortable-list li p').nth(3)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )
  await expect(page.locator('#sortable-list li p').nth(4)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li p').nth(5)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
  )
})

test('Move Caption Script Down', async ({ page }) => {
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
  )

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/move' &&
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
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )
  await responsePromise
})

test('Move Caption Script Up', async ({ page }) => {
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts/move' &&
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
    'https://pastebin.com/raw/48LPhQD3'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )
  await responsePromise
})

test('Randomize Order', async ({ page }) => {
  await expect(page.locator('#sortable-list li').nth(0)).toHaveText(
    'https://pastebin.com/raw/48LPhQD3'
  )
  await expect(page.locator('#sortable-list li').nth(1)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')
  )
  await expect(page.locator('#sortable-list li').nth(2)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')
  )
  await expect(page.locator('#sortable-list li').nth(3)).toHaveText(
    'https://pastebin.com/raw/ZNJ5A40S'
  )
  await expect(page.locator('#sortable-list li').nth(4)).toHaveText(
    'https://pastebin.com/raw/LDvJvg0C'
  )
  await expect(page.locator('#sortable-list li').nth(5)).toHaveText(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('#sort-menu li').nth(3)).toHaveText(
    'Randomize Order'
  )
  await expect(
    page.locator('#sort-menu li').nth(3).getByTestId('ShuffleIcon')
  ).toBeVisible()
  await page.locator('#sort-menu li').nth(3).getByTestId('ShuffleIcon').click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await expect(
    page.locator('#sortable-list li p', {
      hasText: 'https://pastebin.com/raw/ZNJ5A40S'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li p', {
      hasText: 'https://pastebin.com/raw/48LPhQD3'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li p', {
      hasText: 'https://pastebin.com/raw/LDvJvg0C'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li p', {
      hasText: path.join(
        __dirname,
        '..',
        '..',
        'data',
        'scripts',
        'bpm-timing.txt'
      )
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li p', {
      hasText: path.join(
        __dirname,
        '..',
        '..',
        'data',
        'scripts',
        'phrase-groups.txt'
      )
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li p', {
      hasText: path.join(
        __dirname,
        '..',
        '..',
        'data',
        'scripts',
        'phrases.txt'
      )
    })
  ).toBeVisible()
})

test('Empty URL Deletes Caption Script', async ({ page }) => {
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await page
    .locator('#sortable-list li p', {
      hasText: 'https://pastebin.com/raw/48LPhQD3'
    })
    .click()
  await page.locator('#sortable-list li input').fill('')
  await page.locator('.MuiDrawer-root').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(5)
  await expect(
    page.locator('#sortable-list li p', {
      hasText: 'https://pastebin.com/raw/ZNJ5A40S'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li p', {
      hasText: 'https://pastebin.com/raw/LDvJvg0C'
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li p', {
      hasText: path.join(
        __dirname,
        '..',
        '..',
        'data',
        'scripts',
        'bpm-timing.txt'
      )
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li p', {
      hasText: path.join(
        __dirname,
        '..',
        '..',
        'data',
        'scripts',
        'phrase-groups.txt'
      )
    })
  ).toBeVisible()
  await expect(
    page.locator('#sortable-list li p', {
      hasText: path.join(
        __dirname,
        '..',
        '..',
        'data',
        'scripts',
        'phrases.txt'
      )
    })
  ).toBeVisible()
})

test('Batch Tag Select With Shift', async ({ page }) => {
  await page.getByLabel('Batch Tag').click()
  await expect(page.getByRole('checkbox')).toHaveCount(5)
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
})

test('Batch Tag Select All', async ({ page }) => {
  await page.getByLabel('Batch Tag').click()
  await expect(page.getByRole('checkbox')).toHaveCount(5)
  for (let i = 0; i < 5; i++) {
    await expect(page.getByRole('checkbox').nth(i)).not.toBeChecked()
  }

  await expect(page.getByTestId('SelectAllIcon')).toBeVisible()
  await page.getByTestId('SelectAllIcon').click()
  for (let i = 0; i < 5; i++) {
    await expect(page.getByRole('checkbox').nth(i)).toBeChecked()
  }
})

test('Batch Tag Select None', async ({ page }) => {
  await page.getByLabel('Batch Tag').click()
  await page.getByTestId('SelectAllIcon').click()
  await expect(page.getByRole('checkbox')).toHaveCount(5)
  for (let i = 0; i < 5; i++) {
    await expect(page.getByRole('checkbox').nth(i)).toBeChecked()
  }

  await expect(page.getByTestId('ClearIcon')).toBeVisible()
  await page.getByTestId('ClearIcon').click()

  for (let i = 0; i < 5; i++) {
    await expect(page.getByRole('checkbox').nth(i)).not.toBeChecked()
  }
})

test.fixme('Batch Tag Select All With Filter', async ({ page }) => {
  // Apply filter
  // Select all scripts
  // Remove filter
  // Previously selected scripts are still selected and no other scripts are selected
  // Select none to clear state
})

test('Batch Tag Single Caption Script', async ({ page }) => {
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
  await expect(page).toHaveURL('/script-library')

  await page.getByLabel('Batch Tag').click()
  await expect(
    page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon')
  ).toBeVisible()
  await expect(
    page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon')
  ).toBeDisabled()
  await page.getByRole('checkbox').nth(0).click()
  await expect(
    page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon')
  ).toBeVisible()
  await expect(
    page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon')
  ).not.toBeDisabled()
  await expect(page.locator('.MuiBadge-root .MuiBadge-badge')).toHaveText('1')

  // Add tags
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
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
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('pets')

  // Add duplicate tag
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
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
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(3)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(2)
  ).toHaveText('pets')

  // Remove tags
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
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
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')

  // Overwrite same tag
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
  ).toHaveText('car (1)')
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: 'Overwrite', exact: true }).click()
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')

  // Overwrite different tags
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
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('pets')

  // Overwrite tag overlap
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
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
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')

  // Overwrite no tags selected
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
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
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await page.getByRole('checkbox').nth(0).uncheck()
})

test('Batch Tag Multiple Caption Scripts', async ({ page }) => {
  // Add tags
  await page.getByLabel('Batch Tag').click()
  await page.getByRole('checkbox').nth(0).check()
  await page.getByRole('checkbox').nth(1).check()
  await page.getByRole('checkbox').nth(2).check()
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
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(1)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(1)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(1)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')

  await page.getByRole('checkbox').nth(0).uncheck()
  await page.getByRole('checkbox').nth(1).uncheck()
  await page.getByRole('checkbox').nth(3).check()
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
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(1)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(1)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(1)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(3)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(2)
  ).toHaveText('pets')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(3)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(3)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(3)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('pets')

  // Overwrite tags
  await page.getByRole('checkbox').nth(1).check()
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
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(1)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(1)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(3)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(3)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')

  // Add with overlapping tags
  await page.getByRole('checkbox').nth(0).check()
  await page.getByRole('checkbox').nth(1).uncheck()
  await page.getByRole('checkbox').nth(3).uncheck()
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
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(3)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(2)
  ).toHaveText('pets')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(1)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(1)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(3)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(2)
  ).toHaveText('pets')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(3)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(3)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')

  // Remove tag
  await page.getByRole('checkbox').nth(1).check()
  await page.getByRole('checkbox').nth(2).uncheck()
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
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(2)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('pets')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(1)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(1)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(3)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('animals')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(1)
  ).toHaveText('car')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(2)
  ).toHaveText('pets')
  await expect(
    page
      .locator('#sortable-list li')
      .nth(3)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(1)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(3)
      .locator('.MuiChip-root > .MuiChip-label')
      .nth(0)
  ).toHaveText('car')

  // Remove all tags using overwrite action
  await page.getByTestId('SelectAllIcon').click()
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
  await expect(
    page.getByRole('presentation').locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Overwrite', exact: true }).click()
  await expect(
    page
      .locator('#sortable-list li')
      .nth(0)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(1)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(2)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(3)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await expect(
    page
      .locator('#sortable-list li')
      .nth(4)
      .locator('.MuiChip-root > .MuiChip-label')
  ).toHaveCount(0)
  await page.getByTestId('ClearIcon').click()
  await page.getByTestId('ArrowBackIcon').click()
})

test('Batch Tag Escape Key Navigates Back', async ({ page }) => {
  await expect(page.getByRole('checkbox')).toHaveCount(0)
  await page.getByLabel('Batch Tag').click()
  await expect(page.getByRole('checkbox')).toHaveCount(5)
  await page.getByTestId('SelectAllIcon').click()
  await page.locator('.MuiBadge-root').getByTestId('LocalOfferIcon').click()
  await expect(page.getByRole('heading')).toHaveText('Batch Tag')

  // close batch tag dialog
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('heading', { name: 'Batch Tag', exact: true })
  ).not.toBeVisible()
  await expect(page.getByRole('checkbox')).toHaveCount(5)

  // go back to script library
  await page.keyboard.press('Escape')
  await expect(page.getByRole('checkbox')).toHaveCount(0)
  await expect(page).toHaveURL('/script-library')

  // extra Esc press does nothing
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/script-library')
})

test('Mark Caption Scripts', async ({ page }) => {
  await expect(page.locator('#sortable-list li')).toHaveCount(5)
  await expect(page.locator('#sortable-list li').nth(0).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(page.locator('#sortable-list li').nth(1).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(page.locator('#sortable-list li').nth(2).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(page.locator('#sortable-list li').nth(3).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(page.locator('#sortable-list li').nth(4).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')

  await page.keyboard.press('Alt+m')
  await expect(page.locator('#sortable-list li').nth(0).locator('button').first()).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(page.locator('#sortable-list li').nth(1).locator('button').first()).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(page.locator('#sortable-list li').nth(2).locator('button').first()).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(page.locator('#sortable-list li').nth(3).locator('button').first()).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(page.locator('#sortable-list li').nth(4).locator('button').first()).toHaveCSS('background-color', 'rgb(233, 30, 99)')

  await page.keyboard.press('Alt+m')
  await expect(page.locator('#sortable-list li').nth(0).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(page.locator('#sortable-list li').nth(1).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(page.locator('#sortable-list li').nth(2).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(page.locator('#sortable-list li').nth(3).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(page.locator('#sortable-list li').nth(4).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')

  await page.getByPlaceholder('Search').fill('pastebin')
  await page.keyboard.press('Enter')
  await expect(page.locator('#sortable-list li')).toHaveCount(2)

  await page.keyboard.press('Alt+m')
  await expect(page.locator('#sortable-list li').nth(0).locator('button').first()).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(page.locator('#sortable-list li').nth(1).locator('button').first()).toHaveCSS('background-color', 'rgb(233, 30, 99)')

  await page.getByLabel('Clear').click()
  await expect(page.locator('#sortable-list li').nth(0).locator('button').first()).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(page.locator('#sortable-list li').nth(1).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(page.locator('#sortable-list li').nth(2).locator('button').first()).toHaveCSS('background-color', 'rgb(233, 30, 99)')
  await expect(page.locator('#sortable-list li').nth(3).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(page.locator('#sortable-list li').nth(4).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  
  await page.keyboard.press('Alt+m')
  await expect(page.locator('#sortable-list li').nth(0).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(page.locator('#sortable-list li').nth(1).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(page.locator('#sortable-list li').nth(2).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(page.locator('#sortable-list li').nth(3).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
  await expect(page.locator('#sortable-list li').nth(4).locator('button').first()).toHaveCSS('background-color', 'rgb(63, 81, 181)')
})

test.fixme('Search Caption Scripts', async ({ page }) => {
  // marked filter
  // untagged filter
  // tag filter (starts with [)
  // negative tag filter (starts with -[)
  // url filter (starts with ')
  // negative url filter (starts with -')
  // url filter (starts with ")
  // negative url filter (starts with -")
  // url filter (no prefix)
  // negative url filter (starts with -)
  // combine multiple filters
  // remove a filter by clicking X of chip
  // clear all filters
  // search input is matched case-insensitive
})

test.fixme('Save Position Caption Script List', async ({ page }) => {
  // add caption scripts so that the list becomes scrollable
  // scroll the list
  // navigate to different page
  // go back
  // script library list is in same position
})

test.fixme('Delete All Visible Caption Scripts', async ({ page }) => {
  // TODO apply filter
  // assert that dialog message is: 'Are you sure you want to remove these sources from your caption script library??'
  // assert that only visible scripts were deleted
})

test.fixme('Delete All Caption Scripts', async ({ page }) => {
  await expect(page.locator('#sortable-list li')).toHaveCount(3)
  await page.getByTestId('DeleteSweepIcon').hover()
  await expect(page.getByRole('tooltip')).toHaveText('Delete All Sources')
  await page.getByTestId('DeleteSweepIcon').click()

  await expect(
    page.getByText('Delete Caption Script Library', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByText(
      'Are you sure you want to delete your entire caption script library?',
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
    page.getByText('Delete Caption Script Library', { exact: true })
  ).not.toBeVisible()
  await expect(page.locator('#sortable-list li')).toHaveCount(3)

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/caption-scripts' &&
      request.method() === 'DELETE' &&
      res.status() === 204
    )
  })
  await page.getByTestId('DeleteSweepIcon').click()
  await expect(
    page.getByText('Delete Caption Script Library', { exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Confirm', exact: true }).click()
  await expect(page.locator('#sortable-list li')).toHaveCount(0)
  await responsePromise
})
