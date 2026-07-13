# System UML Diagrams
## Wedding Planner & Budget Management Platform

This document presents the UML and Entity Relationship diagrams representing the architecture and workflows of the Wedding Planner & Budget Management Platform. These diagrams are written using Mermaid notation and can be viewed directly in VS Code's Markdown preview.

---

## 1. Use Case Diagram

The Use Case Diagram displays system boundaries, actors (Client, Planner, Admin), and their interactions with various platform capabilities.

```mermaid
graph TD
    %% Actors
    Client((Client))
    Planner((Planner))
    Admin((Admin))

    %% Use Cases
    subgraph "Authentication & Profile"
        UC_Reg(Register Account)
        UC_Login(Login)
        UC_Profile(Update Profile)
    end

    subgraph "Core Client Operations"
        UC_Budget(Calculate Budget)
        UC_Browse(Browse Packages & Vendors)
        UC_Book(Book Wedding Package)
        UC_Pay(Pay Online - Simulated)
    end

    subgraph "Workflow Management"
        UC_Checklist(Track Wedding Tasks)
        UC_PlannerTasks(Manage Client Tasks)
        UC_Chat(Chat Client <--> Planner)
    end

    subgraph "Administration"
        UC_PkgMgt(Manage Packages CRUD)
        UC_VendorMgt(Manage Vendors CRUD)
        UC_Reports(View Revenue & Analytics Reports)
    end

    %% Relations
    Client --> UC_Reg
    Client --> UC_Login
    Client --> UC_Profile
    Client --> UC_Budget
    Client --> UC_Browse
    Client --> UC_Book
    Client --> UC_Pay
    Client --> UC_Checklist
    Client --> UC_Chat

    Planner --> UC_Login
    Planner --> UC_PlannerTasks
    Planner --> UC_Chat

    Admin --> UC_Login
    Admin --> UC_PkgMgt
    Admin --> UC_VendorMgt
    Admin --> UC_Reports
```

---

## 2. Activity Diagram: Booking & Payment Flow

This diagram traces the procedural flow of a Client booking a package and executing a payment.

```mermaid
stateDiagram-v2
    [*] --> BrowsePackages : Client visits landing page
    BrowsePackages --> CheckLogin : Clicks "Book Package"
    
    state CheckLogin <<choice>>
    CheckLogin --> ShowLoginPage : Not Authenticated
    CheckLogin --> SelectWeddingDate : Authenticated
    
    ShowLoginPage --> HandleLogin : Enters Credentials
    HandleLogin --> SelectWeddingDate : Success
    
    SelectWeddingDate --> SubmitBooking : Enters date and budget limit
    SubmitBooking --> SeedChecklistTasks : Booking created in DB (Pending Status)
    SeedChecklistTasks --> ShowPaymentPortal : Auto-populates 8 initial tasks
    
    ShowPaymentPortal --> SelectPaymentMethod : Clicks "Pay Online Now"
    SelectPaymentMethod --> ProcessPayment : Enters MoMo/Card details
    
    ProcessPayment --> VerifyTransaction : Simulates transaction gateway
    
    state VerifyTransaction <<choice>>
    VerifyTransaction --> MarkPaid : Success (PAID)
    VerifyTransaction --> MarkFailed : Failure (FAILED)
    
    MarkPaid --> UpdateBookingStatus : Status set to "CONFIRMED"
    UpdateBookingStatus --> ClientDashboard : Redirects client to check timeline
    MarkFailed --> ShowPaymentPortal : Prompts retry
    
    ClientDashboard --> [*]
```

---

## 3. Sequence Diagram: Booking Creation & Payment Processing

