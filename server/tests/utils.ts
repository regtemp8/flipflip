import { expect, Page } from "@playwright/test";

export async function login(page: Page) {
    await page.goto('/')
    await page.getByLabel('Username').click();
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Username').press('Tab');
    await page.getByLabel('Password').fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/')
}