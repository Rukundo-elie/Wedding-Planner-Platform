# Final Internship Project Report
## System: Wedding Planner & Budget Management Platform
## Student: Elie Rukundo
## University: University of Rwanda (UR)
## Host Company: IDA Technology

---

## Executive Summary
This report summarizes the design, development, and testing of the **Wedding Planner & Budget Management Platform** completed during my software engineering internship at IDA Technology. The platform serves as an online wedding coordination portal, helping couples calculate wedding cost breakdowns, book curated packages, upload cover details, simulated payment portals, and track checklist milestones in close coordination with a professional wedding planner. The system was successfully built using a modern stack: React frontend with Tailwind CSS v4, Node.js/Express backend API, and a MySQL database connected via Prisma 7.

---

## 1. Project Background & Problem Statement

### 1.1 Background
Wedding preparation is traditionally a stressful, manual process involving fragmented communication with vendors, unpredictable costs, and complicated task coordination. Couples in Rwanda must contact hotels, photographers, DJs, and transportation providers individually, resulting in excessive logistics coordination overhead.

### 1.2 Problem Statement
There is a lack of centralized platforms that allow clients to plan weddings within a specific budget limit. Existing solutions do not offer automated cost estimates or direct tracking of planning tasks. IDA Technology commissioned this project to provide a unified web-based application that offers couples:
- Curated wedding packages (Silver, Gold, Diamond).
- Interactive, percentage-based budget calculations.
- Seamless booking and online payment checkout.
- Task management and direct chat rooms with dedicated event planners.

---

## 2. Objectives & Scope

### 2.1 Core Objectives
1. **Automate budgeting**: Provide a tool that takes a budget amount and immediately allocates appropriate percentages to venue, food, decor, photography, and transport.
2. **Consolidate Vendor Bookings**: Enable users to book a single complete package (e.g. Silver) with a single online payment rather than hiring vendors separately.
3. **Event Checklist Management**: Establish a task checklist to monitor preparations.
4. **Platform Registry Control**: Provide administrative controls for packages, vendors, and revenue charts.

### 2.2 Project Scope
The scope covers:
- JWT registration and login for clients, planners, and administrators.
- Public web views displaying package descriptions and featured vendor directories.
- Three secured dashboards with role-specific views.

---

## 3. Development Methodology (SDLC)

We followed the **Software Development Life Cycle (SDLC)**:
1. **Requirement Analysis**: Prepared the Software Requirements Specification (SRS).
2. **System Design**: Defined the database schema, entity-relation layout, and UML sequence/activity diagrams.
3. **Development**: Built the React frontend components, Express backend endpoints, and integrated them.
4. **Testing**: Formulated test cases covering all boundary parameters (TC_AUTH, TC_CALC, TC_BOOK, TC_PAY).
5. **Documentation**: Drafted the user manuals and compiled this final project report.

---

## 4. System Architecture & Database Design

### 4.1 Technology Stack
- **Frontend**: React, React Router DOM, Tailwind CSS v4, Axios, Lucide Icons.
- **Backend**: Node.js, Express, JWT, bcryptjs.
- **Database ORM**: Prisma 7 connected to MySQL database using the new native `PrismaMariaDb` driver adapter.

### 4.2 Database Schema Relations
The MySQL database is composed of seven relational tables:
1. `User`: Holds user credentials and roles (`CLIENT`, `PLANNER`, `ADMIN`).
2. `Package`: Registry of curated wedding packages (price, descriptions).
3. `Vendor`: Catalog of venues, caterers, photographers.
4. `Booking`: Links user bookings to selected packages, tracking wedding date, status, and custom cover images.
5. `Payment`: Stores payment receipts and transaction IDs.
6. `Task`: Tracking checklist items for each wedding.
7. `Message`: Stores user chat dialogues.

---

## 5. Implementations & Key Achievements

### 5.1 Dynamic Budget Calculator
Clients can enter their budget in their workspace. The UI automatically runs cost splits: 30% for Venue, 24% for Catering, 16% for Decor, 10% for Photography, 6% for Transport, 4% for Music, and 10% for Emergency funds.

### 5.2 Interlocking Wedding Rings Logo
A custom, vector-based SVG logo representing two interlocking gold bands with a blue diamond gem was built as a reusable React component (`WeddingRingIcon.jsx`). This was integrated across all UI headers, login cards, and encoded as an inline SVG data URL favicon on the browser tab.

### 5.3 Photo Upload Integration
We extended the schema with a `Booking.image` field. Using the HTML5 `FileReader` API, clients can upload couple photos or style inspirations. The file is encoded as a Base64 string and stored in the database, updating the workspace header banner.

---

## 6. Self-Reflection & Key Learnings

This internship project provided invaluable experience in full-stack JavaScript development and system modeling:
- **Modern Database Adaptations**: Working with Prisma 7, I learned how to migrate connection details to `prisma.config.ts` and set up the new runtime driver adapters (`@prisma/adapter-mariadb`) required for node-based database drivers.
- **React 19 State Binding**: Encountered and resolved React 19's strict comparison changes in dropdown select lists. By ensuring option values are strictly mapped as strings, I eliminated select binding issues.
- **Project Coordination**: Practiced the complete software development lifecycle, from drafting formal specification documents to testing and deployment setups.

---

## 7. Conclusion
The Wedding Planner & Budget Management Platform was successfully designed, developed, and verified. It provides a robust, professional coordination solution for couples in Rwanda, satisfying all requirement objectives set by IDA Technology.
