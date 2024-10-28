import { test, expect } from '@playwright/test'
import {VTF, HTF} from 'flipflip-common'
import {changeSlider, testSliderValue} from '../utils'

test.use({ storageState: 'server/tests/session.json' })
test.beforeEach(async ({ page }) => {
  await page.goto('/settings/scene-effects')
})

test('Zoom effect', async ({ page }) => {
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await expect(page.getByText('Randomize Zoom', { exact: true })).not.toBeVisible()
    await expect(page.getByText(/^Zoom Start:/)).not.toBeVisible()
    await expect(page.getByText(/^Zoom End:/)).not.toBeVisible()

    await page.getByLabel('Zoom', { exact: true }).check();
    await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
    await expect(page.getByText('Randomize Zoom', { exact: true })).toBeVisible()
    await expect(page.getByText(/^Zoom Start:/)).toBeVisible()
    await expect(page.getByText(/^Zoom End:/)).toBeVisible()

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.zoom === false
            && res.status() === 204
    })
    await page.getByLabel('Zoom', { exact: true }).uncheck();
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await expect(page.getByText('Randomize Zoom', { exact: true })).not.toBeVisible()
    await expect(page.getByText(/^Zoom Start:/)).not.toBeVisible()
    await expect(page.getByText(/^Zoom End:/)).not.toBeVisible()
    await responsePromise
})

