# User Manual & Operational Guide
## Wedding Planner & Budget Management Platform

This operational guide provides step-by-step instructions on how to use the dashboards, workspaces, and administrative tools of the Wedding Planner & Budget Management Platform.

---

## 1. Client Guide (Bride/Groom)

### 1.1 Creating an Account & Login
1. Open your web browser and navigate to the application URL: [http://localhost:5173](http://localhost:5173).
2. Click **Get Started** in the top navigation header.
3. Fill out the registration form: enter your full name, email, phone number, choose a secure password, and select **CLIENT** as your user role.
4. Click **Register**. You will be logged in automatically and routed to your dashboard.
5. If you already have an account, click **Login** in the header, enter your email and password, and click **Sign in**.

### 1.2 Using the Budget Planner
1. In your dashboard, click **Budget Planner** in the sidebar.
2. Enter your total target budget in RWF (e.g., `5000000` for 5 million RWF).
3. The platform instantly displays a recommended budget allocation:
   - **Wedding Venue (30%)**: e.g., 1,500,000 RWF
   - **Food & Catering (24%)**: e.g., 1,200,000 RWF
   - **Decoration (16%)**: e.g., 800,000 RWF
   - **Photography (10%)**: e.g., 500,000 RWF
   - **Transport (6%)**: e.g., 300,000 RWF
   - **DJ & Sound (4%)**: e.g., 200,000 RWF
   - **Emergency Fund (10%)**: e.g., 500,000 RWF
4. Use this suggested baseline to guide your custom expectations.

### 1.3 Booking a Wedding Package
1. Click **Book Services** in the dashboard sidebar.
2. Under **Select a Package Inclusions Plan**, choose one of the pre-designed options (Silver, Gold, Diamond) or select **Custom Package** to use your own custom budget limit.
3. Choose your desired **Wedding Date** from the calendar picker.
4. Click **Book Wedding Package**. Your booking will be successfully saved in the database, and you will be redirected to the overview tab.

### 1.4 Uploading a Cover Image
1. Click **My Wedding** in the dashboard sidebar.
2. Under the heading, you will see a dotted box prompting you to add a wedding picture. Click **Add Cover Photo** (or click **Change Cover Photo** if an image already exists).
3. Select an image file (PNG/JPG up to 5MB) from your local computer. It will instantly upload, save to the database, and render as your wedding banner header.

### 1.5 Submitting a Simulated Payment
1. Click **My Wedding** in the dashboard sidebar.
2. Scroll to the payment status card. Since your booking is newly created, it will show a red tag `PENDING`.
3. Click the **Pay Online Now** button.
4. Choose your payment method (MTN MoMo, Airtel Money, or Visa/Mastercard).
5. Click **Confirm Pay**. The portal will process the transaction. Your payment status will update to green `PAID`, and your booking status will advance to `CONFIRMED`.

### 1.6 Tracking Progress & Messaging Planners
- **Cheklist**: Click **Planning Tasks** in the sidebar to review the automated checklist seeded for your wedding (e.g., choosing decor, invitation coordination, menu tasting).
- **Planner Chat**: Click **Chat with Planner** in the sidebar. Type a message in the input box and click the **Send** button to speak with Sarah Planner.

---

## 2. Wedding Planner Guide

### 2.1 Accessing the Planner Board
1. Click **Login** and enter the planner credentials:
   - **Email**: `planner@wedding.com`
   - **Password**: `planner123`
2. Click **Sign in**. You will be directed to the **Planner Workspace**.

### 2.2 Coordinating Client Bookings & Checklists
1. The **Wedding Bookings** tab lists all weddings assigned to you. Each listing shows the client name, email, package choice, budget, date, and payment status.
2. Click on a client's booking card. The dashboard will automatically switch to the **Task Checklist** tab for that wedding.
3. **Add Custom Task**: Enter a task description (e.g., "Schedule bride dress fitting"), pick a deadline, and click **Add Task**.
4. **Advance Status**: Next to each task, click **Start** to set it to *In Progress*, or click **Mark Done** to set it to *Completed*.

### 2.3 Communicating with Clients
1. In the sidebar, click **Client Message Board**.
2. Select one of your active clients from the sidebar contact directory.
3. Review your chat history, type a response, and click the **Send** icon.

---

## 3. Administrator Guide

### 3.1 Accessing the Administrator Console
1. Log in using the system admin credentials:
   - **Email**: `admin@wedding.com`
   - **Password**: `admin123`
2. Click **Sign in** to open the **Administrator Console**.

### 3.2 Monitoring Metrics
The **Platform Overview** dashboard provides real-time graphs and metrics:
- **Total Revenue**: Sum of all confirmed MoMo/Card transactions.
- **Bookings**: Total booking counts divided by status.
- **User Directory**: Client, Planner, and Vendor accounts metrics.
- **Recent Orders**: Lists the latest transactions.

### 3.3 Managing Wedding Packages
1. Click **Manage Packages** in the sidebar.
2. **Create**: Fill in the Package Name, Price in RWF, Description Inclusions, and optional Image URL. Click **Create Package**.
3. **Edit**: Click **Edit** on any package card in the list, adjust details, and click **Save Changes**.
4. **Delete**: Click **Delete** on a package to remove it from the database catalog.

### 3.4 Managing the Vendor Marketplace Directory
1. Click **Manage Vendors** in the sidebar.
2. Fill out the vendor name, select their category (Venue, Decorator, Caterer, DJ, Transport, Makeup Artist), set their base price, location, phone, and email details. Click **Add Vendor**.
3. Use the list at the bottom of the page to **Edit** or **Remove** any vendor.
