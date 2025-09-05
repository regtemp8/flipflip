import { Page, Locator, expect } from '@playwright/test'

export type Color = {
  name: string
  hex: string
  rgb: string
}

export const colors: Color[] = [
  { name: 'red', hex: '#f44336', rgb: '244, 67, 54' },
  { name: 'pink', hex: '#e91e63', rgb: '233, 30, 99' },
  { name: 'purple', hex: '#9c27b0', rgb: '156, 39, 176' },
  { name: 'deep purple', hex: '#673ab7', rgb: '103, 58, 183' },
  { name: 'indigo', hex: '#3f51b5', rgb: '63, 81, 181' },
  { name: 'blue', hex: '#2196f3', rgb: '33, 150, 243' },
  { name: 'light blue', hex: '#03a9f4', rgb: '3, 169, 244' },
  { name: 'cyan', hex: '#00bcd4', rgb: '0, 188, 212' },
  { name: 'teal', hex: '#009688', rgb: '0, 150, 136' },
  { name: 'green', hex: '#4caf50', rgb: '76, 175, 80' },
  { name: 'light green', hex: '#8bc34a', rgb: '139, 195, 74' },
  { name: 'lime', hex: '#cddc39', rgb: '205, 220, 57' },
  { name: 'yellow', hex: '#ffeb3b', rgb: '255, 235, 59' },
  { name: 'amber', hex: '#ffc107', rgb: '255, 193, 7' },
  { name: 'orange', hex: '#ff9800', rgb: '255, 152, 0' },
  { name: 'deep orange', hex: '#ff5722', rgb: '255, 87, 34' },
  { name: 'brown', hex: '#795548', rgb: '121, 85, 72' },
  { name: 'grey', hex: '#9e9e9e', rgb: '158, 158, 158' },
  { name: 'blue grey', hex: '#607d8b', rgb: '96, 125, 139' },
  { name: 'white', hex: '#fff', rgb: '255, 255, 255' },
  { name: 'black', hex: '#000', rgb: '0, 0, 0' }
]

export async function changeSlider(
  page: Page,
  thumb: Locator,
  slider: Locator,
  targetPercentage: number
) {
  const thumbBoundingBox = await thumb.boundingBox()
  const sliderBoundingBox = await slider.boundingBox()

  if (thumbBoundingBox === null) {
    throw new Error('Thumb bounding box is null')
  }
  if (sliderBoundingBox === null) {
    throw new Error('Slider bounding box is null')
  }

  // Start from the middle of the slider's thumb
  const startPoint = {
    x: Math.round(thumbBoundingBox.x + thumbBoundingBox.width / 2),
    y: Math.round(thumbBoundingBox.y + thumbBoundingBox.height / 2)
  }

  // Slide it to some endpoint determined by the target percentage
  const endPoint = {
    x: Math.round(
      sliderBoundingBox.x + sliderBoundingBox.width * targetPercentage
    ),
    y: Math.round(thumbBoundingBox.y + thumbBoundingBox.height / 2)
  }

  await page.mouse.move(startPoint.x, startPoint.y)
  await page.mouse.down()
  await page.mouse.move(endPoint.x, endPoint.y)
  await page.mouse.up()
}

export async function testSliderValue(
  thumb: Locator,
  slider: Locator,
  expectedPercentage: number
) {
  const thumbBoundingBox = await thumb.boundingBox()
  const sliderBoundingBox = await slider.boundingBox()

  if (thumbBoundingBox === null) {
    throw new Error('Thumb bounding box is null')
  }
  if (sliderBoundingBox === null) {
    throw new Error('Slider bounding box is null')
  }

  const currentX = Math.round(thumbBoundingBox.x + thumbBoundingBox.width / 2)
  const expectedX = Math.round(
    sliderBoundingBox.x + sliderBoundingBox.width * expectedPercentage
  )
  return currentX === expectedX
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export async function dragListItem(
  page: Page,
  start: BoundingBox,
  end: BoundingBox
) {
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down({ button: 'left' })
  for (let i = 0; i < 2; i++) {
    // do 2 mouse moves to trigger dragover event
    await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, {
      steps: 20
    })
  }
  await page.mouse.up({ button: 'left' })
}

export async function dragCard(
  page: Page,
  selector: string,
  startIndex: number,
  endIndex: number
) {
  const start = page.locator(selector).nth(startIndex)
  const startBox = await start.getByRole('button').boundingBox()
  const end = page.locator(selector).nth(endIndex)
  const endBox = await end.getByRole('button').boundingBox()
  if (startBox == null || endBox == null) {
    throw new Error('Failed to get bounding box')
  }

  await page.mouse.move(
    startBox.x + startBox.width / 2,
    startBox.y + startBox.height / 2
  )
  await page.mouse.down({ button: 'left' })
  const chosenCard = page.locator(
    `${selector}:nth-child(${startIndex + 1}).sortable-chosen`
  )
  await expect(chosenCard).toBeVisible()
  await expect(chosenCard).toHaveAttribute('draggable', 'true')

  let endX = endBox.x
  if (endIndex > startIndex) {
    endX += endBox.width
  }
  for (let i = 0; i < 2; i++) {
    // do 2 mouse moves to trigger dragover event
    await page.mouse.move(endX, endBox.y + endBox.height / 2, {
      steps: 20
    })
  }

  await page.waitForTimeout(500)
  await page.mouse.up({ button: 'left' })
}
