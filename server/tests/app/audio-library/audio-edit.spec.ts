import { test, expect } from '@playwright/test'

test.beforeAll(async ({ page }) => {
  await page.goto('/audio-library')
  await page.getByTestId('AddIcon').click()
  await page.getByLabel('Local Audio').click()
  await expect(page.getByRole('button', { name: /^audio/ })).toBeVisible()
  await page.getByRole('button', { name: /^audio/ }).dblclick()
  await expect(page.getByRole('button', { name: /^Aftertune, Ultimate Mix - Smile.mp3/ })).toBeVisible()
  await page.getByRole('button', { name: /^Aftertune, Ultimate Mix - Smile.mp3/ }).click()
  await page.getByRole('button', {name: 'Choose', exact: true}).click()
  await expect(page.locator('#sortable-list li')).toHaveCount(1)
})

test.afterAll(async ({ page }) => {
  await page.goto('/audio-library')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/audios/1' &&
      request.method() === 'DELETE' &&
      res.status() === 204
    )
  })
  await page.getByTestId('DeleteIcon').nth(0).click()
  await expect(page.locator('#sortable-list li')).toHaveCount(0)
  await responsePromise
})

test.beforeEach(async ({ page }) => {
  await page.goto('/audio-library')
})

test('Audio edit cancel', async ({ page }) => {
  const item = page.locator('#sortable-list li').first()
  const dialog = page.locator('.MuiDialog-container')

  await expect(item.getByAltText('Smile')).toHaveAttribute('src', 'http://localhost:5050/fs/file/audio-thumb/7c6c8f0ffaba70bd41f8ba3678b726b9ff936e09b3fcba0ba993a28cae996f55.jpeg')
  await expect(item.getByText('Smile').nth(0)).toBeVisible()
  await expect(item.getByText('Aftertune, Ultimate Mix')).toBeVisible()
  await expect(item.getByText('Smile').nth(1)).toBeVisible()

  await item.getByTestId('EditIcon').click()
  await expect(dialog.getByText('Edit song info', {exact: true})).toBeVisible()
  await expect(dialog.getByLabel('Name')).toHaveValue('Smile')
  await expect(dialog.getByLabel('Artist')).toHaveValue('Aftertune, Ultimate Mix')
  await expect(dialog.getByLabel('Album')).toHaveValue('Smile')
  await expect(dialog.getByLabel('Track #')).toHaveValue('0')
  await expect(dialog.getByLabel('Comment')).toHaveValue('')
  await expect(dialog.getByAltText('Smile')).toHaveAttribute('src', 'http://localhost:5050/fs/file/audio-thumb/7c6c8f0ffaba70bd41f8ba3678b726b9ff936e09b3fcba0ba993a28cae996f55.jpeg')

  await dialog.getByLabel('Name').fill('Name')
  await dialog.getByLabel('Artist').fill('Artist')
  await dialog.getByLabel('Album').fill('Album')
  await dialog.getByLabel('Track #').fill('42')
  await dialog.getByLabel('Comment').fill('Comment')

  await dialog.getByTestId('DeleteIcon').click()
  await expect(dialog.getByTestId('AudiotrackIcon')).toBeVisible()
  await dialog.getByRole('button', {name: 'Cancel', exact: true}).click()

  await expect(item.getByAltText('Smile')).toHaveAttribute('src', 'http://localhost:5050/fs/file/audio-thumb/7c6c8f0ffaba70bd41f8ba3678b726b9ff936e09b3fcba0ba993a28cae996f55.jpeg')
  await expect(item.getByText('Smile').nth(0)).toBeVisible()
  await expect(item.getByText('Aftertune, Ultimate Mix')).toBeVisible()
  await expect(item.getByText('Smile').nth(1)).toBeVisible()

  await item.getByTestId('EditIcon').click()
  await expect(dialog.getByLabel('Name')).toHaveValue('Smile')
  await expect(dialog.getByLabel('Artist')).toHaveValue('Aftertune, Ultimate Mix')
  await expect(dialog.getByLabel('Album')).toHaveValue('Smile')
  await expect(dialog.getByLabel('Track #')).toHaveValue('0')
  await expect(dialog.getByLabel('Comment')).toHaveValue('')
  await expect(dialog.getByAltText('Smile')).toHaveAttribute('src', 'http://localhost:5050/fs/file/audio-thumb/7c6c8f0ffaba70bd41f8ba3678b726b9ff936e09b3fcba0ba993a28cae996f55.jpeg')
})