test('Zoom start slider', async ({ page }) => {
    await page.getByLabel('Zoom', { exact: true }).check();
    await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()

    await expect(page.getByText('Zoom Start: 1x', {exact: true})).toBeVisible()

    const slider = await page.locator('.MuiSlider-root').first()
    const thumb = await slider.locator('.MuiSlider-thumb')
    
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1x')

    await changeSlider(page, thumb, slider, 0)
    await expect(page.getByText('Zoom Start: 0.1x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')

    await changeSlider(page, thumb, slider, 0.025)
    await expect(page.getByText('Zoom Start: 0.2x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')

    await changeSlider(page, thumb, slider, 1)
    await expect(page.getByText('Zoom Start: 5x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5x')

    await changeSlider(page, thumb, slider, 0.975)
    await expect(page.getByText('Zoom Start: 4.9x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4.9x')

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.zoom === false
            && res.status() === 204
    })
    await page.getByLabel('Zoom', { exact: true }).uncheck();
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await responsePromise
})

test('Zoom end slider', async ({ page }) => {
    await page.getByLabel('Zoom', { exact: true }).check();
    await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()

    await expect(page.getByText('Zoom End: 2x', {exact: true})).toBeVisible()

    const slider = await page.locator('div:nth-child(2) > .MuiSlider-root').first()
    const thumb = await slider.locator('.MuiSlider-thumb')
    
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('2x')

    await changeSlider(page, thumb, slider, 0)
    await expect(page.getByText('Zoom End: 0.1x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')

    await changeSlider(page, thumb, slider, 0.025)
    await expect(page.getByText('Zoom End: 0.2x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')

    await changeSlider(page, thumb, slider, 1)
    await expect(page.getByText('Zoom End: 5x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5x')

    await changeSlider(page, thumb, slider, 0.975)
    await expect(page.getByText('Zoom End: 4.9x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4.9x')

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.zoom === false
            && res.status() === 204
    })
    await page.getByLabel('Zoom', { exact: true }).uncheck();
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await responsePromise
})

test('Randomize zoom effect', async ({ page }) => {
    await page.getByLabel('Zoom', { exact: true }).check();
    await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()

    await expect(page.getByText('Randomize Zoom', { exact: true })).toBeVisible()
    await expect(page.getByText('Randomize Zoom', { exact: true })).not.toBeChecked()

    await page.getByText('Randomize Zoom', { exact: true }).check()
    await expect(page.getByLabel('Randomize Zoom', { exact: true })).toBeChecked()
    await expect(page.getByText(/^Zoom Start:/)).not.toBeVisible()
    await expect(page.getByText(/^Zoom End:/)).not.toBeVisible()
    await expect(page.getByText(/^Zoom Start Min:/)).toBeVisible()
    await expect(page.getByText(/^Zoom Start Max:/)).toBeVisible()
    await expect(page.getByText(/^Zoom End Min:/)).toBeVisible()
    await expect(page.getByText(/^Zoom End Max:/)).toBeVisible()

    await page.getByText('Randomize Zoom', { exact: true }).uncheck()
    await expect(page.getByLabel('Randomize Zoom', { exact: true })).not.toBeChecked()
    await expect(page.getByText(/^Zoom Start:/)).toBeVisible()
    await expect(page.getByText(/^Zoom End:/)).toBeVisible()
    await expect(page.getByText(/^Zoom Start Min:/)).not.toBeVisible()
    await expect(page.getByText(/^Zoom Start Max:/)).not.toBeVisible()
    await expect(page.getByText(/^Zoom End Min:/)).not.toBeVisible()
    await expect(page.getByText(/^Zoom End Max:/)).not.toBeVisible()

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.zoom === false
            && res.status() === 204
    })
    await page.getByLabel('Zoom', { exact: true }).uncheck();
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await responsePromise
})

test('Zoom start min slider', async ({ page }) => {
    await page.getByLabel('Zoom', { exact: true }).check();
    await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
    await page.getByText('Randomize Zoom', { exact: true }).check()
    await expect(page.getByLabel('Randomize Zoom', { exact: true })).toBeChecked()

    const container = await page.locator('main .MuiCollapse-entered div:nth-child(1)')
    await expect(container.getByText('Zoom Start Min: 0.5x', {exact: true})).toBeVisible()

    const slider = await container.locator('.MuiSlider-root').first()
    const thumb = await slider.locator('.MuiSlider-thumb')
    
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.5x')

    await changeSlider(page, thumb, slider, 0)
    await expect(container.getByText('Zoom Start Min: 0.1x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')

    await changeSlider(page, thumb, slider, 0.025)
    await expect(container.getByText('Zoom Start Min: 0.2x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')

    await changeSlider(page, thumb, slider, 1)
    await expect(container.getByText('Zoom Start Min: 5x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5x')

    await changeSlider(page, thumb, slider, 0.975)
    await expect(container.getByText('Zoom Start Min: 4.9x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4.9x')

    await page.getByText('Randomize Zoom', { exact: true }).uncheck()
    await expect(page.getByLabel('Randomize Zoom', { exact: true })).not.toBeChecked()
    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.zoom === false
            && res.status() === 204
    })
    await page.getByLabel('Zoom', { exact: true }).uncheck();
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await responsePromise
})

test('Zoom start max slider', async ({ page }) => {
    await page.getByLabel('Zoom', { exact: true }).check();
    await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
    await page.getByText('Randomize Zoom', { exact: true }).check()
    await expect(page.getByLabel('Randomize Zoom', { exact: true })).toBeChecked()

    const container = await page.locator('main .MuiCollapse-entered div:nth-child(2)')
    await expect(container.getByText('Zoom Start Max: 1x', {exact: true})).toBeVisible()

    const slider = await container.locator('.MuiSlider-root').first()
    const thumb = await slider.locator('.MuiSlider-thumb')
    
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1x')

    await changeSlider(page, thumb, slider, 0)
    await expect(container.getByText('Zoom Start Max: 0.1x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')

    await changeSlider(page, thumb, slider, 0.025)
    await expect(container.getByText('Zoom Start Max: 0.2x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')

    await changeSlider(page, thumb, slider, 1)
    await expect(container.getByText('Zoom Start Max: 5x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5x')

    await changeSlider(page, thumb, slider, 0.975)
    await expect(container.getByText('Zoom Start Max: 4.9x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4.9x')

    await page.getByText('Randomize Zoom', { exact: true }).uncheck()
    await expect(page.getByLabel('Randomize Zoom', { exact: true })).not.toBeChecked()
    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH'
            && request.postDataJSON()?.zoom === false
            && res.status() === 204
    })
    await page.getByLabel('Zoom', { exact: true }).uncheck();
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await responsePromise
})

test('Zoom end min slider', async ({ page }) => {
    await page.getByLabel('Zoom', { exact: true }).check();
    await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
    await page.getByText('Randomize Zoom', { exact: true }).check()
    await expect(page.getByLabel('Randomize Zoom', { exact: true })).toBeChecked()

    const container = await page.locator('main .MuiCollapse-entered div:nth-child(3)')
    await expect(container.getByText('Zoom End Min: 1.5x', {exact: true})).toBeVisible()

    const slider = await container.locator('.MuiSlider-root').first()
    const thumb = await slider.locator('.MuiSlider-thumb')
    
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1.5x')

    await changeSlider(page, thumb, slider, 0)
    await expect(container.getByText('Zoom End Min: 0.1x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')

    await changeSlider(page, thumb, slider, 0.025)
    await expect(container.getByText('Zoom End Min: 0.2x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')

    await changeSlider(page, thumb, slider, 1)
    await expect(container.getByText('Zoom End Min: 5x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5x')

    await changeSlider(page, thumb, slider, 0.975)
    await expect(container.getByText('Zoom End Min: 4.9x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4.9x')

    await page.getByText('Randomize Zoom', { exact: true }).uncheck()
    await expect(page.getByLabel('Randomize Zoom', { exact: true })).not.toBeChecked()
    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.zoom === false
            && res.status() === 204
    })
    await page.getByLabel('Zoom', { exact: true }).uncheck();
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await responsePromise
})

test('Zoom end max slider', async ({ page }) => {
    await page.getByLabel('Zoom', { exact: true }).check();
    await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
    await page.getByText('Randomize Zoom', { exact: true }).check()
    await expect(page.getByLabel('Randomize Zoom', { exact: true })).toBeChecked()

    const container = await page.locator('main .MuiCollapse-entered div:nth-child(4)')
    await expect(container.getByText('Zoom End Max: 2x', {exact: true})).toBeVisible()

    const slider = await container.locator('.MuiSlider-root').first()
    const thumb = await slider.locator('.MuiSlider-thumb')
    
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('2x')

    await changeSlider(page, thumb, slider, 0)
    await expect(container.getByText('Zoom End Max: 0.1x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')

    await changeSlider(page, thumb, slider, 0.025)
    await expect(container.getByText('Zoom End Max: 0.2x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')

    await changeSlider(page, thumb, slider, 1)
    await expect(container.getByText('Zoom End Max: 5x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5x')

    await changeSlider(page, thumb, slider, 0.975)
    await expect(container.getByText('Zoom End Max: 4.9x', {exact: true})).toBeVisible()
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('4.9x')

    await page.getByText('Randomize Zoom', { exact: true }).uncheck()
    await expect(page.getByLabel('Randomize Zoom', { exact: true })).not.toBeChecked()
    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.zoom === false
            && res.status() === 204
    })
    await page.getByLabel('Zoom', { exact: true }).uncheck();
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await responsePromise
})

test('Move horizontally setting', async ({ page }) => {
    const container = await page.locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Horizontally")')
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).not.toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiSlider-root')).not.toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiTextField-root input')).not.toBeVisible();

    await container.locator('.MuiInputBase-root:has-text("None")').first().click()
    await page.getByRole('option', { name: 'Left', exact: true }).click();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiSlider-root')).toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiTextField-root input')).toBeVisible();

    await container.locator('.MuiInputBase-root:has-text("Left")').first().click()
    await page.getByRole('option', { name: 'Right', exact: true }).click();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiSlider-root')).toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiTextField-root input')).toBeVisible();

    await container.locator('.MuiInputBase-root:has-text("Right")').first().click()
    await page.getByRole('option', { name: 'Left/Right', exact: true }).click();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiSlider-root')).toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiTextField-root input')).toBeVisible();

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.horizTransType === HTF.none
            && res.status() === 204
    })
    await container.locator('.MuiInputBase-root:has-text("Left/Right")').first().click()
    await page.getByRole('option', { name: 'None', exact: true }).click();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).not.toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiSlider-root')).not.toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiTextField-root input')).not.toBeVisible();
    await responsePromise
})

