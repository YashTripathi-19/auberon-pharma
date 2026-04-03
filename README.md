# Auberon Pharmaceuticals — Digital Commerce Platform

> A full-stack pharmaceutical e-commerce and operations platform purpose-built for an ophthalmic medicine brand. Designed to serve both end consumers and internal business operations through a unified, production-grade web application.

---

## Overview

Auberon Pharmaceuticals is a digital platform that bridges the gap between a pharmaceutical brand and its customers. The platform enables patients and healthcare professionals to browse a curated catalogue of ophthalmic formulations, place medicine orders online, and receive confirmation and support — all within a seamless, trust-first experience.

On the operational side, the platform provides a dedicated admin suite for managing the full order lifecycle, monitoring business performance through real-time analytics, and maintaining product and customer data — without relying on any third-party CMS or external dashboard tool.

The project is being built with a strong emphasis on clean architecture, real-world business logic, and a premium user experience that reflects the credibility expected of a pharmaceutical brand.

---

## Platform Modules

### Public-Facing Application

**Landing Page**
A conversion-oriented homepage featuring a hero section, live statistics counter, featured product highlights, brand story, trust signals, customer testimonials, and a newsletter capture banner.

**Product Catalogue**
A fully filterable and searchable catalogue of ophthalmic products. Each product includes clinical-grade information — composition, dosage instructions, usage guidelines, side effects, pricing, and stock availability. Products can be explored through a detail modal without leaving the catalogue view.

**Order / Booking Flow**
A cart-based ordering system where users can add multiple products, adjust quantities, and submit a booking with delivery details. Orders are not processed as instant transactions — instead, the team reviews and confirms each order within 24 hours, which suits the regulated nature of pharmaceutical distribution.

**User Authentication**
A complete authentication system with signup, OTP-based email verification, login, and session management. Users must verify their email before accessing protected areas of the platform.

**User Profile & Order History**
Authenticated users have access to a personal profile page where they can manage their account details, select or upload a profile avatar, and view their complete order history with real-time status tracking.

**Support Centre**
A dedicated help page featuring a 24/7 doctor helpline section, an FAQ accordion, a contact form for direct enquiries, and full contact information for the brand.

---

### Admin Operations Suite

**Admin Dashboard**
A protected internal dashboard providing a real-time business overview. Key performance indicators include total orders, today's orders, estimated revenue, active product count, and low-stock alerts. The dashboard also surfaces a sales trend chart, top-performing products table, and a live activity feed of recent orders.

**Analytics Module**
A dedicated analytics page with date-range filtering (7, 30, 90 days). Visualisations include booking trend over time, product performance comparison, category-wise breakdown, and order status distribution. KPIs update dynamically based on the selected range.

**Order Management**
A full order management interface where admins can view all orders, inspect individual order details, and update order status across the lifecycle: Pending → Confirmed → Dispatched → Delivered (or Rejected). Automated expiry logic marks unactioned orders as expired after 24 hours.

**Product Management**
An interface for creating, editing, activating/deactivating, and deleting products. Includes full product form with all clinical fields, image management, pricing, and stock control.

**Contact Enquiry Management**
A view for all inbound contact form submissions, with the ability to mark enquiries as read or resolved.

**Automated Reporting**
A scheduled daily report system that compiles business metrics and delivers a formatted PDF report to the admin via email. The report can also be triggered manually from the dashboard.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| State Management | Zustand |
| Form Handling | React Hook Form |
| Validation | Zod |
| Authentication | JWT via jose, bcryptjs for password hashing |
| Email | Nodemailer |
| PDF Generation | PDFKit |
| Charts | Recharts |
| Icons | Lucide React |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Application                   │
│                                                         │
│  ┌──────────────────┐      ┌──────────────────────────┐ │
│  │   Public Routes  │      │     Admin Routes         │ │
│  │                  │      │  (JWT-protected)         │ │
│  │  /               │      │  /admin                  │ │
│  │  /products       │      │  /admin/orders           │ │
│  │  /shop           │      │  /admin/products         │ │
│  │  /login          │      │  /admin/analytics        │ │
│  │  /signup         │      │  /admin/contacts         │ │
│  │  /profile        │      │                          │ │
│  │  /support        │      └──────────────────────────┘ │
│  └──────────────────┘                                   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │                  API Layer                        │   │
│  │  /api/auth/*   — User auth & session management  │   │
│  │  /api/orders   — Order placement                 │   │
│  │  /api/contact  — Contact form submissions        │   │
│  │  /api/admin/*  — Protected admin operations      │   │
│  │  /api/admin/cron/* — Scheduled automation        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Data & Services Layer                │   │
│  │  JSON-based data store (file system)             │   │
│  │  Nodemailer — OTP & report email delivery        │   │
│  │  PDFKit — Report generation                      │   │
│  │  bcryptjs — Password hashing                     │   │
│  │  jose — JWT signing & verification               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Development Roadmap

### Phase 1 — Core Platform Foundation
- [x] Project scaffolding with Next.js App Router and TypeScript
- [x] Global design system — typography, colour palette, spacing, component tokens
- [x] Responsive layout with Navbar and Footer
- [x] Landing page with all sections
- [x] Product catalogue with filtering, search, and detail modal
- [x] File-system data layer for products, orders, users, and contacts

### Phase 2 — Commerce & Authentication
- [x] Cart system with Zustand state management
- [x] Order booking flow with delivery details form
- [x] Order confirmation page
- [x] User signup with OTP email verification
- [x] User login with JWT session management
- [x] Protected profile page with order history
- [x] Profile editing with avatar selection and photo upload

### Phase 3 — Admin Operations Suite
- [x] Admin authentication with secret-key login
- [x] Admin dashboard with KPI cards, sales chart, top products, activity feed
- [x] Low stock alert system
- [x] Order management with full status lifecycle
- [x] Product management with create / edit / delete
- [x] Contact enquiry management
- [x] Automated 24-hour order expiry via cron endpoint
- [x] Analytics page with date-range filtering and multiple chart types
- [x] Daily report generation (PDF) and email delivery

### Phase 4 — Production Readiness *(Planned)*
- [ ] Migrate data layer from file system to a persistent database (PostgreSQL / MongoDB)
- [ ] Integrate a real payment gateway (Razorpay / Stripe)
- [ ] Add SMS-based OTP as an alternative to email verification
- [ ] Implement role-based access control for multi-admin support
- [ ] Add product image upload with cloud storage (S3 / Cloudinary)
- [ ] SEO enhancements — structured data, Open Graph, sitemap
- [ ] Performance optimisation — image optimisation, lazy loading, caching strategy
- [ ] End-to-end testing suite
- [ ] CI/CD pipeline setup
- [ ] Production deployment on Vercel with environment configuration

---

## Domain Context

All products on the platform are ophthalmic pharmaceutical formulations — a specialised category that includes antibiotic eye drops, corticosteroid drops, lubricating drops, glaucoma medications, and anti-inflammatory agents. The platform is designed with this clinical context in mind: product pages surface full composition, dosage protocols, and side effect profiles rather than generic e-commerce descriptions.

The ordering model is intentionally non-transactional at this stage — orders are treated as bookings that require human confirmation, which aligns with the compliance and verification requirements typical in pharmaceutical distribution.

---

## Author

**Yash Tripathi**
Full-Stack Developer
[GitHub](https://github.com/YashTripathi-19)
