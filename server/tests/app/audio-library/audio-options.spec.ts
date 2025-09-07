import path from 'path'
import { test } from '@playwright/test'

test.beforeAll(async ({ request }) => {
  await request.get('http://localhost:5050/authenticated')
  const audio = path.resolve(
    __dirname,
    'tests',
    'config',
    'audio',
    'Aftertune, Ultimate Mix - Smile.mp3'
  )
  const response = await request.post('http://localhost:5050/api/audios', {
    data: [audio]
  })
  if (!response.ok) {
    throw new Error('Failed to create caption script')
  }
})

test.afterAll(async ({ request }) => {
  await request.delete('http://localhost:5050/api/audios/1')
})

test.beforeEach(async ({ page }) => {
  await page.goto('/audio-library')
})

test.fixme('Play audio', async () => {
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

test.fixme('Audio volume', async () => {
  // slider test
})

test.fixme('Audio BPM', async () => {
  // input test
  // detect BPM
  // use BPM metadata
})

test.fixme('Audio URL', async () => {
  /*
    update url:
      empty url:
        show error message: 'Invalid audio path: ""'
      duplicate url:
        show error message: 'Duplicate audio URL: $URL'
      duplicate path:
        show error message: 'Duplicate audio path: $URL'
    */
  // change from .mp3 to .mp4
  // audio stops playing
  // audio duration is 0:00
  // audio position is 0
  // button goes from pause icon to play icon
  // when click play nothing happens
  // change back to .mp3
  // can play audio again
})

test.fixme('Audio Speed', async () => {
  // slider test
  // set slider to max
  // hit play
  // set timeout for a second and check that position has increased by at least 4
})

test.fixme('Audio Stop at End', async () => {
  // check Stop at End hides Next Scene at End and Tick
})

test.fixme('Audio Next Scene at End', async () => {
  // check Next Scene at End hides Stop at End and Tick
})

test.fixme('Audio Tick', async () => {
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

test.fixme('Audio Options Cancel', async () => {
  // make changes
  // click cancel
  // verify no changes were made
})

test.fixme('Audio Options Save', async () => {
  // make changes
  // click cancel
  // verify the changes were saved
})