test('Randomize move horizontally setting', async ({ page }) => {
    const container = await page.locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Horizontally")')
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Left', exact: true }).click();

    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).toBeVisible();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).not.toBeChecked();

    await container.getByRole('checkbox', { name: 'Randomize', exact: true }).check();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).toBeChecked();
    await expect(container.getByText(/^Min:/).first()).toBeVisible()
    await expect(container.getByText(/^Max:/).first()).toBeVisible()

    await container.getByRole('checkbox', { name: 'Randomize', exact: true }).uncheck();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).not.toBeChecked();
    await expect(container.getByText(/^Min:/).first()).not.toBeVisible()
    await expect(container.getByText(/^Max:/).first()).not.toBeVisible()

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.horizTransType === HTF.none
            && res.status() === 204
    })
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'None', exact: true }).click();
    await responsePromise
})

test('Move horizontally slider', async ({ page }) => {
    const container = await page.locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Horizontally")')
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Left', exact: true }).click();

    const slider = await container.locator('.MuiCollapse-entered .MuiSlider-root')
    await expect(slider).toBeVisible();

    const thumb = await slider.locator('.MuiSlider-thumb')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('10%')

    const input = await container.locator('.MuiCollapse-entered .MuiTextField-root input')
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'number')
    await expect(input).toHaveAttribute('min', '0')
    await expect(input).toHaveAttribute('max', '100')
    await expect(input).toHaveValue('10')

    await changeSlider(page, thumb, slider, 0)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0%')
    await expect(input).toHaveValue('0')

    await changeSlider(page, thumb, slider, 0.01)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1%')
    await expect(input).toHaveValue('1')

    await changeSlider(page, thumb, slider, 1)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')
    await expect(input).toHaveValue('100')

    await changeSlider(page, thumb, slider, 0.99)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99%')
    await expect(input).toHaveValue('99')

    await input.fill('0')
    await expect(input).toHaveValue('0')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0%')
    expect(await testSliderValue(thumb, slider, 0)).toBe(true)

    await input.fill('5')
    await expect(input).toHaveValue('5')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5%')
    expect(await testSliderValue(thumb, slider, 0.05)).toBe(true)

    await input.fill('95')
    await expect(input).toHaveValue('95')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('95%')
    expect(await testSliderValue(thumb, slider, 0.95)).toBe(true)

    await input.fill('100')
    await expect(input).toHaveValue('100')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')
    expect(await testSliderValue(thumb, slider, 1)).toBe(true)

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.horizTransType === HTF.none
            && res.status() === 204
    })
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'None', exact: true }).click();
    await responsePromise
})

