import { test, expect } from '@playwright/test'

test.use({ storageState: 'server/tests/data/session.json' })
test.beforeEach(async ({ page }) => {
  await page.goto('/tags')
})

test('Title', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'Tag Manager', exact: true })
  ).toBeVisible()
})

test('Add Tag', async ({ page }) => {
  await expect(page.getByTestId('DeleteSweepIcon')).not.toBeVisible()
  await page.getByTestId('AddIcon').click()
  await expect(
    page.getByRole('heading', { name: 'Add Tag', exact: true })
  ).toBeVisible()
  await expect(page.getByLabel('Name *', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Tag Phrases', { exact: true })).toBeVisible()
  await expect(
    page.getByText(
      'These are used in place of $TAG_PHRASE for Caption scripts. One per line.'
    )
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'OK', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'OK', exact: true })
  ).toBeDisabled()
  await expect(page.getByTestId('DeleteIcon')).not.toBeVisible()

  await page.getByLabel('Name *', { exact: true }).fill('pets')
  await page
    .getByLabel('Tag Phrases', { exact: true })
    .fill('dog\ncat\nhamster')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Add Tag', exact: true })
  ).not.toBeVisible()

  await page.getByTestId('AddIcon').click()
  await expect(
    page.getByRole('heading', { name: 'Add Tag', exact: true })
  ).toBeVisible()
  await expect(page.getByLabel('Name *')).toHaveValue('')
  await expect(page.getByLabel('Tag Phrases')).toHaveValue('')
  await page.getByLabel('Name *').fill('pets')
  await page.getByLabel('Tag Phrases').fill('dog\ncat\nhamster')
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'pets', exact: true })
  ).toBeVisible()
  await expect(page.getByTestId('DeleteSweepIcon')).toBeVisible()
})

test('Edit Tag', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'pets', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'pets', exact: true }).click()

  await expect(
    page.getByRole('heading', { name: 'Edit Tag', exact: true })
  ).toBeVisible()
  await expect(page.getByLabel('Name *', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Tag Phrases', { exact: true })).toBeVisible()
  await expect(
    page.getByText(
      'These are used in place of $TAG_PHRASE for Caption scripts. One per line.'
    )
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'OK', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'OK', exact: true })
  ).not.toBeDisabled()
  await expect(page.getByTestId('DeleteIcon')).toBeVisible()
  await expect(page.getByLabel('Name *')).toHaveValue('pets')
  await expect(page.getByLabel('Tag Phrases')).toHaveValue('dog\ncat\nhamster')

  await page.getByLabel('Name *').fill('animals')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Edit Tag', exact: true })
  ).not.toBeVisible()

  await page.getByRole('button', { name: 'pets', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Edit Tag', exact: true })
  ).toBeVisible()
  await page.getByLabel('Name *').fill('animals')
  await page
    .getByLabel('Tag Phrases', { exact: true })
    .fill('tiger\nzebra\neagle')
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Edit Tag', exact: true })
  ).not.toBeVisible()
  await expect(
    page.getByRole('button', { name: 'animals', exact: true })
  ).toBeVisible()

  await expect(page.getByTestId('DeleteSweepIcon')).toBeVisible()
  await expect(page.getByTestId('SortIcon')).not.toBeVisible()
  await page.getByTestId('AddIcon').click()
  await expect(
    page.getByRole('heading', { name: 'Add Tag', exact: true })
  ).toBeVisible()
  await expect(page.getByLabel('Name *')).toHaveValue('')
  await expect(page.getByLabel('Tag Phrases')).toHaveValue('')
  await page.getByLabel('Name *').fill('car')
  await page.getByLabel('Tag Phrases').fill('bmw\nferrari\nhonda')
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'car', exact: true })
  ).toBeVisible()
  await expect(page.getByTestId('DeleteSweepIcon')).toBeVisible()
  await expect(page.getByTestId('SortIcon')).toBeVisible()

  await page.getByRole('button', { name: 'animals', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Edit Tag', exact: true })
  ).toBeVisible()
  await expect(page.getByLabel('Name *')).toHaveValue('animals')
  await expect(page.getByLabel('Tag Phrases')).toHaveValue(
    'tiger\nzebra\neagle'
  )
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
})

