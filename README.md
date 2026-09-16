# Wedding Planner & Budget Management Platform

A modern, full-stack web application designed to streamline wedding planning by connecting clients, certified planners, service vendors, and platform administrators in a unified ecosystem.

---

## 🌟 Key Features

### 👑 Role-Based Dashboards & Access Control
- **Administrator (`ADMIN`)**: Full platform oversight, vendor approval workflows, planner staff provisioning, payment verifications, and global analytics.
- **Certified Planner (`PLANNER`)**: Manage assigned client weddings, budget calculations, vendor coordination, and direct client messaging.
- **Service Vendor (`VENDOR`)**: List services/packages, manage booking requests, track earnings, and apply for verified vendor status.
- **Wedding Client (`CLIENT`)**: Browse packages, calculate wedding budgets, book services, submit deposit payments, and track planning milestones.
- **⚡ Quick Role Switcher**: Instant switching between roles for seamless testing and previewing across accounts.

### 💍 Packages & Vendor Marketplace
- **Curated Packages**: Diamond, Gold, and Silver wedding packages tailored to various budget tiers.
- **Vendor Categories**: Venues, Catering, Photography/Videography, Decoration, Entertainment, and Beauty.
- **Approval Workflow**: Vendors register applications that are reviewed and approved by Administrators before appearing publicly.

### 💳 Payments & Verification
- **Flutterwave Online Checkout**: Direct online payments via cards and mobile money.
- **Bank Slip Deposit Fallback**: Manual deposit slip upload with reference validation and manual admin verification.
- **Automated Payment Status Flow**: Direct visual confirmation and real-time status updates upon payment submission.

### 🔔 Real-Time Notifications & Messaging
- **Dashboard Badges**: Unread message counts, pending vendor applications badge, and pending payment approval alerts.
- **Direct Messaging**: In-app chat connecting clients with assigned planners and vendors.

---

## 🛠️ Technology Stack

- **Frontend**: React, Vite, CSS (Glassmorphism & Modern UI Design)
- **Backend**: Node.js, Express.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT & Bcrypt password hashing
- **Payments**: Flutterwave API & Manual Reference Verification

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rukundo-elie/Wedding-Planner-Platform.git
   cd Wedding-Planner-Platform
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   npx prisma db push
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

---

## 📝 License
This project is developed for IDA Technology Internship. All rights reserved.