test('Move horizontally min slider', async ({ page }) => {
    const container = await page.locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Horizontally")')
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Left', exact: true }).click();
    await container.getByRole('checkbox', { name: 'Randomize', exact: true }).check();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).toBeChecked();

    const slider = await container.locator('.MuiCollapse-entered div:nth-child(1) > .MuiSlider-root')
    await expect(slider).toBeVisible();

    const thumb = await slider.locator('.MuiSlider-thumb')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5%')

    await changeSlider(page, thumb, slider, 0)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0%')

    await changeSlider(page, thumb, slider, 0.01)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1%')

    await changeSlider(page, thumb, slider, 1)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')

    await changeSlider(page, thumb, slider, 0.99)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99%')

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.horizTransType === HTF.none
            && res.status() === 204
    })
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'None', exact: true }).click();
    await responsePromise
})

test('Move horizontally max slider', async ({ page }) => {
    const container = await page.locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Horizontally")')
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Left', exact: true }).click();
    await container.getByRole('checkbox', { name: 'Randomize', exact: true }).check();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).toBeChecked();

    const slider = await container.locator('.MuiCollapse-entered div:nth-child(2) > .MuiSlider-root')
    await expect(slider).toBeVisible();

    const thumb = await slider.locator('.MuiSlider-thumb')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('10%')

    await changeSlider(page, thumb, slider, 0)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0%')

    await changeSlider(page, thumb, slider, 0.01)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1%')

    await changeSlider(page, thumb, slider, 1)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')

    await changeSlider(page, thumb, slider, 0.99)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99%')

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.horizTransType === HTF.none
            && res.status() === 204
    })
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'None', exact: true }).click();
    await responsePromise
})

test('Move vertically setting', async ({ page }) => {
    const container = await page.locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")')
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).not.toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiSlider-root')).not.toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiTextField-root input')).not.toBeVisible();

    await container.locator('.MuiInputBase-root:has-text("None")').first().click()
    await page.getByRole('option', { name: 'Up', exact: true }).click();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiSlider-root')).toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiTextField-root input')).toBeVisible();

    await container.locator('.MuiInputBase-root:has-text("Up")').first().click()
    await page.getByRole('option', { name: 'Down', exact: true }).click();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiSlider-root')).toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiTextField-root input')).toBeVisible();

    await container.locator('.MuiInputBase-root:has-text("Down")').first().click()
    await page.getByRole('option', { name: 'Up/Down', exact: true }).click();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiSlider-root')).toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiTextField-root input')).toBeVisible();

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.vertTransType === VTF.none
            && res.status() === 204
    })
    await container.locator('.MuiInputBase-root:has-text("Up/Down")').first().click()
    await page.getByRole('option', { name: 'None', exact: true }).click();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).not.toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiSlider-root')).not.toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiTextField-root input')).not.toBeVisible();
    await responsePromise
})

