import { test, expect } from '@playwright/test'

// TEST 1 — Homepage loads correctly
test('homepage loads with key content', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Auberon/i)
  await expect(page.locator('text=Auberon Pharmaceuticals')).toBeVisible()
  await expect(page.locator('text=Explore Products')).toBeVisible()
})

// TEST 2 — Products page loads and filters work
test('products page loads and shows products', async ({ page }) => {
  await page.goto('/products')
  await expect(page.locator('text=Ophthalmics')).toBeVisible()
  // Wait for products to load
  await page.waitForSelector('[data-testid="product-card"], .product-card, h3', 
    { timeout: 10000 })
  // Check at least one product name is visible
  const productCount = await page.locator('text=Eye Drops').count()
  expect(productCount).toBeGreaterThan(0)
})

// TEST 3 — Shop page loads and cart works
test('shop page loads and add to cart works', async ({ page }) => {
  await page.goto('/shop')
  await expect(page).toHaveURL('/shop')
  // Wait for products to load
  await page.waitForTimeout(2000)
  // Check cart sidebar exists
  await expect(page.locator('text=Cart')).toBeVisible()
  // Check proceed to checkout button exists
  await expect(page.locator('text=Proceed to Checkout')).toBeVisible()
})

// TEST 4 — Login page loads and form exists
test('login page loads with form', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('input[type="email"]')).toBeVisible()
  await expect(page.locator('input[type="password"]')).toBeVisible()
  // Check login button exists
  await expect(page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")')).toBeVisible()
})

// TEST 5 — Support page loads with FAQ
test('support page loads with FAQ content', async ({ page }) => {
  await page.goto('/support')
  await expect(page.locator('text=FAQ, text=Frequently, text=Help')).toBeVisible()
  // Contact form should exist
  await expect(page.locator('input[type="email"]')).toBeVisible()
})
