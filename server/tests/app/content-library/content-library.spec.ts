import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/content-library')
})

// TODO add tutorial tests
