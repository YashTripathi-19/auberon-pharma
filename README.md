# Auberon Pharmaceuticals

A full-stack pharmaceutical e-commerce platform specialising in ophthalmic medicines — built for patients, wholesalers, and clinics across India.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion
- Recharts
- Zustand
- React Hook Form + Zod
- Jose (JWT)
- Nodemailer
- Bcryptjs
- Razorpay
- File-based data storage (JSON)

## Features

### Public Site

- Product catalogue with category, subcategory and form filters
- Online medicine ordering with cart and bulk denomination options
- Checkout with SGST/CGST, handling charges, coupon codes
- Role-based pricing (Customer / Wholesaler / Clinic)
- Razorpay payment gateway integration
- Wishlist with restock notifications
- Hospital wing with appointment booking
- Eye health tools (colour blindness test, AI eye scanner)
- Interactive eye knowledge hub with 3D anatomy model
- Partners & sponsors directory
- Newsletter subscription
- Help centre with FAQ and contact form

### Auth System

- Three-role authentication (Customer / Wholesaler / Clinic)
- Email OTP verification
- Google reCAPTCHA v3
- JWT sessions with secure httpOnly cookies
- Brute force protection + rate limiting

### Admin Panel

- Dashboard with KPI cards and analytics
- Full product CRUD with category management
- Order lifecycle management with status emails
- Customer and business verification flows
- Coupon and discount management
- Restock request management
- Feedback viewer
- Affiliated hospitals and partners management
- Newsletter blast with role targeting
- Daily PDF business reports

### Communications

- Branded HTML email templates (Nodemailer + Gmail SMTP)
- WhatsApp deep link integration
- Payment slip with UPI QR code generation
- Post-order feedback collection
- Restock notification emails

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/YashTripathi-19/auberon-pharma
cd auberon-pharma
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
GMAIL_USER=your-gmail
GMAIL_APP_PASSWORD=your-app-password
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── admin/        # Admin panel
│   ├── api/          # API routes
│   └── ...           # Public pages
├── components/       # Reusable React components
├── lib/              # Utilities (auth, db, email, etc.)
└── store/            # Zustand state management
data/                 # JSON data files
public/               # Static assets
tests/                # Playwright smoke tests
```

## Deployment

Live at [auberon-pharma.vercel.app](https://auberon-pharma.vercel.app) — deployment documentation.

## License

Private — All rights reserved. Auberon Pharmaceuticals.