test('Randomize move vertically setting', async ({ page }) => {
    const container = await page.locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")')
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Up', exact: true }).click();

    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).toBeVisible();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).not.toBeChecked();

    await container.getByRole('checkbox', { name: 'Randomize', exact: true }).check();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).toBeChecked();
    await expect(container.getByText(/^Min:/).first()).toBeVisible()
    await expect(container.getByText(/^Max:/).first()).toBeVisible()

    await container.getByRole('checkbox', { name: 'Randomize', exact: true }).uncheck();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).not.toBeChecked();
    await expect(container.getByText(/^Min:/).first()).not.toBeVisible()
    await expect(container.getByText(/^Max:/).first()).not.toBeVisible()

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.vertTransType === VTF.none
            && res.status() === 204
    })
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'None', exact: true }).click();
    await responsePromise
})

test('Move vertically slider', async ({ page }) => {
    const container = await page.locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")')
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Up', exact: true }).click();

    const slider = await container.locator('.MuiCollapse-entered .MuiSlider-root')
    await expect(slider).toBeVisible();

    const thumb = await slider.locator('.MuiSlider-thumb')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('10%')

    const input = await container.locator('.MuiCollapse-entered .MuiTextField-root input')
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'number')
    await expect(input).toHaveAttribute('min', '0')
    await expect(input).toHaveAttribute('max', '100')
    await expect(input).toHaveValue('10')

    await changeSlider(page, thumb, slider, 0)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0%')
    await expect(input).toHaveValue('0')

    await changeSlider(page, thumb, slider, 0.01)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1%')
    await expect(input).toHaveValue('1')

    await changeSlider(page, thumb, slider, 1)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')
    await expect(input).toHaveValue('100')

    await changeSlider(page, thumb, slider, 0.99)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99%')
    await expect(input).toHaveValue('99')

    await input.fill('0')
    await expect(input).toHaveValue('0')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0%')
    expect(await testSliderValue(thumb, slider, 0)).toBe(true)

    await input.fill('5')
    await expect(input).toHaveValue('5')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5%')
    expect(await testSliderValue(thumb, slider, 0.05)).toBe(true)

    await input.fill('95')
    await expect(input).toHaveValue('95')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('95%')
    expect(await testSliderValue(thumb, slider, 0.95)).toBe(true)

    await input.fill('100')
    await expect(input).toHaveValue('100')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')
    expect(await testSliderValue(thumb, slider, 1)).toBe(true)

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.vertTransType === VTF.none
            && res.status() === 204
    })
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'None', exact: true }).click();
    await responsePromise
})

test('Move vertically min slider', async ({ page }) => {
    const container = await page.locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")')
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Up', exact: true }).click();
    await container.getByRole('checkbox', { name: 'Randomize', exact: true }).check();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).toBeChecked();

    const slider = await container.locator('.MuiCollapse-entered div:nth-child(1) > .MuiSlider-root')
    await expect(slider).toBeVisible();

    const thumb = await slider.locator('.MuiSlider-thumb')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('5%')

    await changeSlider(page, thumb, slider, 0)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0%')

    await changeSlider(page, thumb, slider, 0.01)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1%')

    await changeSlider(page, thumb, slider, 1)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')

    await changeSlider(page, thumb, slider, 0.99)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99%')

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.vertTransType === VTF.none
            && res.status() === 204
    })
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'None', exact: true }).click();
    await responsePromise
})

test('Move vertically max slider', async ({ page }) => {
    const container = await page.locator('.MuiGrid2-root > .MuiGrid2-container:has-text("Move Vertically")')
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Up', exact: true }).click();
    await container.getByRole('checkbox', { name: 'Randomize', exact: true }).check();
    await expect(container.getByRole('checkbox', { name: 'Randomize', exact: true })).toBeChecked();

    const slider = await container.locator('.MuiCollapse-entered div:nth-child(2) > .MuiSlider-root')
    await expect(slider).toBeVisible();

    const thumb = await slider.locator('.MuiSlider-thumb')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('10%')

    await changeSlider(page, thumb, slider, 0)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0%')

    await changeSlider(page, thumb, slider, 0.01)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1%')

    await changeSlider(page, thumb, slider, 1)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100%')

    await changeSlider(page, thumb, slider, 0.99)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99%')

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.vertTransType === VTF.none
            && res.status() === 204
    })
    await container.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'None', exact: true }).click();
    await responsePromise
})

