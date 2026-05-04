# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> homepage loads with key content
- Location: tests/smoke.spec.ts:4:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Auberon Pharmaceuticals')
Expected: visible
Error: strict mode violation: locator('text=Auberon Pharmaceuticals') resolved to 6 elements:
    1) <span class="font-display text-[1.05rem] md:text-[1.15rem] font-bold leading-tight tracking-wide transition-colors duration-300 text-white">Auberon Pharmaceuticals</span> aka getByLabel('Main navigation').getByText('Auberon Pharmaceuticals')
    2) <p class="text-accent text-[11px] font-semibold tracking-[0.2em] uppercase mb-6">Auberon Pharmaceuticals · Chandra Pharma</p> aka getByText('Auberon Pharmaceuticals ·')
    3) <p>…</p> aka getByText('Auberon Pharmaceuticals was')
    4) <p>Auberon Pharmaceuticals founded by Anurag Ranjan …</p> aka getByText('Auberon Pharmaceuticals founded by Anurag Ranjan Tripathi in Kanpur')
    5) <p>Auberon Pharmaceuticals</p> aka locator('footer').getByText('Auberon Pharmaceuticals', { exact: true })
    6) <p>…</p> aka getByText('© 2026 Auberon')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Auberon Pharmaceuticals')

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
    - generic [ref=e26]:
      - paragraph [ref=e27]: Auberon Pharmaceuticals · Chandra Pharma
      - heading "Ophthalmic care, crafted with precision." [level=1] [ref=e28]:
        - text: Ophthalmic care,
        - text: crafted with precision.
      - paragraph [ref=e29]: Specialised eye drops and ophthalmic tablets — trusted by ophthalmologists, wholesalers, and patients across India since 2010.
      - generic [ref=e30]:
        - link "Explore Products" [ref=e31] [cursor=pointer]:
          - /url: /products
        - link "Contact Us" [ref=e32] [cursor=pointer]:
          - /url: /support
    - generic [ref=e38]:
      - generic [ref=e39]:
        - paragraph [ref=e40]:
          - generic [ref=e41]: 0+
        - paragraph [ref=e42]: Years in ophthalmic care
      - generic [ref=e43]:
        - paragraph [ref=e44]:
          - generic [ref=e45]: 0+
        - paragraph [ref=e46]: Ophthalmic products
      - generic [ref=e47]:
        - paragraph [ref=e48]:
          - generic [ref=e49]: 0+
        - paragraph [ref=e50]: Patients served
      - generic [ref=e51]:
        - paragraph [ref=e52]:
          - generic [ref=e53]: 0+
        - paragraph [ref=e54]: Cities covered
    - generic [ref=e56]:
      - generic [ref=e57]:
        - paragraph [ref=e58]: Our Range
        - heading "Featured products." [level=2] [ref=e59]
        - paragraph [ref=e60]: Ophthalmic formulations developed for clinical precision — trusted by eye care professionals nationwide.
      - generic [ref=e61]:
        - generic [ref=e63]:
          - generic [ref=e64]:
            - paragraph [ref=e65]: Moxifloxacin Eye Drops 0.5%
            - generic [ref=e67]: Ophthalmics
            - button "Add to wishlist" [ref=e68] [cursor=pointer]:
              - img [ref=e69]
          - generic [ref=e71]:
            - heading "Moxifloxacin Eye Drops 0.5%" [level=3] [ref=e72]
            - paragraph [ref=e73]: Eye Drops
            - paragraph [ref=e74]: Fourth-generation fluoroquinolone antibiotic eye drops for the treatment of bacterial conjunctivitis and corneal ulcers. Broad-spectrum activity against gram-positive and gram-negative organisms including Staphylococcus aureus and Streptococcus pneumoniae.
            - generic [ref=e75]:
              - generic [ref=e76]: Rs. 185
              - generic [ref=e77]:
                - button "View details for Moxifloxacin Eye Drops 0.5%" [ref=e78]:
                  - img [ref=e79]
                - button "Book Moxifloxacin Eye Drops 0.5%" [ref=e82] [cursor=pointer]:
                  - img [ref=e83]
                  - text: Book
            - paragraph [ref=e86]: By Chandra Pharma
        - generic [ref=e88]:
          - generic [ref=e89]:
            - paragraph [ref=e90]: Prednisolone Acetate Eye Drops 1%
            - generic [ref=e92]: Ophthalmics
            - button "Add to wishlist" [ref=e93] [cursor=pointer]:
              - img [ref=e94]
          - generic [ref=e96]:
            - heading "Prednisolone Acetate Eye Drops 1%" [level=3] [ref=e97]
            - paragraph [ref=e98]: Eye Drops
            - paragraph [ref=e99]: Corticosteroid eye drops for the treatment of ocular inflammation associated with uveitis, iritis, cyclitis, and post-operative inflammation. Reduces redness, swelling, and discomfort in inflammatory eye conditions.
            - generic [ref=e100]:
              - generic [ref=e101]: Rs. 210
              - generic [ref=e102]:
                - button "View details for Prednisolone Acetate Eye Drops 1%" [ref=e103]:
                  - img [ref=e104]
                - button "Book Prednisolone Acetate Eye Drops 1%" [ref=e107] [cursor=pointer]:
                  - img [ref=e108]
                  - text: Book
            - paragraph [ref=e111]: By Chandra Pharma
        - generic [ref=e113]:
          - generic [ref=e114]:
            - paragraph [ref=e115]: Carboxymethylcellulose Eye Drops 0.5%
            - generic [ref=e117]: Ophthalmics
            - button "Add to wishlist" [ref=e118] [cursor=pointer]:
              - img [ref=e119]
          - generic [ref=e121]:
            - heading "Carboxymethylcellulose Eye Drops 0.5%" [level=3] [ref=e122]
            - paragraph [ref=e123]: Eye Drops
            - paragraph [ref=e124]: Lubricating eye drops for the relief of dry eye syndrome and ocular surface discomfort. Provides long-lasting moisture and protection to the ocular surface. Suitable for daily use including in contact lens wearers.
            - generic [ref=e125]:
              - generic [ref=e126]: Rs. 120
              - generic [ref=e127]:
                - button "View details for Carboxymethylcellulose Eye Drops 0.5%" [ref=e128]:
                  - img [ref=e129]
                - button "Book Carboxymethylcellulose Eye Drops 0.5%" [ref=e132] [cursor=pointer]:
                  - img [ref=e133]
                  - text: Book
            - paragraph [ref=e136]: By Chandra Pharma
      - link "View all products" [ref=e138] [cursor=pointer]:
        - /url: /products
        - text: View all products
        - img [ref=e139]
    - generic [ref=e143]:
      - generic [ref=e144]:
        - paragraph [ref=e145]: Our Story
        - heading "Founded on a vision of better eye care." [level=2] [ref=e146]:
          - text: Founded on a vision
          - text: of better eye care.
        - paragraph [ref=e147]: What began as a distribution venture in 2010 has grown into a vertically integrated ophthalmic company — from manufacturing to direct patient delivery.
      - generic [ref=e148]:
        - generic [ref=e149]:
          - paragraph [ref=e150]: Auberon Pharmaceuticals was founded in 2010 by Anurag Ranjan Tripathi with a singular focus — making high-quality ophthalmic medicines accessible to doctors and patients across India. Starting as a distribution venture, it quickly became a trusted name among ophthalmologists and eye care clinics.
          - paragraph [ref=e151]: In 2021, the company extended its scope with the establishment of Chandra Pharma, a dedicated manufacturing arm producing the full range of Auberon's ophthalmic formulations — from antibiotic and anti-inflammatory eye drops to supportive oral tablets.
          - paragraph [ref=e152]: Today we supply directly to wholesalers, hospitals, and ophthalmology clinics — and are now extending our reach to individual consumers.
        - generic [ref=e153]:
          - generic [ref=e158]:
            - paragraph [ref=e159]: "2010"
            - paragraph [ref=e160]: Auberon Pharmaceuticals founded by Anurag Ranjan Tripathi in Kanpur
          - generic [ref=e165]:
            - paragraph [ref=e166]: "2015"
            - paragraph [ref=e167]: Expanded ophthalmic range — supplying directly to hospitals and clinics
          - generic [ref=e172]:
            - paragraph [ref=e173]: "2021"
            - paragraph [ref=e174]: Chandra Pharma established as dedicated manufacturing arm
          - generic [ref=e178]:
            - paragraph [ref=e179]: "2024"
            - paragraph [ref=e180]: Direct-to-consumer channel launched online
    - generic [ref=e182]:
      - generic [ref=e183]:
        - paragraph [ref=e184]: Why Auberon
        - heading "Built differently. For eye care." [level=2] [ref=e185]:
          - text: Built differently.
          - text: For eye care.
      - generic [ref=e186]:
        - generic [ref=e187]:
          - img [ref=e189]
          - heading "Ophthalmic specialists" [level=3] [ref=e192]
          - paragraph [ref=e193]: Every formulation is developed specifically for ocular care — verified by practising ophthalmologists for clinical precision.
        - generic [ref=e194]:
          - img [ref=e196]
          - heading "GMP-certified manufacturing" [level=3] [ref=e199]
          - paragraph [ref=e200]: Manufactured by Chandra Pharma under strict GMP standards. Every batch is independently tested before it reaches you.
        - generic [ref=e201]:
          - img [ref=e203]
          - heading "Direct supply chain" [level=3] [ref=e208]
          - paragraph [ref=e209]: We supply directly to wholesalers, hospitals, clinics, and consumers — cutting intermediaries and ensuring product integrity.
        - generic [ref=e210]:
          - img [ref=e212]
          - heading "Dedicated support" [level=3] [ref=e216]
          - paragraph [ref=e217]: Our team assists healthcare professionals with product queries, dosage guidance, and bulk procurement enquiries.
    - generic [ref=e219]:
      - paragraph [ref=e220]: Testimonials
      - heading "Trusted by ophthalmologists." [level=2] [ref=e221]
      - generic [ref=e222]:
        - button "Previous" [ref=e223] [cursor=pointer]:
          - img [ref=e224]
        - generic [ref=e227]:
          - generic [ref=e229]:
            - generic [ref=e230]: “
            - paragraph [ref=e231]: Auberon's pricing is transparent and their delivery is always on time. As a distributor, that reliability is everything. We've never had a quality complaint from any of our clients.
            - generic [ref=e232]:
              - generic [ref=e234]: AS
              - generic [ref=e235]:
                - paragraph [ref=e236]: Dr. Arvind Sharma
                - paragraph [ref=e237]: Ophthalmology Distributor, Delhi
          - generic [ref=e239]:
            - generic [ref=e240]: “
            - paragraph [ref=e241]: The Moxifloxacin and Prednisolone combination from Auberon has been a staple in our post-op protocol. Patients recover faster and the tolerability is excellent across all age groups.
            - generic [ref=e242]:
              - generic [ref=e244]: PM
              - generic [ref=e245]:
                - paragraph [ref=e246]: Dr. Priya Menon
                - paragraph [ref=e247]: Cataract Surgeon, Bengaluru
          - generic [ref=e249]:
            - generic [ref=e250]: “
            - paragraph [ref=e251]: What sets Auberon apart is their clinical documentation. Every product comes with detailed composition and contraindication data — exactly what we need for informed prescribing.
            - generic [ref=e252]:
              - generic [ref=e254]: RK
              - generic [ref=e255]:
                - paragraph [ref=e256]: Dr. Rajesh Kulkarni
                - paragraph [ref=e257]: Senior Eye Specialist, Pune
          - generic [ref=e259]:
            - generic [ref=e260]: “
            - paragraph [ref=e261]: Auberon's ophthalmic range has been my go-to for over five years. The antibiotic eye drops are consistently effective and my patients report excellent tolerance.
            - generic [ref=e262]:
              - generic [ref=e264]: SI
              - generic [ref=e265]:
                - paragraph [ref=e266]: Dr. Suresh Iyer
                - paragraph [ref=e267]: Senior Ophthalmologist, Chennai
          - generic [ref=e269]:
            - generic [ref=e270]: “
            - paragraph [ref=e271]: The clinical documentation that comes with every product is exceptional. Dosage clarity, contraindications, composition — exactly what a prescribing physician needs.
            - generic [ref=e272]:
              - generic [ref=e274]: MA
              - generic [ref=e275]:
                - paragraph [ref=e276]: Dr. Meena Agarwal
                - paragraph [ref=e277]: Eye Specialist, Jaipur
          - generic [ref=e279]:
            - generic [ref=e280]: “
            - paragraph [ref=e281]: I've been sourcing from Auberon since they expanded their ophthalmic line. The supply is reliable, quality is consistent, and the team is responsive for bulk orders.
            - generic [ref=e282]:
              - generic [ref=e284]: VN
              - generic [ref=e285]:
                - paragraph [ref=e286]: Dr. Vikram Nair
                - paragraph [ref=e287]: Consultant Ophthalmologist, Kochi
          - generic [ref=e289]:
            - generic [ref=e290]: “
            - paragraph [ref=e291]: Auberon's pricing is transparent and their delivery is always on time. As a distributor, that reliability is everything. We've never had a quality complaint from any of our clients.
            - generic [ref=e292]:
              - generic [ref=e294]: AS
              - generic [ref=e295]:
                - paragraph [ref=e296]: Dr. Arvind Sharma
                - paragraph [ref=e297]: Ophthalmology Distributor, Delhi
          - generic [ref=e299]:
            - generic [ref=e300]: “
            - paragraph [ref=e301]: The Moxifloxacin and Prednisolone combination from Auberon has been a staple in our post-op protocol. Patients recover faster and the tolerability is excellent across all age groups.
            - generic [ref=e302]:
              - generic [ref=e304]: PM
              - generic [ref=e305]:
                - paragraph [ref=e306]: Dr. Priya Menon
                - paragraph [ref=e307]: Cataract Surgeon, Bengaluru
          - generic [ref=e309]:
            - generic [ref=e310]: “
            - paragraph [ref=e311]: What sets Auberon apart is their clinical documentation. Every product comes with detailed composition and contraindication data — exactly what we need for informed prescribing.
            - generic [ref=e312]:
              - generic [ref=e314]: RK
              - generic [ref=e315]:
                - paragraph [ref=e316]: Dr. Rajesh Kulkarni
                - paragraph [ref=e317]: Senior Eye Specialist, Pune
          - generic [ref=e319]:
            - generic [ref=e320]: “
            - paragraph [ref=e321]: Auberon's ophthalmic range has been my go-to for over five years. The antibiotic eye drops are consistently effective and my patients report excellent tolerance.
            - generic [ref=e322]:
              - generic [ref=e324]: SI
              - generic [ref=e325]:
                - paragraph [ref=e326]: Dr. Suresh Iyer
                - paragraph [ref=e327]: Senior Ophthalmologist, Chennai
          - generic [ref=e329]:
            - generic [ref=e330]: “
            - paragraph [ref=e331]: The clinical documentation that comes with every product is exceptional. Dosage clarity, contraindications, composition — exactly what a prescribing physician needs.
            - generic [ref=e332]:
              - generic [ref=e334]: MA
              - generic [ref=e335]:
                - paragraph [ref=e336]: Dr. Meena Agarwal
                - paragraph [ref=e337]: Eye Specialist, Jaipur
          - generic [ref=e339]:
            - generic [ref=e340]: “
            - paragraph [ref=e341]: I've been sourcing from Auberon since they expanded their ophthalmic line. The supply is reliable, quality is consistent, and the team is responsive for bulk orders.
            - generic [ref=e342]:
              - generic [ref=e344]: VN
              - generic [ref=e345]:
                - paragraph [ref=e346]: Dr. Vikram Nair
                - paragraph [ref=e347]: Consultant Ophthalmologist, Kochi
        - button "Next" [ref=e348] [cursor=pointer]:
          - img [ref=e349]
      - generic [ref=e351]:
        - button "Go to testimonial 1" [ref=e352] [cursor=pointer]
        - button "Go to testimonial 2" [ref=e353] [cursor=pointer]
        - button "Go to testimonial 3" [ref=e354] [cursor=pointer]
        - button "Go to testimonial 4" [ref=e355] [cursor=pointer]
        - button "Go to testimonial 5" [ref=e356] [cursor=pointer]
        - button "Go to testimonial 6" [ref=e357] [cursor=pointer]
    - generic [ref=e360]:
      - paragraph [ref=e361]: Coming Soon
      - heading "Auberon Eye Care Centre" [level=2] [ref=e362]
      - paragraph [ref=e363]: Our clinical arm is opening soon in Kanpur. World-class ophthalmic care, backed by 15 years of pharmaceutical precision.
      - generic [ref=e364]:
        - generic [ref=e365]:
          - paragraph [ref=e366]: 5,000+
          - paragraph [ref=e367]: Patients Treated
        - generic [ref=e368]:
          - paragraph [ref=e369]: 15+
          - paragraph [ref=e370]: Years of Expertise
        - generic [ref=e371]:
          - paragraph [ref=e372]: "3"
          - paragraph [ref=e373]: Specialist Doctors
        - generic [ref=e374]:
          - paragraph [ref=e375]: 98%
          - paragraph [ref=e376]: Patient Satisfaction
      - link "Learn More & Book" [ref=e377] [cursor=pointer]:
        - /url: /hospital
    - generic [ref=e379]:
      - paragraph [ref=e380]: Work With Us
      - heading "Become a partner." [level=2] [ref=e381]
      - paragraph [ref=e382]: We supply directly to wholesalers, hospitals, and ophthalmology clinics. If you're looking to stock quality ophthalmic products, let's talk.
      - generic [ref=e383]:
        - generic [ref=e384]:
          - paragraph [ref=e385]: Wholesalers & Distributors
          - heading "Partner with us for bulk supply." [level=3] [ref=e386]
          - paragraph [ref=e387]: Competitive margins, reliable stock, and direct manufacturer pricing on our full ophthalmic range.
          - generic [ref=e388]:
            - link "Sign Up as Wholesaler" [ref=e389] [cursor=pointer]:
              - /url: /signup/wholesale
            - link "Enquire first" [ref=e390] [cursor=pointer]:
              - /url: /support
              - text: Enquire first
              - img [ref=e391]
        - generic [ref=e393]:
          - paragraph [ref=e394]: Doctors & Clinics
          - heading "Stock directly at your clinic." [level=3] [ref=e395]
          - paragraph [ref=e396]: We handle delivery, documentation, and after-sales support so you can focus on your patients.
          - generic [ref=e397]:
            - link "Sign Up as Clinic" [ref=e398] [cursor=pointer]:
              - /url: /signup/clinic
            - link "Enquire first" [ref=e399] [cursor=pointer]:
              - /url: /support
              - text: Enquire first
              - img [ref=e400]
    - generic [ref=e403]:
      - generic [ref=e404]:
        - paragraph [ref=e405]: Eye Health Tools
        - heading "Check your vision health." [level=2] [ref=e406]
        - paragraph [ref=e407]: Try our free preliminary eye health screening tools — developed to help you understand your vision better.
      - generic [ref=e408]:
        - generic [ref=e409]:
          - img [ref=e411]
          - generic [ref=e414]:
            - heading "Colour Blindness Test" [level=3] [ref=e415]
            - paragraph [ref=e416]: Take our Ishihara-style screening test to check for colour vision deficiencies. Takes under 2 minutes.
          - link "Take the Test" [ref=e417] [cursor=pointer]:
            - /url: /eye-tests/colour-blindness
        - generic [ref=e418]:
          - img [ref=e420]
          - generic [ref=e423]:
            - heading "Live Eye Scan" [level=3] [ref=e424]
            - paragraph [ref=e425]: Use your device camera for a preliminary AI-powered screening for conjunctivitis and cataract. Results in under 30 seconds.
          - link "Start Eye Scan" [ref=e426] [cursor=pointer]:
            - /url: /eye-tests/scan
        - generic [ref=e427]:
          - img [ref=e429]
          - generic [ref=e432]:
            - heading "Eye Knowledge Hub" [level=3] [ref=e433]
            - paragraph [ref=e434]: Explore interactive guides on myopia, hyperopia, conjunctivitis, cataract and vision correction options with a 3D eye model.
          - link "Explore Hub" [ref=e435] [cursor=pointer]:
            - /url: /eye-knowledge
    - generic [ref=e437]:
      - paragraph [ref=e438]: Stay Updated
      - heading "Join our community." [level=2] [ref=e439]
      - paragraph [ref=e440]: Get product updates, eye health tips, and exclusive offers delivered to your inbox.
      - generic [ref=e443]:
        - textbox "Email address" [ref=e444]:
          - /placeholder: Enter your email address
        - button "Subscribe" [ref=e445] [cursor=pointer]
  - contentinfo [ref=e446]:
    - generic [ref=e447]:
      - generic [ref=e448]:
        - generic [ref=e449]:
          - paragraph [ref=e450]: Auberon Pharmaceuticals
          - paragraph [ref=e451]: Chandra Pharma
          - paragraph [ref=e452]: Specialised ophthalmic formulations manufactured by Chandra Pharma. Trusted by ophthalmologists, wholesalers, and patients across India since 2010.
        - generic [ref=e453]:
          - paragraph [ref=e454]: Navigate
          - generic [ref=e455]:
            - link "Home" [ref=e456] [cursor=pointer]:
              - /url: /
            - link "Products" [ref=e457] [cursor=pointer]:
              - /url: /products
            - link "Hospital Wing" [ref=e458] [cursor=pointer]:
              - /url: /hospital
            - link "Order Medicine" [ref=e459] [cursor=pointer]:
              - /url: /shop
            - link "Support & FAQ" [ref=e460] [cursor=pointer]:
              - /url: /support
            - link "Admin Portal" [ref=e461] [cursor=pointer]:
              - /url: /admin/login
        - generic [ref=e462]:
          - paragraph [ref=e463]: Contact
          - generic [ref=e464]:
            - generic [ref=e465]:
              - img [ref=e466]
              - generic [ref=e469]: Kanpur, Uttar Pradesh, India
            - generic [ref=e470]:
              - img [ref=e471]
              - link "+91 6307922085" [ref=e473] [cursor=pointer]:
                - /url: tel:+916307922085
            - generic [ref=e474]:
              - img [ref=e475]
              - link "auberon.pharma@gmail.com" [ref=e478] [cursor=pointer]:
                - /url: mailto:auberon.pharma@gmail.com
      - generic [ref=e479]:
        - paragraph [ref=e480]: © 2026 Auberon Pharmaceuticals. All rights reserved.
        - generic [ref=e481]:
          - link "Privacy Policy" [ref=e482] [cursor=pointer]:
            - /url: /support
          - link "Terms of Use" [ref=e483] [cursor=pointer]:
            - /url: /support
  - generic [ref=e484]:
    - generic: Chat with us on WhatsApp
    - button "Open support chat" [ref=e485] [cursor=pointer]:
      - img [ref=e486]
  - button "Open Next.js Dev Tools" [ref=e493] [cursor=pointer]:
    - img [ref=e494]
  - alert [ref=e497]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | // TEST 1 — Homepage loads correctly
  4  | test('homepage loads with key content', async ({ page }) => {
  5  |   await page.goto('/')
  6  |   await expect(page).toHaveTitle(/Auberon/i)
> 7  |   await expect(page.locator('text=Auberon Pharmaceuticals')).toBeVisible()
     |                                                              ^ Error: expect(locator).toBeVisible() failed
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
  47 |   await expect(page.locator('text=FAQ, text=Frequently, text=Help')).toBeVisible()
  48 |   // Contact form should exist
  49 |   await expect(page.locator('input[type="email"]')).toBeVisible()
  50 | })
  51 | 
```