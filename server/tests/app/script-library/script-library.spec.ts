import path from 'path'
import { test, expect } from '@playwright/test'

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

  // TODO make separate spec where you test each feature of the options page
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
  await page.getByTestId('HttpIcon').click()

  await expect(page.locator('#sortable-list li')).toHaveCount(7)
  const responsePromise = page.waitForResponse((res) => {
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

  await page.locator('#sort-menu li').nth(0).getByTestId('ArrowDownwardIcon').click()
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
  await page.locator('#sort-menu li').nth(0).getByTestId('ArrowUpwardIcon').click()
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

  await page.locator('#sort-menu li').nth(1).getByTestId('ArrowDownwardIcon').click()
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
  await page.locator('#sort-menu li').nth(1).getByTestId('ArrowUpwardIcon').click()
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

  await page.locator('#sort-menu li').nth(2).getByTestId('ArrowDownwardIcon').click()
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
  await page.locator('#sort-menu li').nth(2).getByTestId('ArrowUpwardIcon').click()
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

test('Randomize Order', async ({ page }) => {
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

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('#sort-menu li').nth(3)).toHaveText('Randomize Order')
  await expect(
    page.locator('#sort-menu li').nth(3).getByTestId('ShuffleIcon')
  ).toBeVisible()
  await page.locator('#sort-menu li').nth(3).getByTestId('ShuffleIcon').click()
  await page.locator('#sort-menu .MuiBackdrop-root').click()
  await expect(page.locator('#sortable-list li')).toHaveCount(6)
  await expect(page.locator('#sortable-list li p', {hasText: 'https://pastebin.com/raw/ZNJ5A40S'})).toBeVisible()
  await expect(page.locator('#sortable-list li p', {hasText: 'https://pastebin.com/raw/48LPhQD3'})).toBeVisible()
  await expect(page.locator('#sortable-list li p', {hasText: 'https://pastebin.com/raw/LDvJvg0C'})).toBeVisible()
  await expect(page.locator('#sortable-list li p', {hasText: path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')})).toBeVisible()
  await expect(page.locator('#sortable-list li p', {hasText: path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')})).toBeVisible()
  await expect(page.locator('#sortable-list li p', {hasText: path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')})).toBeVisible()
})

test.fixme('Move Caption Script', async ({ page }) => {
  // move script
  // verify order of scripts
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
  await expect(page.locator('#sortable-list li p', {hasText: 'https://pastebin.com/raw/ZNJ5A40S'})).toBeVisible()
  await expect(page.locator('#sortable-list li p', {hasText: 'https://pastebin.com/raw/LDvJvg0C'})).toBeVisible()
  await expect(page.locator('#sortable-list li p', {hasText: path.join(__dirname, '..', '..', 'data', 'scripts', 'bpm-timing.txt')})).toBeVisible()
  await expect(page.locator('#sortable-list li p', {hasText: path.join(__dirname, '..', '..', 'data', 'scripts', 'phrase-groups.txt')})).toBeVisible()
  await expect(page.locator('#sortable-list li p', {hasText: path.join(__dirname, '..', '..', 'data', 'scripts', 'phrases.txt')})).toBeVisible()
})

test.fixme('Batch Tag No Caption Scripts', async ({ page }) => {
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

test.fixme('Batch Tag Select With Shift', async ({ page }) => {
  // hold down shift
  // select
  // release shift
  // multiple scripts are selected
})

test.fixme('Batch Tag Select All', async ({ page }) => {
    // Select all scripts
})
test.fixme('Batch Tag Select None', async ({ page }) => {
  // Verify that all scripts are selected
  // Select none scripts
})

test.fixme('Batch Tag Select All With Filter', async ({ page }) => {
  // Apply filter
  // Select all scripts
  // Remove filter
  // Previously selected scripts are still selected and no other scripts are selected
  // Select none to clear state
})

test.fixme('Batch Tag Single Caption Script', async ({ page }) => {
  // Select single script
  // Add tags
  // Remove tags
  // Overwrite tags
  // Check tag counts after each step
})

test.fixme('Batch Tag Multiple Caption Scripts', async ({ page }) => {
  // Select multiple scripts
  // Add tags
  // Remove tags
  // Overwrite tags
  // Check tag counts after each step
})

test.fixme('Batch Tag Escape Key Navigates Back', async ({ page }) => {
  // click batch tag
  // select sources
  // open dialog
  // press Esc => dialog closes
  // press Esc => back to library (exit batch tag mode)
  // press Esc => does nothing
})

test.fixme('Mark Caption Scripts', async ({page}) => {
  // mark all caption scripts (ALT + m)
  // unmark all caption scripts
  // apply filter
  // mark all visible caption scripts
  // remove filter
  // only previously filtered caption scripts are marked
  // unmark all caption scripts
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