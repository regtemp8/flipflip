import { Page, Locator } from "@playwright/test";

export async function changeSlider(page: Page, thumb: Locator, slider: Locator, targetPercentage: number) {
    const thumbBoundingBox = await thumb.boundingBox();
    const sliderBoundingBox = await slider.boundingBox();

    if (thumbBoundingBox === null) {
        throw new Error('Thumb bounding box is null')
    }
    if (sliderBoundingBox === null) {
        throw new Error('Slider bounding box is null')
    }

    // Start from the middle of the slider's thumb
    const startPoint = {
        x: Math.round(thumbBoundingBox.x + thumbBoundingBox.width / 2),
        y: Math.round(thumbBoundingBox.y + thumbBoundingBox.height / 2),
    };

    // Slide it to some endpoint determined by the target percentage
    const endPoint = {
        x: Math.round(sliderBoundingBox.x + sliderBoundingBox.width * targetPercentage),
        y: Math.round(thumbBoundingBox.y + thumbBoundingBox.height / 2),
    };

    await page.mouse.move(startPoint.x, startPoint.y);
    await page.mouse.down();
    await page.mouse.move(endPoint.x, endPoint.y);
    await page.mouse.up();
}

export async function testSliderValue(thumb: Locator, slider: Locator, expectedPercentage: number) {
    const thumbBoundingBox = await thumb.boundingBox();
    const sliderBoundingBox = await slider.boundingBox();

    if (thumbBoundingBox === null) {
        throw new Error('Thumb bounding box is null')
    }
    if (sliderBoundingBox === null) {
        throw new Error('Slider bounding box is null')
    }

    const currentX = Math.round(thumbBoundingBox.x + thumbBoundingBox.width / 2)
    const expectedX = Math.round(sliderBoundingBox.x + sliderBoundingBox.width * expectedPercentage)
    return currentX === expectedX
}