Traces runtime messages and operations exchanged between the Client, React SPA, Express Backend, Prisma, and MySQL Database.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant UI as React Frontend
    participant API as Express Server
    participant DB as Prisma & MySQL

    Client->>UI: Selects Package & Wedding Date, Clicks "Book"
    UI->>API: POST /api/bookings { packageId, budget, date } (Auth Header)
    API->>API: Verify JWT token (authMiddleware)
    
    alt Token Invalid
        API-->>UI: 403 Forbidden / 401 Unauthorized
        UI-->>Client: Prompt login
    else Token Valid
        API->>DB: CREATE Booking (status: PENDING, paymentStatus: PENDING)
        DB-->>API: Booking ID returned
        API->>DB: SEED 8 default checklist tasks (createMany)
        DB-->>API: Success
        API-->>UI: 201 Created { message, bookingInfo, tasks }
        UI-->>Client: Render overview dashboard (Payment Required)
    end

    Client->>UI: Selects MoMo, clicks "Confirm Pay"
    UI->>API: POST /api/payments { bookingId, amount, method }
    API->>DB: Verify booking exists and belongs to user
    DB-->>API: Confirmed
    API->>API: Generate simulated Transaction ID (TXN-...)
    API->>DB: CREATE Payment record (status: PAID)
    DB-->>API: Success
    API->>DB: UPDATE Booking status to "CONFIRMED" & paymentStatus to "PAID"
    DB-->>API: Success
    API-->>UI: 201 Created { message, paymentDetails }
    UI-->>Client: Alert Success & update overview widgets
```

---

## 4. System Class Diagram

Exposes backend object design, helper configurations, and routes distribution.

```mermaid
classDiagram
    class Server {
        +cors()
        +express()
        +listen(PORT)
    }
    
    class DatabaseHelper {
        +PrismaClient prisma
        +PrismaMariaDb adapter
        +connect()
    }
    
    class AuthController {
        +register(req, res)
        +login(req, res)
    }
    
    class BookingController {
        +createBooking(req, res)
        +getAllBookings(req, res)
        +getBookingById(req, res)
        +updateBookingStatus(req, res)
        +updateBookingImage(req, res)
    }

    class TaskController {
        +getTasksByBooking(req, res)
        +createTask(req, res)
        +updateTask(req, res)
    }

    class AuthMiddleware {
        +verifyToken(req, res, next)
        +authorizeRoles(roles)
    }

    Server --> DatabaseHelper : Imports client
    Server --> AuthController : Mounts /api/auth
    Server --> BookingController : Mounts /api/bookings
    Server --> TaskController : Mounts /api/tasks
    BookingController --> AuthMiddleware : Protected routes
    TaskController --> AuthMiddleware : Protected routes
```

---

## 5. Entity Relationship Diagram (ERD)

Exposes the database tables, data types, and primary/foreign key connections.

```mermaid
erDiagram
    USER {
        int id PK
        string name
        string email UK
        string phone
        string password
        string role
        datetime createdAt
    }
    PACKAGE {
        int id PK
        string name
        string description
        float price
        string image
        datetime createdAt
    }
    VENDOR {
        int id PK
        string name
        string service
        string phone
        string email
        float price
        string location
        datetime createdAt
    }
    BOOKING {
        int id PK
        int userId FK
        int packageId FK
        float budget
        datetime date
        string status
        string paymentStatus
        string image
        datetime createdAt
    }
    PAYMENT {
        int id PK
        int bookingId FK
        float amount
        string method
        string transactionId UK
        string status
        datetime createdAt
    }
    TASK {
        int id PK
        int bookingId FK
        int plannerId FK
        string task
        datetime deadline
        string status
        datetime createdAt
    }
    MESSAGE {
        int id PK
        int senderId FK
        int receiverId FK
        string content
        datetime createdAt
    }

    USER ||--o{ BOOKING : places
    PACKAGE ||--o{ BOOKING : contains
    BOOKING ||--o{ PAYMENT : settles
    BOOKING ||--o{ TASK : contains
    USER ||--o{ TASK : manages
    USER ||--o{ MESSAGE : sends
    USER ||--o{ MESSAGE : receives
```
