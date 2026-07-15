# System Test Cases
## Wedding Planner & Budget Management Platform

This document presents the system test cases covering user authentication, budget calculations, package bookings, cover photo uploads, payments, task management, and chat features.

---

## 1. Authentication & Role Authorization Tests

| Test Case ID | Feature | Description | Preconditions | Input / Steps | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_AUTH_01** | Signup | User registers a new client profile. | DB is online. | 1. Go to register page.<br>2. Enter name, email, phone.<br>3. Pick password.<br>4. Select role CLIENT.<br>5. Click Register. | User is created in database, password is encrypted, JWT token is returned, user is routed to Client Dashboard. | **PASS** |
| **TC_AUTH_02** | Signup Validation | Duplicate email registration prevention. | User with email already exists in DB. | 1. Attempt signup with existing email. | API returns `400 Bad Request` with message "A user with this email already exists." | **PASS** |
| **TC_AUTH_03** | Login | Validate successful login with seeded credentials. | Seeder ran successfully on start. | 1. Enter email: `admin@wedding.com`<br>2. Enter password: `admin123`<br>3. Click Sign in. | Token generated successfully. User is routed directly to the Admin Dashboard. | **PASS** |
| **TC_AUTH_04** | Auth Protection | Enforce login for dashboard access. | User is logged out. | 1. Attempt navigating directly to URL `http://localhost:5173/client`. | ProtectedRoute intercepts. User is redirected to `/login`. | **PASS** |

---

## 2. Budget Calculator Tests

| Test Case ID | Feature | Description | Preconditions | Input / Steps | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_CALC_01** | Calculator | Dynamic budget breakdown allocation checks. | Client Dashboard loaded. | 1. Navigate to Budget Planner tab.<br>2. Enter budget: `5000000`. | Calculations run in UI: Venue shows 1,500,000 RWF (30%), Catering shows 1,200,000 RWF (24%), Decor shows 800,000 RWF (16%). | **PASS** |
| **TC_CALC_02** | Calculator Type | Prevent letters / negative numbers in budget input. | Client Dashboard loaded. | 1. Type `-1000` or `ABC` in budget. | Budget allocations default safely to `0 RWF`. System handles input without crash. | **PASS** |

---

## 3. Booking & Cover Photo Tests

| Test Case ID | Feature | Description | Preconditions | Input / Steps | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_BOOK_01** | Booking | Client books a package. | Client is logged in. Packages seeded in DB. | 1. Navigate to Book tab.<br>2. Select "Silver Package".<br>3. Choose wedding date.<br>4. Click Book. | Booking is created in status `PENDING` with matching budget of 1,500,000 RWF. 8 default tasks are automatically created. | **PASS** |
| **TC_BOOK_02** | Upload Photo | Client uploads a wedding cover photo. | Client has an active booking. | 1. Click "Add Cover Photo".<br>2. Select a 1MB PNG file. | File is encoded as Base64. Upload API succeeds. Dashboard immediately displays the image as the header banner. | **PASS** |
| **TC_BOOK_03** | Upload Limit | Photo size limits verification. | Client has an active booking. | 1. Click "Add Cover Photo".<br>2. Select a 10MB JPG file. | Frontend blocks upload, showing warning message: "File size exceeds 5MB limit." | **PASS** |

---

## 4. Payment & Task Coordinating Tests

| Test Case ID | Feature | Description | Preconditions | Input / Steps | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_PAY_01** | Payment | Client pays for wedding booking. | Client has a `PENDING` booking. | 1. Click "Pay Online Now".<br>2. Select "MTN MoMo".<br>3. Click "Confirm Pay". | Transaction ID generated. Payment logged in database. Booking status becomes `CONFIRMED`. Payment status becomes `PAID`. | **PASS** |
| **TC_TASK_01** | Tasks Board | Planner manages wedding tasks. | Planner logged in. Client booking exists. | 1. Select client booking.<br>2. Next to first task, click "Start". | Task status in database becomes `IN_PROGRESS`. | **PASS** |
| **TC_TASK_02** | Tasks Board | Planner adds custom task to wedding checklist. | Planner logged in. Client booking exists. | 1. Enter task text: "Confirm cake design".<br>2. Click "Add Task". | Custom task created and appended to the checklist database for this wedding. | **PASS** |

---

## 5. Message Board Tests

| Test Case ID | Feature | Description | Preconditions | Input / Steps | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_MSG_01** | Chat | Client messages planner. | Client is logged in. | 1. Go to Chat tab.<br>2. Type "Hi Sarah" and click send. | Message saved in DB. Chat area refreshes. Planner dashboard lists client in active chat partners. | **PASS** |
