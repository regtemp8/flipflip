import fs from 'fs'
import path from 'path'
import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/settings')
})

test('Auto Backup', async ({ page }) => {
  await expect(
    page.getByLabel('Auto Backup', { exact: true })
  ).not.toBeChecked()
  await expect(
    page.getByText('DaysEvery', { exact: true }).locator('input')
  ).toBeDisabled()

  await page.getByLabel('Auto Backup', { exact: true }).click()
  await expect(page.getByLabel('Auto Backup', { exact: true })).toBeChecked()
  await expect(
    page.getByText('DaysEvery', { exact: true }).locator('input')
  ).not.toBeDisabled()

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.autoBackup === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Auto Backup', { exact: true }).click()
  await expect(
    page.getByLabel('Auto Backup', { exact: true })
  ).not.toBeChecked()
  await expect(
    page.getByText('DaysEvery', { exact: true }).locator('input')
  ).toBeDisabled()
  await responsePromise
})

test('Auto Backup Every Days input', async ({ page }) => {
  await page.getByLabel('Auto Backup', { exact: true }).click()

  const input = page.getByText('DaysEvery', { exact: true }).locator('input')
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '1')

  await input.click()
  await input.fill('0')
  await input.blur()
  await expect(input).toHaveValue('1')

  await input.click()
  await input.fill('1234567890')
  await input.blur()
  await expect(input).toHaveValue('1234567890')

  await input.click()
  await input.fill('-1')
  await input.blur()
  await expect(input).toHaveValue('1')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.autoBackup === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Auto Backup', { exact: true }).click()
  await responsePromise
})

test('Auto Clean Backup', async ({ page }) => {
  await expect(page.getByLabel('Auto Clean', { exact: true })).not.toBeChecked()
  await expect(
    page.getByText('DaysKeep Last', { exact: true }).locator('input')
  ).toBeDisabled()
  await expect(
    page.getByText('WeeksKeep Last', { exact: true }).locator('input')
  ).toBeDisabled()
  await expect(
    page.getByText('MonthsKeep Last', { exact: true }).locator('input')
  ).toBeDisabled()

  await page.getByLabel('Auto Clean', { exact: true }).scrollIntoViewIfNeeded()
  await page.getByLabel('Auto Clean', { exact: true }).hover()
  await expect(
    page.getByRole('tooltip', { name: /^If enabled, backups/ })
  ).toBeVisible()
  await expect(
    page.getByRole('tooltip', { name: /^If enabled, backups/ })
  ).toHaveText(
    'If enabled, backups will be automatically cleaned up. This algorithm will keep the configured amount of backups for each period.'
  )

  let responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.autoCleanBackup === true &&
      res.status() === 204
    )
  })
  await page.getByLabel('Auto Clean', { exact: true }).click()
  await expect(page.getByLabel('Auto Clean', { exact: true })).toBeChecked()
  await expect(
    page.getByText('DaysKeep Last', { exact: true }).locator('input')
  ).not.toBeDisabled()
  await expect(
    page.getByText('WeeksKeep Last', { exact: true }).locator('input')
  ).not.toBeDisabled()
  await expect(
    page.getByText('MonthsKeep Last', { exact: true }).locator('input')
  ).not.toBeDisabled()

  await responsePromise
  responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.autoCleanBackup === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Auto Clean', { exact: true }).click()
  await expect(page.getByLabel('Auto Clean', { exact: true })).not.toBeChecked()
  await expect(
    page.getByText('DaysKeep Last', { exact: true }).locator('input')
  ).toBeDisabled()
  await expect(
    page.getByText('WeeksKeep Last', { exact: true }).locator('input')
  ).toBeDisabled()
  await expect(
    page.getByText('MonthsKeep Last', { exact: true }).locator('input')
  ).toBeDisabled()
  await responsePromise
})