test('Enable zoom/move timing', async ({ page }) => {
    const container = await page.locator('.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")')
    await expect(container).not.toBeVisible()
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await expect(page.getByText('None').first()).toBeVisible()
    await expect(page.getByText('None').nth(1)).toBeVisible()

    await page.getByLabel('Zoom', { exact: true }).check();
    await expect(container).toBeVisible()

    await page.getByLabel('Zoom', { exact: true }).uncheck();
    await expect(container).not.toBeVisible()

    await page.getByText('None').first().click()
    await page.getByRole('option', { name: 'Left', exact: true }).click();
    await expect(container).toBeVisible()

    await page.getByText('Left').first().click()
    await page.getByRole('option', { name: 'Right', exact: true }).click();
    await expect(container).toBeVisible()

    await page.getByText('Right').first().click()
    await page.getByRole('option', { name: 'Left/Right', exact: true }).click();
    await expect(container).toBeVisible()

    await page.getByText('Left/Right').first().click()
    await page.getByRole('option', { name: 'None', exact: true }).click();
    await expect(container).not.toBeVisible()

    await page.getByText('None').nth(1).click()
    await page.getByRole('option', { name: 'Up', exact: true }).click();
    await expect(container).toBeVisible()

    await page.getByText('Up').first().click()
    await page.getByRole('option', { name: 'Down', exact: true }).click();
    await expect(container).toBeVisible()

    await page.getByText('Down').first().click()
    await page.getByRole('option', { name: 'Up/Down', exact: true }).click();
    await expect(container).toBeVisible()

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.vertTransType === VTF.none
            && res.status() === 204
    })
    await page.getByText('Up/Down').first().click()
    await page.getByRole('option', { name: 'None', exact: true }).click();
    await expect(container).not.toBeVisible()
    await responsePromise
})

test('Constant zoom/move timing', async ({ page }) => {
    await page.getByLabel('Zoom', { exact: true }).check();
    await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
    const container = await page.locator('.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")')

    await page.getByRole('combobox').nth(2).click();
    await page.getByRole('option', { name: 'Constant', exact: true }).click();
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'For' })).toBeVisible()
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'For' })).toHaveAttribute('type', 'number')
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'For' })).toHaveAttribute('min', '0')
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'For' })).toHaveAttribute('step', '100')

    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'Between' })).not.toBeVisible()
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'and' })).not.toBeVisible()
    await expect(container.locator('.MuiCollapse-entered .MuiTypography-caption')).not.toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiSlider-root')).not.toBeVisible();

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.zoom === false
            && res.status() === 204
    })
    await page.getByLabel('Zoom', { exact: true }).uncheck();
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await responsePromise
})

test('Random zoom/move timing', async ({ page }) => {
    await page.getByLabel('Zoom', { exact: true }).check();
    await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
    const container = await page.locator('.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")')

    await page.getByRole('combobox').nth(2).click();
    await page.getByRole('option', { name: 'Random', exact: true }).click();
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'Between' })).toBeVisible()
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'Between' })).toHaveAttribute('type', 'number')
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'Between' })).toHaveAttribute('min', '0')
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'Between' })).toHaveAttribute('step', '100')
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'and' })).toBeVisible()
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'and' })).toHaveAttribute('type', 'number')
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'and' })).toHaveAttribute('min', '0')
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'and' })).toHaveAttribute('step', '100')

    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'For' })).not.toBeVisible()
    await expect(container.locator('.MuiCollapse-entered .MuiTypography-caption')).not.toBeVisible();
    await expect(container.locator('.MuiCollapse-entered .MuiSlider-root')).not.toBeVisible();

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.zoom === false
            && res.status() === 204
    })
    await page.getByLabel('Zoom', { exact: true }).uncheck();
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await responsePromise
})

