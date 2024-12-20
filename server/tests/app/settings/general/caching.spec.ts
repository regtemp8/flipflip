import fs from 'fs'
import path from 'path'
import { test, expect } from '@playwright/test'

test.use({ storageState: 'server/tests/data/session.json' })
test.beforeEach(async ({ page }) => {
  await page.goto('/settings')
})

test('Caching', async ({ page }) => {
  await expect(page.getByLabel('Caching', { exact: true })).toBeChecked()

  await page.getByLabel('Caching', { exact: true }).hover()
  await expect(
    page.getByRole('tooltip', {
      name: 'When enabled, FlipFlip will store downloaded images in a local directory to improve future performance and reduce the need to re-download files.',
      exact: true
    })
  ).toBeVisible()

  await page.getByLabel('Caching', { exact: true }).uncheck()
  await expect(page.getByLabel('Caching', { exact: true })).not.toBeChecked()
  await expect(page.getByTestId('DeleteSweepIcon')).not.toBeVisible()
  await expect(
    page.getByLabel('Caching Directory', { exact: true })
  ).not.toBeVisible()
  await expect(page.getByTestId('ClearIcon')).not.toBeVisible()
  await expect(
    page.getByLabel('Max Cache Size', { exact: true })
  ).not.toBeVisible()
  await expect(
    page.getByText('Current: -- MB', { exact: true })
  ).not.toBeVisible()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/cache' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.enabled === true &&
      res.status() === 204
    )
  })
  await page.getByLabel('Caching', { exact: true }).check()
  await expect(page.getByLabel('Caching', { exact: true })).toBeChecked()
  await expect(page.getByTestId('DeleteSweepIcon')).toBeVisible()
  await expect(
    page.getByLabel('Caching Directory', { exact: true })
  ).toBeVisible()
  await expect(page.getByTestId('ClearIcon')).toBeVisible()
  await expect(page.getByLabel('Max Cache Size', { exact: true })).toBeVisible()
  await expect(page.getByText('Current: -- MB', { exact: true })).toBeVisible()
  await responsePromise
})

test('Caching Directory', async ({ page }) => {
  await expect(page.getByLabel('Caching', { exact: true })).toBeChecked()
  await expect(
    page.getByLabel('Caching Directory', { exact: true })
  ).toHaveValue('')
  await expect(
    page.getByLabel('Caching Directory', { exact: true })
  ).toHaveAttribute(
    'placeholder',
    path.resolve(__dirname, '..', '..', '..', 'data', 'cache')
  )
  await expect(page.getByText('Current: -- MB', { exact: true })).toBeVisible()

  await page.getByLabel('Caching Directory', { exact: true }).click()
  await expect(page.getByRole('button', { name: /^backups/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^logs/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^old-cache/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^scripts/ })).toBeVisible()
  await page.getByTestId('SearchIcon').click()
  await page.getByPlaceholder('Search current directory').fill('lo')
  await expect(page.getByRole('button', { name: /^backups/ })).not.toBeVisible()
  await expect(page.getByRole('button', { name: /^logs/ })).toBeVisible()
  await expect(
    page.getByRole('button', { name: /^old-cache/ })
  ).not.toBeVisible()
  await expect(page.getByRole('button', { name: /^scripts/ })).not.toBeVisible()
  await page.getByTestId('CancelIcon').click()
  await expect(page.getByRole('button', { name: /^backups/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^logs/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^old-cache/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^scripts/ })).toBeVisible()
  await page.getByRole('button', { name: /^logs/ }).click()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(
    page.getByLabel('Caching Directory', { exact: true })
  ).toHaveValue('')
  await expect(page.getByText('Current: -- MB', { exact: true })).toBeVisible()

  await page.getByLabel('Caching Directory', { exact: true }).click()
  await page.getByTestId('EditIcon').click()
  await page
    .getByRole('textbox')
    .fill(path.resolve(__dirname, '..', '..', '..', 'data'))
  await page.getByRole('textbox').press('Enter')
  await expect(page.getByRole('button', { name: /^backups/ })).toBeVisible()
  await page.getByRole('button', { name: /^backups/ }).click()
  await page.getByRole('button', { name: 'Choose', exact: true }).click()
  await expect(
    page.getByLabel('Caching Directory', { exact: true })
  ).toHaveValue(path.resolve(__dirname, '..', '..', '..', 'data', 'backups'))
  await expect(
    page.getByText('Current: 5.78 MB', { exact: true })
  ).toBeVisible()

  await page.getByLabel('Caching Directory', { exact: true }).click()
  await page.getByRole('button', { name: 'data', exact: true }).click()
  await page.getByTestId('CreateNewFolderIcon').click()
  await page.getByRole('textbox').click()
  await page.getByRole('textbox').fill('cache')
  await page.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(page.getByRole('button', { name: /^cache/ })).toBeVisible()
  await page.getByRole('button', { name: /^cache/ }).dblclick()
  await page.getByRole('button', { name: 'Choose', exact: true }).click()
  await expect(
    page.getByLabel('Caching Directory', { exact: true })
  ).toHaveValue(path.resolve(__dirname, '..', '..', '..', 'data', 'cache'))
  await expect(
    page.getByText('Current: 0.00 MB', { exact: true })
  ).toBeVisible()
})