test('Delete Tag', async ({ page }) => {
  await expect(page.getByTestId('DeleteSweepIcon')).toBeVisible()
  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'animals', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'animals', exact: true }).click()

  await expect(page.getByTestId('DeleteIcon')).toBeVisible()
  await page.getByTestId('DeleteIcon').click()
  await expect(
    page.getByRole('heading', { name: 'Edit Tag', exact: true })
  ).not.toBeVisible()

  await expect(page.getByTestId('DeleteSweepIcon')).toBeVisible()
  await expect(page.getByTestId('SortIcon')).not.toBeVisible()
  await expect(
    page.getByRole('button', { name: 'animals', exact: true })
  ).not.toBeVisible()
  await expect(
    page.getByRole('button', { name: 'car', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'car', exact: true }).click()

  await expect(page.getByTestId('DeleteIcon')).toBeVisible()
  await page.getByTestId('DeleteIcon').click()
  await expect(
    page.getByRole('heading', { name: 'Edit Tag', exact: true })
  ).not.toBeVisible()
  await expect(
    page.getByRole('button', { name: 'animals', exact: true })
  ).not.toBeVisible()
  await expect(
    page.getByRole('button', { name: 'car', exact: true })
  ).not.toBeVisible()
  await expect(page.getByTestId('DeleteSweepIcon')).not.toBeVisible()
  await expect(page.getByTestId('SortIcon')).not.toBeVisible()
})

test('Sort By Title', async ({ page }) => {
  await page.getByTestId('AddIcon').click()
  await expect(
    page.getByRole('heading', { name: 'Add Tag', exact: true })
  ).toBeVisible()
  await page.getByLabel('Name *').fill('car')
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'car', exact: true })
  ).toBeVisible()

  await page.getByTestId('AddIcon').click()
  await expect(
    page.getByRole('heading', { name: 'Add Tag', exact: true })
  ).toBeVisible()
  await page.getByLabel('Name *').fill('pets')
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'pets', exact: true })
  ).toBeVisible()

  await page.getByTestId('AddIcon').click()
  await expect(
    page.getByRole('heading', { name: 'Add Tag', exact: true })
  ).toBeVisible()
  await page.getByLabel('Name *').fill('dogs')
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'dogs', exact: true })
  ).toBeVisible()
  await expect(page.locator('main').getByRole('button').nth(0)).toHaveText(
    'car'
  )
  await expect(page.locator('main').getByRole('button').nth(1)).toHaveText(
    'pets'
  )
  await expect(page.locator('main').getByRole('button').nth(2)).toHaveText(
    'dogs'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('li')).toHaveCount(2)
  await expect(page.locator('li').first()).toHaveText('By Title')
  await expect(
    page.locator('li').first().getByTestId('ArrowUpwardIcon')
  ).toBeVisible()
  await expect(
    page.locator('li').first().getByTestId('ArrowDownwardIcon')
  ).toBeVisible()

  await page.locator('li').first().getByTestId('ArrowDownwardIcon').click()
  await page.locator('.MuiBackdrop-root').click()
  await expect(page.locator('li').first()).not.toBeVisible()
  await expect(page.locator('main').getByRole('button').nth(0)).toHaveText(
    'pets'
  )
  await expect(page.locator('main').getByRole('button').nth(1)).toHaveText(
    'dogs'
  )
  await expect(page.locator('main').getByRole('button').nth(2)).toHaveText(
    'car'
  )

  await page.getByTestId('SortIcon').click()
  await page.locator('li').first().getByTestId('ArrowUpwardIcon').click()
  await page.locator('.MuiBackdrop-root').click()
  await expect(page.locator('main').getByRole('button').nth(0)).toHaveText(
    'car'
  )
  await expect(page.locator('main').getByRole('button').nth(1)).toHaveText(
    'dogs'
  )
  await expect(page.locator('main').getByRole('button').nth(2)).toHaveText(
    'pets'
  )
})

test('Sort By Date', async ({ page }) => {
  await expect(page.locator('main').getByRole('button').nth(0)).toHaveText(
    'car'
  )
  await expect(page.locator('main').getByRole('button').nth(1)).toHaveText(
    'dogs'
  )
  await expect(page.locator('main').getByRole('button').nth(2)).toHaveText(
    'pets'
  )

  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('SortIcon').click()
  await expect(page.locator('li')).toHaveCount(2)
  await expect(page.locator('li').nth(1)).toHaveText('By Date')
  await expect(
    page.locator('li').nth(1).getByTestId('ArrowUpwardIcon')
  ).toBeVisible()
  await expect(
    page.locator('li').nth(1).getByTestId('ArrowDownwardIcon')
  ).toBeVisible()

  await page.locator('li').nth(1).getByTestId('ArrowDownwardIcon').click()
  await page.locator('.MuiBackdrop-root').click()
  await expect(page.locator('li').nth(1)).not.toBeVisible()
  await expect(page.locator('main').getByRole('button').nth(0)).toHaveText(
    'dogs'
  )
  await expect(page.locator('main').getByRole('button').nth(1)).toHaveText(
    'pets'
  )
  await expect(page.locator('main').getByRole('button').nth(2)).toHaveText(
    'car'
  )

  await page.getByTestId('SortIcon').click()
  await page.locator('li').nth(1).getByTestId('ArrowUpwardIcon').click()
  await page.locator('.MuiBackdrop-root').click()
  await expect(page.locator('main').getByRole('button').nth(0)).toHaveText(
    'car'
  )
  await expect(page.locator('main').getByRole('button').nth(1)).toHaveText(
    'pets'
  )
  await expect(page.locator('main').getByRole('button').nth(2)).toHaveText(
    'dogs'
  )
})