test('Wave zoom/move timing', async ({ page }) => {
    await page.getByLabel('Zoom', { exact: true }).check();
    await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
    const container = await page.locator('.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")')

    await page.getByRole('combobox').nth(2).click();
    await page.getByRole('option', { name: 'Wave', exact: true }).click();
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'Between' })).toBeVisible()
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'Between' })).toHaveAttribute('type', 'number')
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'Between' })).toHaveAttribute('min', '0')
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'Between' })).toHaveAttribute('step', '100')
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'and' })).toBeVisible()
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'and' })).toHaveAttribute('type', 'number')
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'and' })).toHaveAttribute('min', '0')
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'and' })).toHaveAttribute('step', '100')
    await expect(container.locator('.MuiCollapse-entered .MuiTypography-caption')).toHaveText('Wave Rate');
    const slider = container.locator('.MuiCollapse-entered .MuiSlider-root')
    await expect(slider).toBeVisible();
    const thumb = await slider.locator('.MuiSlider-thumb')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100')

    await changeSlider(page, thumb, slider, 0)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1')

    await changeSlider(page, thumb, slider, 0.01)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('2')

    await changeSlider(page, thumb, slider, 0.99)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('99')

    await changeSlider(page, thumb, slider, 1)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('100')

    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'For' })).not.toBeVisible()

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.zoom === false
            && res.status() === 204
    })
    await page.getByLabel('Zoom', { exact: true }).uncheck();
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await responsePromise
})

test('Audio BPM zoom/move timing', async ({page}) => {
    await page.getByLabel('Zoom', { exact: true }).check();
    await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
    const container = await page.locator('.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")')

    await page.getByRole('combobox').nth(2).click();
    await page.getByRole('option', { name: 'Audio BPM', exact: true }).click();
    const slider = container.locator('.MuiCollapse-entered .MuiSlider-root')
    await expect(slider).toBeVisible();
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'For' })).not.toBeVisible()
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'Between' })).not.toBeVisible()
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'and' })).not.toBeVisible()

    const thumb = await slider.locator('.MuiSlider-thumb')
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('1x')
    await expect(container.locator('.MuiCollapse-entered .MuiTypography-caption')).toHaveText('BPM Multiplier 1x');

    await changeSlider(page, thumb, slider, 0)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.1x')
    await expect(container.locator('.MuiCollapse-entered .MuiTypography-caption')).toHaveText('BPM Multiplier 0.1x');

    await changeSlider(page, thumb, slider, 0.01)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('0.2x')
    await expect(container.locator('.MuiCollapse-entered .MuiTypography-caption')).toHaveText('BPM Multiplier 0.2x');

    await changeSlider(page, thumb, slider, 0.99)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('9.9x')
    await expect(container.locator('.MuiCollapse-entered .MuiTypography-caption')).toHaveText('BPM Multiplier 9.9x');

    await changeSlider(page, thumb, slider, 1)
    await thumb.hover()
    await expect(thumb.locator('.MuiSlider-valueLabelOpen')).toHaveText('10x')
    await expect(container.locator('.MuiCollapse-entered .MuiTypography-caption')).toHaveText('BPM Multiplier 10x');

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.zoom === false
            && res.status() === 204
    })
    await page.getByLabel('Zoom', { exact: true }).uncheck();
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await responsePromise
})

test('With scene zoom/move timing', async ({ page }) => {
    await page.getByLabel('Zoom', { exact: true }).check();
    await expect(page.getByLabel('Zoom', { exact: true })).toBeChecked()
    const container = await page.locator('.MuiGrid2-container .MuiGrid2-root > .MuiCollapse-entered:has-text("Timing")')

    await page.getByRole('combobox').nth(2).click();
    await page.getByRole('option', { name: 'With Scene', exact: true }).click();
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'For' })).not.toBeVisible()
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'Between' })).not.toBeVisible()
    await expect(container.locator('.MuiCollapse-entered').getByRole('spinbutton', { name: 'and' })).not.toBeVisible()
    await expect(container.locator('.MuiCollapse-entered .MuiTypography-root')).not.toBeVisible()
    await expect(container.locator('.MuiCollapse-entered .MuiSlider-root')).not.toBeVisible()

    const responsePromise = page.waitForResponse((res) => {
        const request = res.request()
        return new URL(request.url()).pathname === '/api/scenes/1' 
            && request.method() === 'PATCH' 
            && request.postDataJSON()?.zoom === false
            && res.status() === 204
    })
    await page.getByLabel('Zoom', { exact: true }).uncheck();
    await expect(page.getByLabel('Zoom', { exact: true })).not.toBeChecked()
    await responsePromise
})