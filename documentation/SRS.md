# Software Requirements Specification (SRS)
## Project: Wedding Planner & Budget Management Platform

---

## 1. Introduction

### 1.1 Purpose
This document provides a detailed description of the system requirements for the **Wedding Planner & Budget Management Platform**. It outlines functional and non-functional requirements, user class details, and architectural layouts.

### 1.2 Scope
The application is designed to consolidate wedding planning services into a single online portal. Couples can budget, browse packages, select vendors, book schedules, and make payments online. Planners can track tasks and coordinate details. Admins manage the platform registry.

### 1.3 Definitions & Abbreviations
- **MoMo**: Mobile Money (MTN Rwanda)
- **JWT**: JSON Web Token
- **ORM**: Object-Relational Mapping (Prisma)
- **CRUD**: Create, Read, Update, Delete

---

## 2. Overall Description

### 2.1 Product Perspective
The Wedding Planner & Budget Management Platform functions as an all-in-one coordination ecosystem. It connects clients to professional planners, while planners integrate third-party vendors (venues, decorators, photography) to deliver the event.

### 2.2 User Classes & Roles
1. **Client (Bride/Groom)**: Sets a date/budget, purchases packages, makes payments, updates checklist progress, and chats with their planner.
2. **Wedding Planner**: Oversees assigned weddings, defines/updates checklist tasks, sets deadlines, and chats with clients.
3. **Administrator**: Oversees analytics dashboards, manages packages, and manages the vendor directory registry.

### 2.3 Operating Environment
- **Client/Frontend**: Modern web browsers (Chrome, Edge, Safari, Firefox) via React + Vite.
- **Server/Backend**: Node.js + Express runtime.
- **Database**: MySQL Server.

---

## 3. System Features & APIs

### 3.1 Authentication & Registration
- **Description**: Secure register and login.
- **API Endpoints**:
  - `POST /api/auth/register` (Register a new account)
  - `POST /api/auth/login` (Authenticate and obtain a JWT)

### 3.2 Wedding Budget Calculator
- **Description**: Automatically divides client budgets into recommended allocations:
  - Venue: 30%
  - Food & Catering: 24%
  - Decoration: 16%
  - Photography: 10%
  - Transport: 6%
  - Music: 4%
  - Emergency Fund: 10%

### 3.3 Packages & Booking
- **Description**: Browse packages (Silver, Gold, Diamond) and submit a wedding date to create a booking.
- **API Endpoints**:
  - `GET /api/packages` (Fetch packages)
  - `POST /api/bookings` (Create a booking - Client)
  - `GET /api/bookings` (View assigned bookings - Client/Planner/Admin)
  - `PUT /api/bookings/:id` (Update booking status - Planner/Admin)

### 3.4 Vendor Directory
- **Description**: Manage a marketplace registry of available photographers, decorators, etc.
- **API Endpoints**:
  - `GET /api/vendors` (Browse vendors with category filters)
  - `POST /api/vendors` (Add new vendor - Admin)
  - `PUT /api/vendors/:id` (Edit vendor details - Admin)
  - `DELETE /api/vendors/:id` (Remove vendor - Admin)

### 3.5 Simulated Payment Portal
- **Description**: Allows checkout via MoMo, Airtel Money, or Card, changing booking status to Paid and Confirmed.
- **API Endpoints**:
  - `POST /api/payments` (Process simulated payment)
  - `GET /api/payments` (Retrieve receipts history)

### 3.6 Checklist Task Manager
- **Description**: Triggers a pre-seeded task checklist upon booking creation. Planners can add custom tasks, assign deadlines, and mark tasks complete.
- **API Endpoints**:
  - `GET /api/tasks/booking/:bookingId` (List checklist tasks)
  - `POST /api/tasks/booking/:bookingId` (Add custom task)
  - `PUT /api/tasks/:id` (Change task status)

### 3.7 Messaging System
- **Description**: Direct message boards between clients and planners.
- **API Endpoints**:
  - `POST /api/messages` (Send message)
  - `GET /api/messages/history/:otherUserId` (Retrieve chat history)

---

## 4. Database Schema Design (Prisma Model ERD)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  phone     String?
  password  String
  role      Role     @default(CLIENT)
  createdAt DateTime @default(now())
}

model Package {
  id          Int      @id @default(autoincrement())
  name        String
  description String   @db.Text
  price       Float
  image       String?
  createdAt   DateTime @default(now())
}

model Vendor {
  id        Int      @id @default(autoincrement())
  name      String
  service   String
  phone     String?
  email     String?
  price     Float
  location  String?
  createdAt DateTime @default(now())
}

model Booking {
  id            Int           @id @default(autoincrement())
  userId        Int
  packageId     Int?
  budget        Float
  date          DateTime
  status        BookingStatus @default(PENDING)
  paymentStatus PaymentStatus @default(PENDING)
  createdAt     DateTime      @default(now())
}
```

---

## 5. Non-Functional Requirements

### 5.1 Security
- Password credentials are encrypted using `bcryptjs` before DB write.
- Secured routes require a valid HTTP Bearer token verified using `jsonwebtoken`.

### 5.2 Performance & Scalability
- Relational indices on foreign keys are handled automatically by database foreign constraint indexes.
- Database connections use pooling (limit: 5 connections) to minimize connection latency.