test('Auto Backup Days Keep Last input', async ({ page }) => {
  await page.getByLabel('Auto Clean', { exact: true }).click()

  const input = page
    .getByText('DaysKeep Last', { exact: true })
    .locator('input')
  await expect(input).not.toBeDisabled()
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '1')

  await input.click()
  await input.fill('0')
  await input.blur()
  await expect(input).toHaveValue('1')

  await input.click()
  await input.fill('1234567890')
  await input.blur()
  await expect(input).toHaveValue('1234567890')

  await input.click()
  await input.fill('-1')
  await input.blur()
  await expect(input).toHaveValue('1')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.autoCleanBackup === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Auto Clean', { exact: true }).click()
  await responsePromise
})

test('Auto Backup Weeks Keep Last input', async ({ page }) => {
  await page.getByLabel('Auto Clean', { exact: true }).click()

  const input = page
    .getByText('WeeksKeep Last', { exact: true })
    .locator('input')
  await expect(input).not.toBeDisabled()
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '1')

  await input.click()
  await input.fill('0')
  await input.blur()
  await expect(input).toHaveValue('1')

  await input.click()
  await input.fill('1234567890')
  await input.blur()
  await expect(input).toHaveValue('1234567890')

  await input.click()
  await input.fill('-1')
  await input.blur()
  await expect(input).toHaveValue('1')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.autoCleanBackup === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Auto Clean', { exact: true }).click()
  await responsePromise
})

test('Auto Backup Months Keep Last input', async ({ page }) => {
  await page.getByLabel('Auto Clean', { exact: true }).click()

  const input = page
    .getByText('MonthsKeep Last', { exact: true })
    .locator('input')
  await expect(input).not.toBeDisabled()
  await expect(input).toHaveAttribute('type', 'number')
  await expect(input).toHaveAttribute('min', '1')

  await input.click()
  await input.fill('0')
  await input.blur()
  await expect(input).toHaveValue('1')

  await input.click()
  await input.fill('1234567890')
  await input.blur()
  await expect(input).toHaveValue('1234567890')

  await input.click()
  await input.fill('-1')
  await input.blur()
  await expect(input).toHaveValue('1')

  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.autoCleanBackup === false &&
      res.status() === 204
    )
  })
  await page.getByLabel('Auto Clean', { exact: true }).click()
  await responsePromise
})

test('Restore Backup', async ({ page }) => {
  // test restore dialog elements
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Restore Backup', exact: true })
  ).toBeEnabled()
  await page
    .getByRole('button', { name: 'Restore Backup', exact: true })
    .click()

  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(
    'Restore Backup'
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'Choose a backup to restore from:'
  )
  await page
    .getByText('10/18/2024, 12:00:00 AM (224 KB)', { exact: true })
    .click()
  await page
    .getByRole('option', {
      name: '4/18/2024, 12:00:00 AM (224 KB)',
      exact: true
    })
    .click()

  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()

  // test restore feature
  const responsePromise = page.waitForResponse((res) => {
    const request = res.request()
    return (
      new URL(request.url()).pathname === '/api/settings/general' &&
      request.method() === 'PATCH' &&
      request.postDataJSON()?.autoBackup === true &&
      res.status() === 204
    )
  })
  await page.getByLabel('Auto Backup', { exact: true }).click()
  await responsePromise
  await page
    .getByRole('button', { name: 'Restore Backup', exact: true })
    .click()

  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Restore', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByRole('alert')).toHaveText('Restore success!')
  await page.getByRole('alert').getByRole('button').click()
  await expect(page.getByRole('alert')).not.toBeVisible()
  await expect(
    page.getByLabel('Auto Backup', { exact: true })
  ).not.toBeChecked()
})

