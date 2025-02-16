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

test('Play audio', async ({ page }) => {
    // play audio
    // check tooltip
    // pause audio
    // check tooltip
    // go forward
    // check tooltip
    // go backward
    // check tooltip
    // seek by clicking 
})

test('Audio volume', async ({ page }) => {
    // slider test
})

test('Audio BPM', async ({ page }) => {
    // input test
    // detect BPM
    // use BPM metadata
})

test('Audio URL', async ({ page }) => {
    // change from .mp3 to .mp4
    // audio stops playing
    // audio duration is 0:00
    // audio position is 0
    // button goes from pause icon to play icon
    // when click play nothing happens

    // change back to .mp3
    // can play audio again
})

test('Audio Speed', async ({ page }) => {
    // slider test
    
    // set slider to max
    // hit play
    // set timeout for a second and check that position has increased by at least 4
})

test('Audio Stop at End', async ({ page }) => {
    // check Stop at End hides Next Scene at End and Tick
})

test('Audio Next Scene at End', async ({ page }) => {
    // check Next Scene at End hides Stop at End and Tick
})

test('Audio Tick', async ({ page }) => {
    // check Tick hides Stop at End and Next Scene at End
    // and shows timing options

    // timing tests

    // test tick effect on playback
    // random: between min and max (min: 1 and max: 2)
    // wave: min 3 and max 4
    // constant: playback goes to 0:05, then resets to 0:00
    // bpm: set bpm to 30, play back goes to 0:02, then resets
    // set bpm multiplier to 1/2, playback goes to 0:04, then resets
    // set bpm multiplier to 2, playback goes to 0:01, then resets
    // with scene: has no effect on playback
})

test('Audio Options Cancel', async ({ page }) => {
    // make changes
    // click cancel
    // verify no changes were made
})

test('Audio Options Save', async ({ page }) => {
    // make changes
    // click cancel
    // verify the changes were saved
})