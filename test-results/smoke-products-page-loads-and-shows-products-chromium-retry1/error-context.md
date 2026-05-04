# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> products page loads and shows products
- Location: tests/smoke.spec.ts:12:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Ophthalmics')
Expected: visible
Error: strict mode violation: locator('text=Ophthalmics') resolved to 8 elements:
    1) <span>Ophthalmics</span> aka getByText('Ophthalmics').first()
    2) <span>Ophthalmics</span> aka getByText('Ophthalmics').nth(1)
    3) <span>Ophthalmics</span> aka getByText('Ophthalmics').nth(2)
    4) <span>Ophthalmics</span> aka getByText('Ophthalmics').nth(3)
    5) <span>Ophthalmics</span> aka getByText('Ophthalmics').nth(4)
    6) <span>Ophthalmics</span> aka getByText('Ophthalmics').nth(5)
    7) <span>Ophthalmics</span> aka locator('div:nth-child(7) > .bg-\\[\\#F5F5F7\\] > div > span')
    8) <span>Ophthalmics</span> aka locator('div:nth-child(8) > .bg-\\[\\#F5F5F7\\] > div > span')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Ophthalmics')

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
        - link "Order" [ref=e11] [cursor=pointer]:
          - /url: /shop
        - link "Partners" [ref=e12] [cursor=pointer]:
          - /url: /partners
        - link "Support" [ref=e13] [cursor=pointer]:
          - /url: /support
        - generic [ref=e14]:
          - link "Cart — 0 items" [ref=e15] [cursor=pointer]:
            - /url: /shop
            - img [ref=e16]
          - link "Sign In" [ref=e19] [cursor=pointer]:
            - /url: /login
          - link "Order Now" [ref=e20] [cursor=pointer]:
            - /url: /shop
  - main [ref=e21]:
    - generic [ref=e23]:
      - paragraph [ref=e24]: Our Range
      - heading "Product Catalogue" [level=1] [ref=e25]
      - paragraph [ref=e26]: Ophthalmic formulations developed for clinical precision — trusted by eye care professionals nationwide.
    - generic [ref=e28]:
      - generic [ref=e29]:
        - generic [ref=e30]:
          - img
          - textbox "Search products" [ref=e31]:
            - /placeholder: Search products...
        - generic [ref=e33]:
          - paragraph [ref=e35]: Filters
          - generic [ref=e36]:
            - paragraph [ref=e37]: Category
            - button "All categories" [ref=e39] [cursor=pointer]: All
          - generic [ref=e40]:
            - paragraph [ref=e41]: Rating
            - generic [ref=e42]:
              - button "Filter by 4★ & above" [ref=e43]: 4★ & above
              - button "Filter by 3★ & above" [ref=e44]: 3★ & above
              - button "Filter by All ratings" [ref=e45]: All ratings
          - generic [ref=e46]:
            - paragraph [ref=e47]: Form
            - generic [ref=e48]:
              - button "All" [ref=e49] [cursor=pointer]
              - button "Filter by Eye Drops" [ref=e50] [cursor=pointer]: Eye Drops
          - generic [ref=e51]:
            - paragraph [ref=e52]: Prescription
            - generic [ref=e53] [cursor=pointer]:
              - checkbox "Rx required only" [ref=e54]
              - text: Rx required only
      - generic [ref=e55]:
        - paragraph [ref=e56]: Showing 8 of 8 products
        - generic [ref=e57]:
          - generic [ref=e58]:
            - generic [ref=e59]:
              - paragraph [ref=e60]: Moxifloxacin Eye Drops 0.5%
              - generic [ref=e62]: Ophthalmics
              - button "Add to wishlist" [ref=e63] [cursor=pointer]:
                - img [ref=e64]
            - generic [ref=e66]:
              - heading "Moxifloxacin Eye Drops 0.5%" [level=3] [ref=e67]
              - paragraph [ref=e68]: Eye Drops
              - paragraph [ref=e69]: Fourth-generation fluoroquinolone antibiotic eye drops for the treatment of bacterial conjunctivitis and corneal ulcers. Broad-spectrum activity against gram-positive and gram-negative organisms including Staphylococcus aureus and Streptococcus pneumoniae.
              - generic [ref=e70]:
                - generic [ref=e71]: Rs. 185
                - generic [ref=e72]:
                  - button "View details for Moxifloxacin Eye Drops 0.5%" [ref=e73]:
                    - img [ref=e74]
                  - button "Book Moxifloxacin Eye Drops 0.5%" [ref=e77] [cursor=pointer]:
                    - img [ref=e78]
                    - text: Book
              - paragraph [ref=e81]: By Chandra Pharma
          - generic [ref=e82]:
            - generic [ref=e83]:
              - paragraph [ref=e84]: Prednisolone Acetate Eye Drops 1%
              - generic [ref=e86]: Ophthalmics
              - button "Add to wishlist" [ref=e87] [cursor=pointer]:
                - img [ref=e88]
            - generic [ref=e90]:
              - heading "Prednisolone Acetate Eye Drops 1%" [level=3] [ref=e91]
              - paragraph [ref=e92]: Eye Drops
              - paragraph [ref=e93]: Corticosteroid eye drops for the treatment of ocular inflammation associated with uveitis, iritis, cyclitis, and post-operative inflammation. Reduces redness, swelling, and discomfort in inflammatory eye conditions.
              - generic [ref=e94]:
                - generic [ref=e95]: Rs. 210
                - generic [ref=e96]:
                  - button "View details for Prednisolone Acetate Eye Drops 1%" [ref=e97]:
                    - img [ref=e98]
                  - button "Book Prednisolone Acetate Eye Drops 1%" [ref=e101] [cursor=pointer]:
                    - img [ref=e102]
                    - text: Book
              - paragraph [ref=e105]: By Chandra Pharma
          - generic [ref=e106]:
            - generic [ref=e107]:
              - paragraph [ref=e108]: Carboxymethylcellulose Eye Drops 0.5%
              - generic [ref=e110]: Ophthalmics
              - button "Add to wishlist" [ref=e111] [cursor=pointer]:
                - img [ref=e112]
            - generic [ref=e114]:
              - heading "Carboxymethylcellulose Eye Drops 0.5%" [level=3] [ref=e115]
              - paragraph [ref=e116]: Eye Drops
              - paragraph [ref=e117]: Lubricating eye drops for the relief of dry eye syndrome and ocular surface discomfort. Provides long-lasting moisture and protection to the ocular surface. Suitable for daily use including in contact lens wearers.
              - generic [ref=e118]:
                - generic [ref=e119]: Rs. 120
                - generic [ref=e120]:
                  - button "View details for Carboxymethylcellulose Eye Drops 0.5%" [ref=e121]:
                    - img [ref=e122]
                  - button "Book Carboxymethylcellulose Eye Drops 0.5%" [ref=e125] [cursor=pointer]:
                    - img [ref=e126]
                    - text: Book
              - paragraph [ref=e129]: By Chandra Pharma
          - generic [ref=e130]:
            - generic [ref=e131]:
              - paragraph [ref=e132]: Timolol Maleate Eye Drops 0.5%
              - generic [ref=e134]: Ophthalmics
              - button "Add to wishlist" [ref=e135] [cursor=pointer]:
                - img [ref=e136]
            - generic [ref=e138]:
              - heading "Timolol Maleate Eye Drops 0.5%" [level=3] [ref=e139]
              - paragraph [ref=e140]: Eye Drops
              - paragraph [ref=e141]: Beta-adrenergic blocking agent for the reduction of elevated intraocular pressure in patients with ocular hypertension and open-angle glaucoma. Reduces aqueous humour production without affecting pupil size or accommodation.
              - generic [ref=e142]:
                - generic [ref=e143]: Rs. 165
                - generic [ref=e144]:
                  - button "View details for Timolol Maleate Eye Drops 0.5%" [ref=e145]:
                    - img [ref=e146]
                  - button "Book Timolol Maleate Eye Drops 0.5%" [ref=e149] [cursor=pointer]:
                    - img [ref=e150]
                    - text: Book
              - paragraph [ref=e153]: By Chandra Pharma
          - generic [ref=e154]:
            - generic [ref=e155]:
              - paragraph [ref=e156]: Ciprofloxacin Eye Drops 0.3%
              - generic [ref=e158]: Ophthalmics
              - button "Add to wishlist" [ref=e159] [cursor=pointer]:
                - img [ref=e160]
            - generic [ref=e162]:
              - heading "Ciprofloxacin Eye Drops 0.3%" [level=3] [ref=e163]
              - paragraph [ref=e164]: Eye Drops
              - paragraph [ref=e165]: Fluoroquinolone antibiotic eye drops for bacterial ocular infections including conjunctivitis, blepharitis, and corneal ulcers. Effective against a broad spectrum of gram-positive and gram-negative bacteria.
              - generic [ref=e166]:
                - generic [ref=e167]: Rs. 95
                - generic [ref=e168]:
                  - button "View details for Ciprofloxacin Eye Drops 0.3%" [ref=e169]:
                    - img [ref=e170]
                  - button "Book Ciprofloxacin Eye Drops 0.3%" [ref=e173] [cursor=pointer]:
                    - img [ref=e174]
                    - text: Book
              - paragraph [ref=e177]: By Chandra Pharma
          - generic [ref=e178]:
            - generic [ref=e179]:
              - paragraph [ref=e180]: Ketorolac Tromethamine Eye Drops 0.5%
              - generic [ref=e182]: Ophthalmics
              - button "Add to wishlist" [ref=e183] [cursor=pointer]:
                - img [ref=e184]
            - generic [ref=e186]:
              - heading "Ketorolac Tromethamine Eye Drops 0.5%" [level=3] [ref=e187]
              - paragraph [ref=e188]: Eye Drops
              - paragraph [ref=e189]: Non-steroidal anti-inflammatory eye drops for the relief of ocular itching due to seasonal allergic conjunctivitis and post-operative inflammation following cataract surgery. Inhibits prostaglandin synthesis.
              - generic [ref=e190]:
                - generic [ref=e191]: Rs. 145
                - generic [ref=e192]:
                  - button "View details for Ketorolac Tromethamine Eye Drops 0.5%" [ref=e193]:
                    - img [ref=e194]
                  - button "Book Ketorolac Tromethamine Eye Drops 0.5%" [ref=e197] [cursor=pointer]:
                    - img [ref=e198]
                    - text: Book
              - paragraph [ref=e201]: By Chandra Pharma
          - generic [ref=e202]:
            - generic [ref=e203]:
              - paragraph [ref=e204]: Latanoprost Eye Drops 0.005%
              - generic [ref=e206]: Ophthalmics
              - button "Add to wishlist" [ref=e207] [cursor=pointer]:
                - img [ref=e208]
            - generic [ref=e210]:
              - heading "Latanoprost Eye Drops 0.005%" [level=3] [ref=e211]
              - paragraph [ref=e212]: Eye Drops
              - paragraph [ref=e213]: Prostaglandin analogue for the reduction of elevated intraocular pressure in open-angle glaucoma and ocular hypertension. Increases uveoscleral outflow of aqueous humour. First-line treatment for glaucoma.
              - generic [ref=e214]:
                - generic [ref=e215]: Rs. 290
                - generic [ref=e216]:
                  - button "View details for Latanoprost Eye Drops 0.005%" [ref=e217]:
                    - img [ref=e218]
                  - button "Book Latanoprost Eye Drops 0.005%" [ref=e221] [cursor=pointer]:
                    - img [ref=e222]
                    - text: Book
              - paragraph [ref=e225]: By Chandra Pharma
          - generic [ref=e226]:
            - generic [ref=e227]:
              - paragraph [ref=e228]: Hydroxypropyl Methylcellulose Eye Drops 2%
              - generic [ref=e230]: Ophthalmics
              - button "Add to wishlist" [ref=e231] [cursor=pointer]:
                - img [ref=e232]
            - generic [ref=e234]:
              - heading "Hydroxypropyl Methylcellulose Eye Drops 2%" [level=3] [ref=e235]
              - paragraph [ref=e236]: Eye Drops
              - paragraph [ref=e237]: Viscous lubricating eye drops for moderate to severe dry eye syndrome. Higher viscosity formulation provides prolonged contact time and superior moisture retention compared to standard lubricants. Suitable for use before surgical procedures.
              - generic [ref=e238]:
                - generic [ref=e239]: Rs. 110
                - generic [ref=e240]:
                  - button "View details for Hydroxypropyl Methylcellulose Eye Drops 2%" [ref=e241]:
                    - img [ref=e242]
                  - button "Book Hydroxypropyl Methylcellulose Eye Drops 2%" [ref=e245] [cursor=pointer]:
                    - img [ref=e246]
                    - text: Book
              - paragraph [ref=e249]: By Chandra Pharma
  - contentinfo [ref=e250]:
    - generic [ref=e251]:
      - generic [ref=e252]:
        - generic [ref=e253]:
          - paragraph [ref=e254]: Auberon Pharmaceuticals
          - paragraph [ref=e255]: Chandra Pharma
          - paragraph [ref=e256]: Specialised ophthalmic formulations manufactured by Chandra Pharma. Trusted by ophthalmologists, wholesalers, and patients across India since 2010.
        - generic [ref=e257]:
          - paragraph [ref=e258]: Navigate
          - generic [ref=e259]:
            - link "Home" [ref=e260] [cursor=pointer]:
              - /url: /
            - link "Products" [ref=e261] [cursor=pointer]:
              - /url: /products
            - link "Order Medicine" [ref=e262] [cursor=pointer]:
              - /url: /shop
            - link "Support & FAQ" [ref=e263] [cursor=pointer]:
              - /url: /support
            - link "Admin Portal" [ref=e264] [cursor=pointer]:
              - /url: /admin/login
        - generic [ref=e265]:
          - paragraph [ref=e266]: Contact
          - generic [ref=e267]:
            - generic [ref=e268]:
              - img [ref=e269]
              - generic [ref=e272]: Kanpur, Uttar Pradesh, India
            - generic [ref=e273]:
              - img [ref=e274]
              - link "+91 6307922085" [ref=e276] [cursor=pointer]:
                - /url: tel:+916307922085
            - generic [ref=e277]:
              - img [ref=e278]
              - link "auberon.pharma@gmail.com" [ref=e281] [cursor=pointer]:
                - /url: mailto:auberon.pharma@gmail.com
      - generic [ref=e282]:
        - paragraph [ref=e283]: © 2026 Auberon Pharmaceuticals. All rights reserved.
        - generic [ref=e284]:
          - link "Privacy Policy" [ref=e285] [cursor=pointer]:
            - /url: /support
          - link "Terms of Use" [ref=e286] [cursor=pointer]:
            - /url: /support
  - generic [ref=e287]:
    - generic: Chat with us on WhatsApp
    - button "Open support chat" [ref=e288] [cursor=pointer]:
      - img [ref=e289]
  - button "Open Next.js Dev Tools" [ref=e296] [cursor=pointer]:
    - img [ref=e297]
  - alert [ref=e300]
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
> 14 |   await expect(page.locator('text=Ophthalmics')).toBeVisible()
     |                                                  ^ Error: expect(locator).toBeVisible() failed
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
  30 |   await expect(page.locator('text=Cart')).toBeVisible()
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