test('Clear Cache', async ({ page }) => {
  await expect(page.getByLabel('Caching', { exact: true })).toBeChecked()

  await page.getByTestId('DeleteSweepIcon').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Clear Cache', exact: true })
  ).toBeVisible()

  const directory = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'data',
    'old-cache'
  )
  await page.getByLabel('Caching Directory', { exact: true }).click()
  await page.getByTestId('EditIcon').click()
  await page
    .getByRole('textbox')
    .fill(path.resolve(__dirname, '..', '..', '..', 'data'))
  await page.getByRole('textbox').press('Enter')
  await expect(page.getByRole('button', { name: 'old-cache' })).toBeVisible()
  await page.getByRole('button', { name: 'old-cache' }).click()
  await page.getByRole('button', { name: 'Choose', exact: true }).click()
  await expect(
    page.getByLabel('Caching Directory', { exact: true })
  ).toHaveValue(directory)
  await expect(
    page.getByText('Current: 2.00 MB', { exact: true })
  ).toBeVisible()

  await page.getByTestId('DeleteSweepIcon').click()
  await expect(
    page.getByText(
      `Are you SURE you want to delete the contents of ${directory}?`,
      { exact: true }
    )
  ).toBeVisible()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(
    page.getByText(
      `Are you SURE you want to delete the contents of ${directory}?`,
      { exact: true }
    )
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Caching Directory', { exact: true })
  ).toHaveValue(directory)
  await expect(
    page.getByText('Current: 2.00 MB', { exact: true })
  ).toBeVisible()

  await page.getByTestId('DeleteSweepIcon').click()
  await expect(
    page.getByRole('button', { name: 'OK', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(
    page.getByText(
      `Are you SURE you want to delete the contents of ${directory}?`,
      { exact: true }
    )
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Caching Directory', { exact: true })
  ).toHaveValue(directory)
  await expect(
    page.getByText('Current: 0.00 MB', { exact: true })
  ).toBeVisible()
})

test('Reset Cache Directory', async ({ page }) => {
  await expect(page.getByLabel('Caching', { exact: true })).toBeChecked()
  await page.getByTestId('ClearIcon').hover()
  await expect(
    page.getByRole('tooltip', { name: 'Reset Cache Directory', exact: true })
  ).toBeVisible()

  const directory = path.resolve(__dirname, '..', '..', '..', 'data')
  await page.getByLabel('Caching Directory', { exact: true }).click()
  await page.getByTestId('EditIcon').click()
  await page.getByRole('textbox').fill(directory)
  await page.getByRole('textbox').press('Enter')
  await expect(page.getByRole('button', { name: 'backups' })).toBeVisible()
  await page.getByRole('button', { name: 'Choose' }).click()
  await expect(
    page.getByLabel('Caching Directory', { exact: true })
  ).toHaveValue(directory)
  await expect(
    page.getByText('Current: 0.00 MB', { exact: true })
  ).toBeVisible()

  await page.getByTestId('ClearIcon').click()
  await expect(
    page.getByLabel('Caching Directory', { exact: true })
  ).toHaveValue('')
  await expect(page.getByText('Current: -- MB', { exact: true })).toBeVisible()
  await expect(fs.existsSync(directory)).toBe(true)
})

test('Max Cache Size', async ({ page }) => {
  await expect(page.getByLabel('Max Cache Size', { exact: true })).toHaveValue(
    '500'
  )
  await expect(
    page.getByLabel('Max Cache Size', { exact: true })
  ).toHaveAttribute('type', 'number')
  await expect(
    page.getByLabel('Max Cache Size', { exact: true })
  ).toHaveAttribute('min', '0')

  await page.getByLabel('Max Cache Size', { exact: true }).hover()
  await expect(
    page.getByRole('tooltip', {
      name: "The maximum size of the caching directory. After the max is reached, new images won't be kept. Set this to 0 to ignore size.",
      exact: true
    })
  ).toBeVisible()

  await page.getByLabel('Max Cache Size', { exact: true }).click()
  await page.getByLabel('Max Cache Size', { exact: true }).fill('0')
  await page.getByLabel('Max Cache Size', { exact: true }).blur()
  await await expect(
    page.getByLabel('Max Cache Size', { exact: true })
  ).toHaveValue('0')

  await page.getByLabel('Max Cache Size', { exact: true }).click()
  await page.getByLabel('Max Cache Size', { exact: true }).fill('1234567890')
  await page.getByLabel('Max Cache Size', { exact: true }).blur()
  await await expect(
    page.getByLabel('Max Cache Size', { exact: true })
  ).toHaveValue('1234567890')

  await page.getByLabel('Max Cache Size', { exact: true }).click()
  await page.getByLabel('Max Cache Size', { exact: true }).fill('-1')
  await page.getByLabel('Max Cache Size', { exact: true }).blur()
  await await expect(
    page.getByLabel('Max Cache Size', { exact: true })
  ).toHaveValue('0')
})
