# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> support page loads with FAQ content
- Location: tests/smoke.spec.ts:45:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=FAQ, text=Frequently, text=Help')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=FAQ, text=Frequently, text=Help')

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
      - paragraph [ref=e25]: Help Centre
      - heading "Support & Contact" [level=1] [ref=e26]
      - paragraph [ref=e27]: Our team is here to help — from dosage queries to order assistance.
    - generic [ref=e28]:
      - generic [ref=e31]:
        - paragraph [ref=e32]: Get in touch
        - heading "Speak to our team." [level=2] [ref=e33]
        - paragraph [ref=e34]: Available for dosage guidance, product queries, and wholesale or clinic partnership enquiries.
        - generic [ref=e35]:
          - link "Call us" [ref=e36] [cursor=pointer]:
            - /url: tel:+916307922085
            - img [ref=e37]
            - text: +91 6307922085
          - link "WhatsApp us" [ref=e39] [cursor=pointer]:
            - /url: https://wa.me/916307922085
            - img [ref=e40]
            - text: WhatsApp Us
        - generic [ref=e42]:
          - paragraph [ref=e43]: Hospital Appointments
          - paragraph [ref=e44]: Auberon Eye Care Centre — Kanpur
          - generic [ref=e45]:
            - link "Call hospital" [ref=e46] [cursor=pointer]:
              - /url: tel:+916307922085
              - img [ref=e47]
              - text: +91 6307922085
            - link "Book Online" [ref=e49] [cursor=pointer]:
              - /url: /hospital#appointment
      - generic [ref=e50]:
        - generic [ref=e51]:
          - paragraph [ref=e52]: FAQ
          - heading "Frequently asked questions." [level=2] [ref=e53]
        - generic [ref=e54]:
          - button "Who is Auberon Pharmaceuticals?" [ref=e56]:
            - generic [ref=e57]: Who is Auberon Pharmaceuticals?
            - img [ref=e58]
          - button "What is Chandra Pharma?" [ref=e61]:
            - generic [ref=e62]: What is Chandra Pharma?
            - img [ref=e63]
          - button "What types of products do you offer?" [ref=e66]:
            - generic [ref=e67]: What types of products do you offer?
            - img [ref=e68]
          - button "Can wholesalers and clinics place bulk orders?" [ref=e71]:
            - generic [ref=e72]: Can wholesalers and clinics place bulk orders?
            - img [ref=e73]
          - button "How do I place an order?" [ref=e76]:
            - generic [ref=e77]: How do I place an order?
            - img [ref=e78]
          - button "What payment methods do you accept?" [ref=e81]:
            - generic [ref=e82]: What payment methods do you accept?
            - img [ref=e83]
          - button "How long does delivery take?" [ref=e86]:
            - generic [ref=e87]: How long does delivery take?
            - img [ref=e88]
          - button "Which areas do you deliver to?" [ref=e91]:
            - generic [ref=e92]: Which areas do you deliver to?
            - img [ref=e93]
      - generic [ref=e95]:
        - generic [ref=e96]:
          - paragraph [ref=e97]: Get in Touch
          - heading "Contact Us" [level=2] [ref=e98]
        - generic [ref=e99]:
          - generic [ref=e101]:
            - paragraph [ref=e102]: Send us a message
            - generic [ref=e103]:
              - generic [ref=e104]: Name *
              - textbox "Name" [ref=e105]:
                - /placeholder: Your name
            - generic [ref=e106]:
              - generic [ref=e107]: Email *
              - textbox "Email" [ref=e108]:
                - /placeholder: you@example.com
            - generic [ref=e109]:
              - generic [ref=e110]: Phone
              - textbox "Phone" [ref=e111]:
                - /placeholder: +91 98765 43210
              - paragraph [ref=e112]: Optional — we'll respond via email
            - generic [ref=e113]:
              - generic [ref=e114]: Subject
              - combobox "Subject" [ref=e115]:
                - option "General Inquiry" [selected]
                - option "Product Information"
                - option "Order Support"
                - option "Dosage Guidance"
                - option "Partnership / Distribution"
                - option "Complaint"
            - generic [ref=e116]:
              - generic [ref=e117]: Message *
              - textbox "Message" [ref=e118]:
                - /placeholder: How can we help?
            - button "Send message" [ref=e119] [cursor=pointer]:
              - img [ref=e120]
              - text: Send Message
          - generic [ref=e124]:
            - paragraph [ref=e125]: Contact information
            - generic [ref=e126]:
              - generic [ref=e127]:
                - img [ref=e129]
                - generic [ref=e132]:
                  - paragraph [ref=e133]: Address
                  - paragraph [ref=e134]: Kanpur, Uttar Pradesh, India
              - generic [ref=e135]:
                - img [ref=e137]
                - generic [ref=e139]:
                  - paragraph [ref=e140]: Phone
                  - link "+91 6307922085" [ref=e141] [cursor=pointer]:
                    - /url: tel:+916307922085
              - generic [ref=e142]:
                - img [ref=e144]
                - generic [ref=e147]:
                  - paragraph [ref=e148]: Email
                  - link "auberon.pharma@gmail.com" [ref=e149] [cursor=pointer]:
                    - /url: mailto:auberon.pharma@gmail.com
              - generic [ref=e150]:
                - img [ref=e152]
                - generic [ref=e155]:
                  - paragraph [ref=e156]: Hours
                  - paragraph [ref=e157]: "Mon–Sat: 9:00 AM – 6:00 PM IST"
            - generic [ref=e159]:
              - img [ref=e161]
              - paragraph [ref=e164]: Kanpur, Uttar Pradesh
              - link "Open in Maps →" [ref=e165] [cursor=pointer]:
                - /url: https://maps.google.com/?q=Kanpur+Uttar+Pradesh+India
  - contentinfo [ref=e166]:
    - generic [ref=e167]:
      - generic [ref=e168]:
        - generic [ref=e169]:
          - paragraph [ref=e170]: Auberon Pharmaceuticals
          - paragraph [ref=e171]: Chandra Pharma
          - paragraph [ref=e172]: Specialised ophthalmic formulations manufactured by Chandra Pharma. Trusted by ophthalmologists, wholesalers, and patients across India since 2010.
        - generic [ref=e173]:
          - paragraph [ref=e174]: Navigate
          - generic [ref=e175]:
            - link "Home" [ref=e176] [cursor=pointer]:
              - /url: /
            - link "Products" [ref=e177] [cursor=pointer]:
              - /url: /products
            - link "Hospital Wing" [ref=e178] [cursor=pointer]:
              - /url: /hospital
            - link "Order Medicine" [ref=e179] [cursor=pointer]:
              - /url: /shop
            - link "Support & FAQ" [ref=e180] [cursor=pointer]:
              - /url: /support
            - link "Admin Portal" [ref=e181] [cursor=pointer]:
              - /url: /admin/login
        - generic [ref=e182]:
          - paragraph [ref=e183]: Contact
          - generic [ref=e184]:
            - generic [ref=e185]:
              - img [ref=e186]
              - generic [ref=e189]: Kanpur, Uttar Pradesh, India
            - generic [ref=e190]:
              - img [ref=e191]
              - link "+91 6307922085" [ref=e193] [cursor=pointer]:
                - /url: tel:+916307922085
            - generic [ref=e194]:
              - img [ref=e195]
              - link "auberon.pharma@gmail.com" [ref=e198] [cursor=pointer]:
                - /url: mailto:auberon.pharma@gmail.com
      - generic [ref=e199]:
        - paragraph [ref=e200]: © 2026 Auberon Pharmaceuticals. All rights reserved.
        - generic [ref=e201]:
          - link "Privacy Policy" [ref=e202] [cursor=pointer]:
            - /url: /support
          - link "Terms of Use" [ref=e203] [cursor=pointer]:
            - /url: /support
  - generic [ref=e204]:
    - generic: Chat with us on WhatsApp
    - button "Open support chat" [ref=e205] [cursor=pointer]:
      - img [ref=e206]
  - button "Open Next.js Dev Tools" [ref=e213] [cursor=pointer]:
    - img [ref=e214]
  - alert [ref=e217]
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
> 47 |   await expect(page.locator('text=FAQ, text=Frequently, text=Help')).toBeVisible()
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  48 |   // Contact form should exist
  49 |   await expect(page.locator('input[type="email"]')).toBeVisible()
  50 | })
  51 | 
```