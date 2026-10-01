# 💍 Wedding Planner & Budget Management Platform
## Complete Official System Documentation & Management Manual

> **Prepared for:** Company Owner, Executive Stakeholders, System Administrators & Operations Team  
> **Platform Version:** 1.0.0  
> **Date:** October 2026  

---

## 📑 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [System Architecture & Technology Stack](#2-system-architecture--technology-stack)
3. [User Roles & Access Control Matrix](#3-user-roles--access-control-matrix)
4. [Core Platform Features & Workflows](#4-core-platform-features--workflows)
   - [4.1 Authentication & Security](#41-authentication--security)
   - [4.2 Client Journey: Wedding Packages & Budget Planner](#42-client-journey-wedding-packages--budget-planner)
   - [4.3 Vendor Marketplace & Approval Queue](#43-vendor-marketplace--approval-queue)
   - [4.4 Certified Planner Tasks & Client Management](#44-certified-planner-tasks--client-management)
   - [4.5 Dual Payment System (Online & Manual Bank Transfer)](#45-dual-payment-system-online--manual-bank-transfer)
   - [4.6 Communication & Real-time Notification Summary](#46-communication--real-time-notification-summary)
5. [Database Architecture & Schema Reference](#5-database-architecture--schema-reference)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Environment Configuration (`.env`)](#7-environment-configuration-env)
8. [Installation, Operations & Deployment Guide](#8-installation-operations--deployment-guide)
9. [Troubleshooting & Maintenance FAQ](#9-troubleshooting--maintenance-faq)

---

## 1. Executive Summary

The **Wedding Planner & Budget Management Platform** is a state-of-the-art, multi-tenant digital ecosystem engineered to streamline wedding planning in Rwanda and beyond. The platform brings together four key stakeholders: **Wedding Clients**, **Certified Wedding Planners**, **Service Vendors**, and **Platform Administrators**.

### Business Objectives & Value Delivered:
- **For Company Owners & Executives:** Complete oversight over revenue generation, booking statistics, vendor listings, platform bank configuration, and operational analytics.
- **For Wedding Clients:** Simplified package browsing, transparent budget estimation, vendor discovery, secure deposit payments, and direct communication with assigned planners.
- **For Certified Planners:** Tools to track assigned wedding projects, assign tasks with deadlines, manage vendor coordination, and monitor milestone completions.
- **For Vendors:** Public business exposure, direct lead generation, transparent pricing listings, and booking request management.

---

## 2. System Architecture & Technology Stack

The platform is designed following modern software architectural principles with a decoupled client-server architecture:

```
+-----------------------------------------------------------------------+
|                              CLIENT UI                                |
|             React 18 + Vite + Tailwind CSS + Lucide Icons             |
+-----------------------------------------------------------------------+
                                   |
                             REST API (JSON)
                                   |
+-----------------------------------------------------------------------+
|                              BACKEND API                              |
|           Node.js + Express.js + JWT Auth + Nodemailer/Resend          |
+-----------------------------------------------------------------------+
                                   |
                            Prisma ORM Client
                                   |
+-----------------------------------------------------------------------+
|                               DATABASE                                |
|                            MySQL Database                             |
+-----------------------------------------------------------------------+
```

### Core Technologies:
- **Frontend Framework:** React 18 with Vite for ultra-fast rendering and responsive glassmorphism UI design.
- **Backend API:** Node.js runtime with Express.js framework handling routing, validation, security headers, and business logic.
- **Database Layer:** MySQL relational database managed via Prisma ORM for type-safe queries and automated schema migrations.
- **Security & Auth:** JSON Web Tokens (JWT) for stateless authentication, `bcryptjs` for multi-pass password hashing, and SHA-256 hashed one-time tokens for email-based password resets.
- **Payment Gateways:** Integrated online payment processing via Flutterwave API alongside manual Bank Transfer Reference Slip uploads with admin verification.
- **Email Delivery:** Resend API integration with Nodemailer SMTP fallback for sending transactional password reset emails.

---

## 3. User Roles & Access Control Matrix

The platform enforces strict Role-Based Access Control (RBAC) across four user roles:

| Feature / Capability | Administrator (`ADMIN`) | Certified Planner (`PLANNER`) | Vendor (`VENDOR`) | Client (`CLIENT`) |
| :--- | :---: | :---: | :---: | :---: |
| **System Analytics & Revenue Reports** | ✅ Full | ❌ No | ❌ No | ❌ No |
| **Provision Planner Staff Accounts** | ✅ Full | ❌ No | ❌ No | ❌ No |
| **Review & Approve/Reject Vendors** | ✅ Full | ❌ No | ❌ No | ❌ No |
| **Verify Bank Payment Slips** | ✅ Full | ❌ No | ❌ No | ❌ No |
| **Manage Platform Bank Account Info** | ✅ Full | ❌ No | ❌ No | ❌ No |
| **Create & Edit Wedding Packages** | ✅ Full | ❌ No | ❌ No | ❌ No |
| **Manage Assigned Wedding Projects** | ✅ All | ✅ Assigned Only | ❌ No | ❌ Own Booking |
| **Manage Vendor Directory Listing** | ✅ Full | ❌ No | ✅ Own Profile | ❌ No |
| **Book Wedding Package & Custom Services** | ❌ No | ❌ No | ❌ No | ✅ Full |
| **Submit Online/Bank Slip Payment** | ❌ No | ❌ No | ❌ No | ✅ Full |
| **In-App Messaging** | ✅ All | ✅ Assigned Clients | ✅ Inquiry Leads | ✅ Planners & Vendors |

---

## 4. Core Platform Features & Workflows

### 4.1 Authentication & Security
- **Registration:** Users sign up as **Clients** or **Vendors**. Vendors are automatically created in `PENDING` status awaiting admin review.
- **Google OAuth Integration:** Support for 1-click Google Sign-In (`googleLogin`).
- **Secure Email Password Reset:** 
  1. Client clicks "Forgot password?" on `/login`.
  2. Enters registered email. The server generates a 32-byte secure token and dispatches an HTML email via Resend or Gmail SMTP.
  3. The website instructs the user to check their email inbox.
  4. The user clicks the link in their email (`/reset-password?token=...`) to choose a new password.

### 4.2 Client Journey: Wedding Packages & Budget Planner
- **Package Selection:** Clients browse curated packages (e.g., Diamond, Gold, Silver) with transparent feature lists and pricing.
- **Custom Budget Calculator:** Clients can enter their estimated budget and guest count to calculate cost distribution across venues, catering, decoration, photography, and entertainment.
- **Service Booking:** Instant booking submission with preferred wedding date and deposit calculation.

### 4.3 Vendor Marketplace & Approval Queue
- **Vendor Directory (`/vendors`):** Public directory sorted by categories (Venues, Caterers, Decorators, Photographers, DJs, Transport, Makeup Artists, Wedding Cakes).
- **Admin Approval Queue:** When a vendor registers, they enter `PENDING` state. Administrators review their application in the Admin Console and click **"Approve & List"** or **"Reject"**.

### 4.4 Certified Planner Tasks & Client Management
- **Planner Staff Provisioning:** Admins create Certified Planner staff accounts directly from the Admin Console.
- **Task Management:** Planners create structured tasks for bookings (e.g., "Confirm Venue Reservation", "Taste Catering Menu") with deadlines and track status (`PENDING`, `IN_PROGRESS`, `COMPLETED`).

### 4.5 Dual Payment System (Online & Manual Bank Transfer)
1. **Online Payment (Flutterwave):** Direct credit/debit card and mobile money payment processing.
2. **Bank Transfer / Slip Deposit:**
   - Client views official company bank details (e.g., Bank of Kigali account number).
   - Uploads deposit slip image and transaction reference number.
   - Payment enters `PENDING` state.
   - Administrator reviews the deposit slip in **Verify Payments** tab and clicks **"Verify & Confirm"**.

### 4.6 Communication & Real-time Notification Summary
- **Notification Summary API (`/api/notifications/summary`):** Provides live badge count for unread messages, pending vendor applications, and unverified payment slips.
- **In-App Messaging:** Direct messaging interface connecting clients with assigned planners and vendors.

---

## 5. Database Architecture & Schema Reference

The database consists of 10 interconnected tables managed by Prisma:

### Table Definitions Summary:
1. **`User`**: System accounts (`id`, `name`, `email`, `phone`, `password`, `role`).
2. **`PasswordResetToken`**: Password reset tokens (`tokenHash`, `expiresAt`, `userId`).
3. **`Package`**: Platform wedding packages (`name`, `description`, `price`, `image`).
4. **`Vendor`**: Service provider listings (`name`, `service`, `price`, `location`, `isApproved`, `status`).
5. **`Booking`**: Client wedding bookings (`userId`, `packageId`, `budget`, `date`, `status`, `paymentStatus`).
6. **`Payment`**: Payment transactions (`bookingId`, `amount`, `method`, `transactionId`, `status`, `slipImage`).
7. **`Task`**: Planner project tasks (`bookingId`, `plannerId`, `task`, `deadline`, `status`).
8. **`Message`**: In-app chat messages (`senderId`, `receiverId`, `content`, `isRead`).
9. **`ContactMessage`**: Public contact inquiries (`name`, `email`, `subject`, `message`, `isRead`).
10. **`BankSetting`**: Official platform bank details (`bankName`, `accountName`, `accountNumber`, `instructions`).

---

## 6. API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create user or vendor account.
- `POST /api/auth/login` - Authenticate user and issue JWT.
- `POST /api/auth/forgot-password` - Request password reset email.
- `POST /api/auth/reset-password` - Update password using token.
- `POST /api/auth/google` - Sign in via Google OAuth.

### Packages (`/api/packages`)
- `GET /api/packages` - Retrieve all active wedding packages.
- `POST /api/packages` - Create new package (Admin only).
- `PUT /api/packages/:id` - Edit package (Admin only).
- `DELETE /api/packages/:id` - Delete package (Admin only).

### Vendors (`/api/vendors`)
- `GET /api/vendors` - List approved public vendors.
- `GET /api/vendors?all=true` - List all vendors including pending (Admin only).
- `PATCH /api/vendors/:id/approve` - Approve vendor listing (Admin only).
- `PATCH /api/vendors/:id/reject` - Reject vendor listing (Admin only).

### Payments (`/api/payments`)
- `GET /api/payments` - Retrieve payment records (Admin/Planner).
- `POST /api/payments` - Submit payment or bank slip.
- `PATCH /api/payments/:id/verify` - Confirm bank deposit slip (Admin only).

### Admin Operations (`/api/admin`)
- `GET /api/reports` - Platform analytics and total revenue report.
- `GET /api/admin/planners` - List certified planner staff.
- `POST /api/admin/planners` - Provision new planner staff account.
- `GET /api/admin/bank-settings` - Retrieve active bank configuration.
- `PUT /api/admin/bank-settings` - Update platform bank account details.

---

## 7. Environment Configuration (`.env`)

To run the application, configure `server/.env` with the following key-value pairs:

```env
# Server Port & Node Environment
PORT=5000
NODE_ENV=production

# Database Connection (MySQL)
DATABASE_URL="mysql://root:password@localhost:3306/wedding_planner_db"

# JWT Secret Key
JWT_SECRET="wedding_planner_super_secret_jwt_key_2026"

# Frontend Application URL
CLIENT_URL="http://localhost:5173"

# Email Provider Configuration (Resend API)
RESEND_API_KEY="re_123456789_your_key_here"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# Alternative: Gmail SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_company_email@gmail.com"
SMTP_PASS="your_16_digit_app_password"

# Flutterwave Payment Gateway (Optional)
FLW_PUBLIC_KEY="FLWPUBK_TEST-xxxxxxxx"
FLW_SECRET_KEY="FLWSECK_TEST-xxxxxxxx"
```

---

## 8. Installation, Operations & Deployment Guide

### Local Development Setup:
1. **Clone & Install Dependencies:**
   ```bash
   git clone https://github.com/Rukundo-elie/Wedding-Planner-Platform.git
   cd Wedding-Planner-Platform
   ```
2. **Setup Server:**
   ```bash
   cd server
   npm install
   npx prisma db push
   npm run seed
   npm run dev
   ```
3. **Setup Client:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
4. **Access Website:** Open `http://localhost:5173` in browser.

### Production Deployment Strategy:
- **Database:** Managed MySQL instance (AWS RDS, PlanetScale, or DigitalOcean).
- **Backend Service:** Deployed on Render / Railway / AWS EC2 (`npm start`).
- **Frontend Service:** Deployed on Vercel or Netlify (with SPA rewrite configuration).

---

## 9. Troubleshooting & Maintenance FAQ

1. **How do I log in as Administrator?**
   - Use the seeded admin account or set `role = 'ADMIN'` on your user record in MySQL.
2. **What happens if no email service is configured?**
   - The password reset link is safely printed to the server terminal console for manual verification.
3. **How do I update company bank details for client deposit slips?**
   - Log in as Administrator, go to **Admin Console** -> **Bank Account Config** tab, edit the bank details, and click Save.

---

## 10. Future Development & Production Scaling Roadmap

To transition this platform from a prototype to a full commercial release, the following strategic upgrades and enhancements are recommended for company leadership:

### 🌐 10.1 Production Hosting & Custom Domain Acquisition
- **Custom Domain Name:** Acquire an official business domain (e.g., `www.weddingplanner.rw` or `www.weddingplanner.com`).
- **Enterprise Hosting Platform:** Migrate from developer free tiers to high-availability production cloud infrastructure:
  - **Database:** Managed MySQL instance (AWS RDS / DigitalOcean / PlanetScale) with automated daily backups.
  - **Backend API:** Dedicated server deployment (AWS EC2 / Render Pro / Railway) with SSL security certificates.
  - **Frontend Client:** High-speed Global CDN deployment (Vercel Production / Netlify / Cloudflare Pages).
- **SSL / HTTPS Certificates:** Enforce TLS 1.3 encryption across all API routes and client traffic.

### 🏢 10.2 Official Company Branding & Contact Migration
- **Corporate Email Setup:** Transition system notification emails from developer test addresses to official domain emails (e.g., `support@weddingplanner.rw`, `info@weddingplanner.rw`).
- **Company Identity Update:** Replace developer test addresses and sample contact details with official corporate physical headquarters, customer service hotlines, and social media handles across all email templates and website footers.

### 🚀 10.3 Planned Feature Enhancements
1. **Native Mobile Applications (iOS & Android):**
   - Develop companion iOS and Android mobile apps using React Native / Flutter for real-time mobile push notifications for bookings, messages, and task updates.
2. **Direct Mobile Money USSD Integration:**
   - Integrate native MTN MoMo & Airtel Money Direct USSD Push (STK Prompt) for instant 1-click deposit payments in Rwanda.
3. **Calendar & Appointment Synchronization:**
   - Integrate Google Calendar / Outlook API so certified planners and vendors automatically sync site visits and wedding appointment schedules.
4. **Verified Client Review & Rating System:**
   - Enable verified clients to submit star ratings and detailed reviews for vendors post-wedding date to build platform trust.
5. **Multi-Language Support (Localization):**
   - Add language toggles for **Kinyarwanda**, **French**, and **English** across the public portal and client dashboards.

---

*Documentation compiled and maintained for Wedding Planner Platform.*