test('Audio edit cover art', async ({ page }) => {
  const item = page.locator('#sortable-list li').first()
  const dialog = page.locator('.MuiDialog-container')
  
  await expect(item.getByAltText('Smile')).toHaveAttribute('src', 'http://localhost:5050/fs/file/audio-thumb/7c6c8f0ffaba70bd41f8ba3678b726b9ff936e09b3fcba0ba993a28cae996f55.jpeg')
  
  await item.getByTestId('EditIcon').click()
  await expect(dialog.getByAltText('Smile')).toHaveAttribute('src', 'http://localhost:5050/fs/file/audio-thumb/7c6c8f0ffaba70bd41f8ba3678b726b9ff936e09b3fcba0ba993a28cae996f55.jpeg')
  await dialog.getByTestId('DeleteIcon').click()
  await expect(dialog.getByTestId('AudiotrackIcon')).toBeVisible()
  await dialog.getByTestId('AudiotrackIcon').click()
  await expect(page.getByRole('button', { name: /^img/ })).toBeVisible()
  await page.getByRole('button', { name: /^img/ }).dblclick()
  await expect(page.getByRole('button', { name: /^flipflip_logo.png/ })).toBeVisible()
  await page.getByRole('button', { name: /^flipflip_logo.png/ }).click()
  await page.getByRole('button', {name: 'Choose', exact: true}).click()
  await expect(dialog.getByAltText('Smile')).toHaveAttribute('src', 'http://localhost:5050/fs/file/audio-thumb/a089402977a8f2e195669b32faf1a9d7161656c9fc0c24933e41219a1273735b.png')
  await dialog.getByRole('button', {name: 'Save', exact: true}).click()
  await expect(item.getByAltText('Smile')).toHaveAttribute('src', 'http://localhost:5050/fs/file/audio-thumb/a089402977a8f2e195669b32faf1a9d7161656c9fc0c24933e41219a1273735b.png')
  
  await item.getByTestId('EditIcon').click()
  await expect(dialog.getByAltText('Smile')).toHaveAttribute('src', 'http://localhost:5050/fs/file/audio-thumb/a089402977a8f2e195669b32faf1a9d7161656c9fc0c24933e41219a1273735b.png')
})

test('Audio edit inputs', async ({ page }) => {
  const item = page.locator('#sortable-list li').first()
  const dialog = page.locator('.MuiDialog-container')

  await item.getByTestId('EditIcon').click()
  await dialog.getByLabel('Name').fill('Name')
  await dialog.getByLabel('Artist').fill('Artist')
  await dialog.getByLabel('Album').fill('Album')
  await expect(dialog.getByLabel('Track #')).toHaveAttribute('type', 'number')
  await expect(dialog.getByLabel('Track #')).toHaveAttribute('min', '0')
  await dialog.getByLabel('Track #').fill('42')
  await dialog.getByLabel('Comment').fill('Comment')
  await dialog.getByRole('button', {name: 'Save', exact: true}).click()

  await expect(item.getByText('Name')).toBeVisible()
  await expect(item.getByText('Artist')).toBeVisible()
  await expect(item.getByText('Album')).toBeVisible()
  await expect(item.locator('.MuiBadge-badge.MuiBadge-colorPrimary')).toHaveText('42')
  await item.getByRole('img').hover()
  await expect(page.getByRole('tooltip')).toHaveText('Comment')

  await item.getByTestId('EditIcon').click()
  await expect(dialog.getByLabel('Name')).toHaveValue('Name')
  await expect(dialog.getByLabel('Artist')).toHaveValue('Artist')
  await expect(dialog.getByLabel('Album')).toHaveValue('Album')
  await expect(dialog.getByLabel('Track #')).toHaveValue('42')
  await expect(dialog.getByLabel('Comment')).toHaveValue('Comment')
})

test('Audio edit use suggestions', async ({ page }) => {
  const item = page.locator('#sortable-list li').first()
  const dialog = page.locator('.MuiDialog-container')

  await item.getByTestId('EditIcon').click()
  await dialog.getByRole('button', {name: 'Use Suggestions', exact: true}).click()

  await expect(dialog.getByAltText('Smile')).toHaveAttribute('src', 'http://localhost:5050/fs/file/audio-thumb/7c6c8f0ffaba70bd41f8ba3678b726b9ff936e09b3fcba0ba993a28cae996f55.jpeg')
  await expect(dialog.getByLabel('Name')).toHaveValue('Smile')
  await expect(dialog.getByLabel('Artist')).toHaveValue('Aftertune, Ultimate Mix')
  await expect(dialog.getByLabel('Album')).toHaveValue('Smile')
  await expect(dialog.getByLabel('Track #')).toHaveValue('42')
  await expect(dialog.getByLabel('Comment')).toHaveValue('Comment')
})

test.fixme('Audio batch edit', async ({ page }) => {
  // TODO test batch edit
})