test('Move Tag', async ({ page }) => {
  await expect(page.locator('main').getByRole('button').nth(0)).toHaveText(
    'car'
  )
  await expect(page.locator('main').getByRole('button').nth(1)).toHaveText(
    'pets'
  )
  await expect(page.locator('main').getByRole('button').nth(2)).toHaveText(
    'dogs'
  )

  let box2 = await page
    .locator('main')
    .getByRole('button', { name: 'dogs', exact: true })
    .boundingBox()
  if (box2 == null) {
    throw new Error('Failed to get button bounding box')
  }

  await page
    .locator('main')
    .getByRole('button')
    .nth(0)
    .dragTo(
      page.locator('main').getByRole('button', { name: 'dogs', exact: true }),
      {
        targetPosition: { x: box2.width, y: 0 }
      }
    )
  await expect(page.locator('main').getByRole('button').nth(0)).toHaveText(
    'pets'
  )
  await expect(page.locator('main').getByRole('button').nth(1)).toHaveText(
    'dogs'
  )
  await expect(page.locator('main').getByRole('button').nth(2)).toHaveText(
    'car'
  )

  await page
    .locator('main')
    .getByRole('button')
    .nth(1)
    .dragTo(page.locator('main').getByRole('button').nth(0))
  await expect(page.locator('main').getByRole('button').nth(0)).toHaveText(
    'dogs'
  )
  await expect(page.locator('main').getByRole('button').nth(1)).toHaveText(
    'pets'
  )
  await expect(page.locator('main').getByRole('button').nth(2)).toHaveText(
    'car'
  )

  box2 = await page
    .locator('main')
    .getByRole('button', { name: 'car', exact: true })
    .boundingBox()
  if (box2 == null) {
    throw new Error('Failed to get button bounding box')
  }

  await page
    .locator('main')
    .getByRole('button')
    .nth(1)
    .dragTo(
      page.locator('main').getByRole('button', { name: 'car', exact: true }),
      {
        targetPosition: { x: box2.width, y: 0 }
      }
    )
  await expect(page.locator('main').getByRole('button').nth(0)).toHaveText(
    'dogs'
  )
  await expect(page.locator('main').getByRole('button').nth(1)).toHaveText(
    'car'
  )
  await expect(page.locator('main').getByRole('button').nth(2)).toHaveText(
    'pets'
  )
})

test('Remove All Tags', async ({ page }) => {
  await expect(page.getByTestId('DeleteSweepIcon')).toBeVisible()
  await page.getByTestId('DeleteSweepIcon').hover()
  await expect(page.getByRole('tooltip')).toHaveText('Remove All Tags')

  await expect(
    page.getByRole('button', { name: 'car', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'pets', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'dogs', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Delete Tags', exact: true })
  ).not.toBeVisible()
  await page.getByTestId('DeleteSweepIcon').click()
  await expect(
    page.getByRole('heading', { name: 'Delete Tags', exact: true })
  ).toBeVisible()
  await expect(page.getByRole('paragraph')).toHaveText(
    'Are you sure you want to remove all tags? This will untag all sources, clips, audios and caption scripts as well.'
  )
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'car', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'pets', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'dogs', exact: true })
  ).toBeVisible()

  await expect(page.getByTestId('DeleteSweepIcon')).toBeVisible()
  await expect(page.getByTestId('SortIcon')).toBeVisible()
  await page.getByTestId('DeleteSweepIcon').click()
  await expect(
    page.getByRole('heading', { name: 'Delete Tags', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'car', exact: true })
  ).not.toBeVisible()
  await expect(
    page.getByRole('button', { name: 'pets', exact: true })
  ).not.toBeVisible()
  await expect(
    page.getByRole('button', { name: 'dogs', exact: true })
  ).not.toBeVisible()
  await expect(page.getByTestId('DeleteSweepIcon')).not.toBeVisible()
  await expect(page.getByTestId('SortIcon')).not.toBeVisible()
})

// TODO delete tag when it is connected to another entity (audio, script, ignored tag, source)
