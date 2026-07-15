# REST API Documentation
## Base URL: `http://localhost:5000/api`

This document details the API endpoints, authentication requirements, JSON request parameters, and response structures for the Wedding Planner & Budget Management Platform.

---

## 1. Authentication API

### 1.1 User Registration
- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Elie Rukundo",
    "email": "elie@example.com",
    "phone": "+250788000000",
    "password": "securepassword",
    "role": "CLIENT" 
  }
  ```
  *(Note: Available roles are `CLIENT`, `PLANNER`, `VENDOR`. Default is `CLIENT`).*
- **Success Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": 3,
      "name": "Elie Rukundo",
      "email": "elie@example.com",
      "phone": "+250788000000",
      "role": "CLIENT",
      "createdAt": "2026-07-11T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 1.2 User Login
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "elie@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": 3,
      "name": "Elie Rukundo",
      "email": "elie@example.com",
      "phone": "+250788000000",
      "role": "CLIENT",
      "createdAt": "2026-07-11T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

## 2. Wedding Packages API

### 2.1 Get All Packages
- **Endpoint**: `GET /packages`
- **Access**: Public
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "name": "Silver Package",
      "description": "Essential planning package...",
      "price": 1500000.0,
      "image": "https://...",
      "createdAt": "2026-07-11T12:00:00.000Z"
    }
  ]
  ```

### 2.2 Create a Package
- **Endpoint**: `POST /packages`
- **Access**: Private (Admin only - Requires Header: `Authorization: Bearer <token>`)
- **Request Body**:
  ```json
  {
    "name": "Custom Package Pro",
    "description": "Ultimate package inclusion details...",
    "price": 4500000.0,
    "image": "https://..."
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "message": "Package created successfully",
    "package": {
      "id": 4,
      "name": "Custom Package Pro",
      "description": "Ultimate package inclusion details...",
      "price": 4500000.0,
      "image": "https://...",
      "createdAt": "2026-07-11T12:05:00.000Z"
    }
  }
  ```

---

## 3. Bookings API

### 3.1 Create a Wedding Booking
- **Endpoint**: `POST /bookings`
- **Access**: Private (Authenticated Clients)
- **Request Body**:
  ```json
  {
    "packageId": 1, 
    "budget": 1500000.0,
    "date": "2026-12-25"
  }
  ```
  *(Note: Send `"packageId": null` for custom planning budgets).*
- **Success Response (210 Created)**:
  ```json
  {
    "message": "Booking created and tasks initialized!",
    "booking": {
      "id": 10,
      "userId": 3,
      "packageId": 1,
      "budget": 1500000.0,
      "date": "2026-12-25T00:00:00.000Z",
      "status": "PENDING",
      "paymentStatus": "PENDING",
      "createdAt": "2026-07-11T12:10:00.000Z",
      "tasks": [
        { "id": 1, "bookingId": 10, "task": "Select and secure wedding venue", "status": "PENDING" }
      ],
      "package": { "id": 1, "name": "Silver Package", "price": 1500000.0 }
    }
  }
  ```

### 3.2 Update Booking cover image
- **Endpoint**: `PUT /bookings/:id/image`
- **Access**: Private (Owner Client / Planner / Admin)
- **Request Body**:
  ```json
  {
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Wedding cover image updated successfully!",
    "booking": {
      "id": 10,
      "image": "data:image/png;base64,iVBORw0KGgoAAA..."
    }
  }
  ```

---

## 4. Tasks API

### 4.1 Get Checklist Tasks
- **Endpoint**: `GET /tasks/booking/:bookingId`
- **Access**: Private (Owner Client / Planner / Admin)
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "bookingId": 10,
      "plannerId": null,
      "task": "Select and secure wedding venue",
      "deadline": null,
      "status": "PENDING",
      "createdAt": "2026-07-11T12:10:00.000Z",
      "planner": null
    }
  ]
  ```

### 4.2 Update Task Status
- **Endpoint**: `PUT /tasks/:id`
- **Access**: Private (Owner Client / Planner / Admin)
- **Request Body**:
  ```json
  {
    "status": "COMPLETED",
    "plannerId": 2
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Task updated successfully",
    "task": {
      "id": 1,
      "bookingId": 10,
      "plannerId": 2,
      "task": "Select and secure wedding venue",
      "status": "COMPLETED",
      "planner": {
        "id": 2,
        "name": "Sarah Planner"
      }
    }
  }
  ```

---

## 5. Messaging API

### 5.1 Send Message
- **Endpoint**: `POST /messages`
- **Access**: Private (Authenticated Users)
- **Request Body**:
  ```json
  {
    "receiverId": 2,
    "content": "Hello Sarah, can you help check if the Serena venue is available?"
  }
  ```
- **Success Response (210 Created)**:
  ```json
  {
    "id": 15,
    "senderId": 3,
    "receiverId": 2,
    "content": "Hello Sarah, can you help check if the Serena venue is available?",
    "createdAt": "2026-07-11T12:15:00.000Z",
    "sender": { "id": 3, "name": "Elie Rukundo", "role": "CLIENT" },
    "receiver": { "id": 2, "name": "Sarah Planner", "role": "PLANNER" }
  }
  ```

---

## 6. Reports API

### 6.1 Get Admin Analytics
- **Endpoint**: `GET /reports`
- **Access**: Private (Admin only)
- **Success Response (200 OK)**:
  ```json
  {
    "totalRevenue": 5000000.0,
    "totalBookings": 2,
    "bookingsByStatus": [
      { "status": "CONFIRMED", "_count": { "id": 1 } },
      { "status": "PENDING", "_count": { "id": 1 } }
    ],
    "usersByRole": [
      { "role": "ADMIN", "_count": { "id": 1 } },
      { "role": "PLANNER", "_count": { "id": 1 } },
      { "role": "CLIENT", "_count": { "id": 2 } }
    ],
    "packagePopularity": [
      { "id": 1, "name": "Silver Package", "price": 1500000, "bookingsCount": 1 }
    ],
    "recentBookings": []
  }
  ```
