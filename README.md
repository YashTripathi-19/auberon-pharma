# Auberon Pharmaceuticals — Digital Commerce Platform

> A full-stack pharmaceutical e-commerce and operations platform purpose-built for an ophthalmic medicine brand. Designed to serve both end consumers and internal business operations through a unified, production-grade web application.

---

## Overview

Auberon Pharmaceuticals is a digital platform that bridges the gap between a pharmaceutical brand and its customers. The platform enables patients and healthcare professionals to browse a curated catalogue of ophthalmic formulations, place medicine orders online, and receive support — all within a seamless, trust-first experience.

On the operational side, the platform provides a dedicated admin suite for managing orders, monitoring business performance, and maintaining product and customer data.

This project is currently in active development, started April 2026.

---

## Key Features

### Public-Facing Application

- **Landing Page** — Hero section, brand story, featured products, trust signals, testimonials, and newsletter capture
- **Product Catalogue** — Filterable and searchable catalogue of ophthalmic products with clinical-grade product information
- **Order / Booking Flow** — Cart-based ordering with delivery details; orders are reviewed and confirmed by the team within 24 hours
- **User Authentication** — Signup, email verification, login, and session management
- **User Profile & Order History** — Account management and real-time order status tracking
- **Support Centre** — Doctor helpline, FAQ, and contact form

### Admin Operations Suite

- **Dashboard** — Business KPIs, sales trends, top products, and activity feed
- **Order Management** — Full order lifecycle management with status updates
- **Product Management** — Create, edit, and manage the product catalogue
- **Analytics** — Date-range filtered visualisations and performance metrics
- **Automated Reporting** — Scheduled daily business reports via email

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Application                   │
│                                                         │
│  ┌──────────────────┐      ┌──────────────────────────┐ │
│  │  Public Routes   │      │     Admin Routes         │ │
│  │  (Customer-      │      │  (Protected Operations   │ │
│  │   Facing)        │      │   Dashboard)             │ │
│  └──────────────────┘      └──────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │                   API Layer                       │   │
│  │   Auth · Orders · Products · Admin · Automation  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │             Data & Services Layer                 │   │
│  │   Database · Email · PDF Reports · Auth Services  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

Built with Next.js, TypeScript, and Tailwind CSS.

---

## Domain Context

All products on the platform are ophthalmic pharmaceutical formulations — a specialised category including antibiotic eye drops, corticosteroid drops, lubricating drops, glaucoma medications, and anti-inflammatory agents. Product pages are designed to surface clinical information relevant to patients and healthcare professionals.

The ordering model is intentionally non-transactional at this stage — orders are treated as bookings requiring human confirmation, aligning with compliance requirements typical in pharmaceutical distribution.

---

## Author

**Yash Tripathi**
Full-Stack Developer
[GitHub](https://github.com/YashTripathi-19)

---

*Project started: April 2026. Active development in progress.*