test('Clean Backups', async ({ page }) => {
  // test clean dialog elements with auto clean enabled
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.getByLabel('Auto Clean', { exact: true }).click()
  await expect(page.getByLabel('Auto Clean', { exact: true })).toBeChecked()
  await page
    .getByText('DaysKeep Last', { exact: true })
    .locator('input')
    .fill('10')
  await page
    .getByText('WeeksKeep Last', { exact: true })
    .locator('input')
    .fill('7')
  await page
    .getByText('MonthsKeep Last', { exact: true })
    .locator('input')
    .fill('4')

  await page.getByRole('button', { name: 'Clean Backups', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(
    'Clean backups'
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'You are about to clean your backups. Backups will be retained according to your Auto Clean configuration. The last 10 daily, last 7 weekly and last 4 monthly backups will be kept.'
  )

  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()

  // test clean feature with auto clean enabled
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(
    page
      .locator('div')
      .filter({ hasText: 'Latest: 10/18/2024, 12:00:00 AM (224 KB)' })
      .nth(1)
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clean Backups', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByRole('alert')).toHaveText('Clean success!')
  await page.getByRole('alert').getByRole('button').click()
  await expect(page.getByRole('alert')).not.toBeVisible()
  await expect(
    page.locator('div').filter({ hasText: 'Backups: 18' }).nth(1)
  ).toBeVisible()
  await expect(
    page
      .locator('div')
      .filter({ hasText: 'Latest: 10/18/2024, 12:00:00 AM (224 KB)' })
      .nth(1)
  ).toBeVisible()

  // test clean dialog elements
  await page.getByLabel('Auto Clean', { exact: true }).click()
  await expect(page.getByLabel('Auto Clean', { exact: true })).not.toBeChecked()

  await page.getByRole('button', { name: 'Clean Backups', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(
    'Clean backups'
  )
  await expect(page.getByRole('dialog').getByRole('paragraph')).toHaveText(
    'You are about to clean your backups. How many of the most recent backups would you like to retain?'
  )

  await expect(
    page.getByRole('spinbutton', { name: 'Keep Last' })
  ).toHaveAttribute('type', 'number')
  await expect(
    page.getByRole('spinbutton', { name: 'Keep Last' })
  ).toHaveAttribute('min', '1')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()

  // test clean feature
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(
    page
      .locator('div')
      .filter({ hasText: 'Latest: 10/18/2024, 12:00:00 AM (224 KB)' })
      .nth(1)
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clean Backups', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('spinbutton', { name: 'Keep Last' }).fill('3')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByRole('alert')).toHaveText('Clean success!')
  await page.getByRole('alert').getByRole('button').click()
  await expect(page.getByRole('alert')).not.toBeVisible()
  await expect(
    page.locator('div').filter({ hasText: 'Backups: 3' }).nth(1)
  ).toBeVisible()
  await expect(
    page
      .locator('div')
      .filter({ hasText: 'Latest: 10/18/2024, 12:00:00 AM (224 KB)' })
      .nth(1)
  ).toBeVisible()

  // test zero backups
  const dir = path.resolve(__dirname, '..', '..', '..', 'data', 'backups')
  const files = await fs.promises.readdir(dir)
  for (const file of files) {
    await fs.promises.unlink(path.join(dir, file))
  }

  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Backup Data', exact: true })
  ).not.toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Restore Backup', exact: true })
  ).toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Clean Backups', exact: true })
  ).toBeDisabled()

  await expect(
    page.locator('div').filter({ hasText: 'Backups: --' }).nth(1)
  ).toBeVisible()
  await expect(
    page.locator('div').filter({ hasText: 'Latest: --' }).nth(1)
  ).toBeVisible()
})

test('Backup Data', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'Backup Data', exact: true })
  ).toBeEnabled()
  await expect(
    page.locator('div').filter({ hasText: 'Backups: --' }).nth(1)
  ).toBeVisible()
  await expect(
    page.locator('div').filter({ hasText: 'Latest: --' }).nth(1)
  ).toBeVisible()

  await page.getByRole('button', { name: 'Backup Data', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('Backup success!')
  await page.getByRole('alert').getByRole('button').click()
  await expect(page.getByRole('alert')).not.toBeVisible()
  await expect(
    page.locator('div').filter({ hasText: 'Backups: 1' }).nth(1)
  ).toBeVisible()
  const now = new Date().toLocaleString().split(',')[0]
  const latestText = new RegExp(
    `^Latest: ${now}, ([0-9]|1[0-2]):[0-5][0-9]:[0-5][0-9] (A|P)M \\(\\d+ KB\\)$`
  )
  await expect(
    page.locator('div').filter({ hasText: latestText }).nth(1)
  ).toBeVisible()
})
