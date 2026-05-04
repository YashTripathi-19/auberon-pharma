# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> shop page loads and add to cart works
- Location: tests/smoke.spec.ts:24:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Cart')
Expected: visible
Error: strict mode violation: locator('text=Cart') resolved to 2 elements:
    1) <p class="font-display text-[1rem] font-semibold text-primary">…</p> aka getByText('Cart (0)')
    2) <p class="text-[14px] text-primary font-medium">Your cart is empty</p> aka getByText('Your cart is empty')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Cart')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation "Main navigation" [ref=e2]:
    - generic [ref=e4]:
      - link "Auberon Pharmaceuticals" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e6]: Auberon Pharmaceuticals
        - generic [ref=e7]: Chandra Pharma
      - generic [ref=e8]:
        - link "Home" [ref=e9] [cursor=pointer]:
          - /url: /
        - link "Products" [ref=e10] [cursor=pointer]:
          - /url: /products
        - link "Hospital" [ref=e11] [cursor=pointer]:
          - /url: /hospital
        - link "Order" [ref=e12] [cursor=pointer]:
          - /url: /shop
        - link "Partners" [ref=e13] [cursor=pointer]:
          - /url: /partners
        - link "Support" [ref=e14] [cursor=pointer]:
          - /url: /support
        - generic [ref=e15]:
          - link "Cart — 0 items" [ref=e16] [cursor=pointer]:
            - /url: /shop
            - img [ref=e17]
          - link "Sign In" [ref=e20] [cursor=pointer]:
            - /url: /login
          - link "Order Now" [ref=e21] [cursor=pointer]:
            - /url: /shop
  - main [ref=e22]:
    - generic [ref=e24]:
      - paragraph [ref=e25]: Order
      - heading "Order Medicine" [level=1] [ref=e26]
      - paragraph [ref=e27]: Select your products, fill in delivery details, and our team will confirm your order within 24 hours.
    - generic [ref=e29]:
      - generic [ref=e31]:
        - generic [ref=e32]:
          - paragraph [ref=e33]: Select Products
          - generic [ref=e34]: 8 available
        - generic [ref=e35]:
          - img
          - textbox "Search products" [ref=e36]:
            - /placeholder: Search products...
        - generic [ref=e37]:
          - button "All" [ref=e38]
          - button "Ophthalmics" [ref=e39]
        - generic [ref=e40]:
          - button "Add Moxifloxacin Eye Drops 0.5%" [ref=e41] [cursor=pointer]:
            - generic [ref=e42]:
              - generic [ref=e43]:
                - paragraph [ref=e44]: Moxifloxacin Eye Drops 0.5%
                - generic [ref=e45]:
                  - paragraph [ref=e46]: Ophthalmics
                  - generic [ref=e47]: · Rs. 185
              - img [ref=e49]
          - button "Add Prednisolone Acetate Eye Drops 1%" [ref=e50] [cursor=pointer]:
            - generic [ref=e51]:
              - generic [ref=e52]:
                - paragraph [ref=e53]: Prednisolone Acetate Eye Drops 1%
                - generic [ref=e54]:
                  - paragraph [ref=e55]: Ophthalmics
                  - generic [ref=e56]: · Rs. 210
              - img [ref=e58]
          - button "Add Carboxymethylcellulose Eye Drops 0.5%" [ref=e59] [cursor=pointer]:
            - generic [ref=e60]:
              - generic [ref=e61]:
                - paragraph [ref=e62]: Carboxymethylcellulose Eye Drops 0.5%
                - generic [ref=e63]:
                  - paragraph [ref=e64]: Ophthalmics
                  - generic [ref=e65]: · Rs. 120
              - img [ref=e67]
          - button "Add Timolol Maleate Eye Drops 0.5%" [ref=e68] [cursor=pointer]:
            - generic [ref=e69]:
              - generic [ref=e70]:
                - paragraph [ref=e71]: Timolol Maleate Eye Drops 0.5%
                - generic [ref=e72]:
                  - paragraph [ref=e73]: Ophthalmics
                  - generic [ref=e74]: · Rs. 165
              - img [ref=e76]
          - button "Add Ciprofloxacin Eye Drops 0.3%" [ref=e77] [cursor=pointer]:
            - generic [ref=e78]:
              - generic [ref=e79]:
                - paragraph [ref=e80]: Ciprofloxacin Eye Drops 0.3%
                - generic [ref=e81]:
                  - paragraph [ref=e82]: Ophthalmics
                  - generic [ref=e83]: · Rs. 95
              - img [ref=e85]
          - button "Add Ketorolac Tromethamine Eye Drops 0.5%" [ref=e86] [cursor=pointer]:
            - generic [ref=e87]:
              - generic [ref=e88]:
                - paragraph [ref=e89]: Ketorolac Tromethamine Eye Drops 0.5%
                - generic [ref=e90]:
                  - paragraph [ref=e91]: Ophthalmics
                  - generic [ref=e92]: · Rs. 145
              - img [ref=e94]
          - button "Add Latanoprost Eye Drops 0.005%" [ref=e95] [cursor=pointer]:
            - generic [ref=e96]:
              - generic [ref=e97]:
                - paragraph [ref=e98]: Latanoprost Eye Drops 0.005%
                - generic [ref=e99]:
                  - paragraph [ref=e100]: Ophthalmics
                  - generic [ref=e101]: · Rs. 290
              - img [ref=e103]
          - button "Add Hydroxypropyl Methylcellulose Eye Drops 2%" [ref=e104] [cursor=pointer]:
            - generic [ref=e105]:
              - generic [ref=e106]:
                - paragraph [ref=e107]: Hydroxypropyl Methylcellulose Eye Drops 2%
                - generic [ref=e108]:
                  - paragraph [ref=e109]: Ophthalmics
                  - generic [ref=e110]: · Rs. 110
              - img [ref=e112]
      - generic [ref=e115]:
        - paragraph [ref=e117]:
          - text: Cart
          - generic [ref=e118]: (0)
        - generic [ref=e119]:
          - img [ref=e121]
          - paragraph [ref=e124]: Your cart is empty
          - paragraph [ref=e125]: Add products to get started
  - contentinfo [ref=e126]:
    - generic [ref=e127]:
      - generic [ref=e128]:
        - generic [ref=e129]:
          - paragraph [ref=e130]: Auberon Pharmaceuticals
          - paragraph [ref=e131]: Chandra Pharma
          - paragraph [ref=e132]: Specialised ophthalmic formulations manufactured by Chandra Pharma. Trusted by ophthalmologists, wholesalers, and patients across India since 2010.
        - generic [ref=e133]:
          - paragraph [ref=e134]: Navigate
          - generic [ref=e135]:
            - link "Home" [ref=e136] [cursor=pointer]:
              - /url: /
            - link "Products" [ref=e137] [cursor=pointer]:
              - /url: /products
            - link "Hospital Wing" [ref=e138] [cursor=pointer]:
              - /url: /hospital
            - link "Order Medicine" [ref=e139] [cursor=pointer]:
              - /url: /shop
            - link "Support & FAQ" [ref=e140] [cursor=pointer]:
              - /url: /support
            - link "Admin Portal" [ref=e141] [cursor=pointer]:
              - /url: /admin/login
        - generic [ref=e142]:
          - paragraph [ref=e143]: Contact
          - generic [ref=e144]:
            - generic [ref=e145]:
              - img [ref=e146]
              - generic [ref=e149]: Kanpur, Uttar Pradesh, India
            - generic [ref=e150]:
              - img [ref=e151]
              - link "+91 6307922085" [ref=e153] [cursor=pointer]:
                - /url: tel:+916307922085
            - generic [ref=e154]:
              - img [ref=e155]
              - link "auberon.pharma@gmail.com" [ref=e158] [cursor=pointer]:
                - /url: mailto:auberon.pharma@gmail.com
      - generic [ref=e159]:
        - paragraph [ref=e160]: © 2026 Auberon Pharmaceuticals. All rights reserved.
        - generic [ref=e161]:
          - link "Privacy Policy" [ref=e162] [cursor=pointer]:
            - /url: /support
          - link "Terms of Use" [ref=e163] [cursor=pointer]:
            - /url: /support
  - generic [ref=e164]:
    - generic: Chat with us on WhatsApp
    - button "Open support chat" [ref=e165] [cursor=pointer]:
      - img [ref=e166]
  - button "Open Next.js Dev Tools" [ref=e173] [cursor=pointer]:
    - img [ref=e174]
  - alert [ref=e177]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | // TEST 1 — Homepage loads correctly
  4  | test('homepage loads with key content', async ({ page }) => {
  5  |   await page.goto('/')
  6  |   await expect(page).toHaveTitle(/Auberon/i)
  7  |   await expect(page.locator('text=Auberon Pharmaceuticals')).toBeVisible()
  8  |   await expect(page.locator('text=Explore Products')).toBeVisible()
  9  | })
  10 | 
  11 | // TEST 2 — Products page loads and filters work
  12 | test('products page loads and shows products', async ({ page }) => {
  13 |   await page.goto('/products')
  14 |   await expect(page.locator('text=Ophthalmics')).toBeVisible()
  15 |   // Wait for products to load
  16 |   await page.waitForSelector('[data-testid="product-card"], .product-card, h3', 
  17 |     { timeout: 10000 })
  18 |   // Check at least one product name is visible
  19 |   const productCount = await page.locator('text=Eye Drops').count()
  20 |   expect(productCount).toBeGreaterThan(0)
  21 | })
  22 | 
  23 | // TEST 3 — Shop page loads and cart works
  24 | test('shop page loads and add to cart works', async ({ page }) => {
  25 |   await page.goto('/shop')
  26 |   await expect(page).toHaveURL('/shop')
  27 |   // Wait for products to load
  28 |   await page.waitForTimeout(2000)
  29 |   // Check cart sidebar exists
> 30 |   await expect(page.locator('text=Cart')).toBeVisible()
     |                                           ^ Error: expect(locator).toBeVisible() failed
  31 |   // Check proceed to checkout button exists
  32 |   await expect(page.locator('text=Proceed to Checkout')).toBeVisible()
  33 | })
  34 | 
  35 | // TEST 4 — Login page loads and form exists
  36 | test('login page loads with form', async ({ page }) => {
  37 |   await page.goto('/login')
  38 |   await expect(page.locator('input[type="email"]')).toBeVisible()
  39 |   await expect(page.locator('input[type="password"]')).toBeVisible()
  40 |   // Check login button exists
  41 |   await expect(page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")')).toBeVisible()
  42 | })
  43 | 
  44 | // TEST 5 — Support page loads with FAQ
  45 | test('support page loads with FAQ content', async ({ page }) => {
  46 |   await page.goto('/support')
  47 |   await expect(page.locator('text=FAQ, text=Frequently, text=Help')).toBeVisible()
  48 |   // Contact form should exist
  49 |   await expect(page.locator('input[type="email"]')).toBeVisible()
  50 | })
  51 | 
```