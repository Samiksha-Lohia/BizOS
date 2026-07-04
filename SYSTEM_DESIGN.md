# BizOS - System Design Document

This document outlines the system architecture, database design, and key operational workflows for the **BizOS MSME Business Operating System** backend.

---

## 1. Architectural Overview

BizOS is designed as a monolithic RESTful API built on the **MVC (Model-View-Controller)** pattern. This ensures simplicity, fast deployment, and clean separation of concerns. The backend is modularized to support independent development of the five business operating pillars.

```mermaid
graph TD
    Client[Client App: Mobile/Web] -->|HTTP Requests| AppJS[app.js: Middleware, CORS, Helmet, Rate Limits]
    
    subgraph Route Guard Pipeline
        AppJS --> AuthMW[auth.middleware.js]
        AuthMW -->|protect| RoleGuard{Role Check}
    end

    subgraph Router Mapping
        RoleGuard -->|requireSuperAdmin| SuperAdminRoutes[SuperAdmin Routes: /api/v1/superadmin]
        RoleGuard -->|blockSuperAdmin| BusinessRoutes[Business Modules: /api/v1/business, /products, /invoices, /customers, /employees, /attendance, /expenses, /dashboard]
        RoleGuard -->|protect only| UploadRoutes[Upload Routes: /api/v1/upload]
    end

    SuperAdminRoutes -->|Calls| SuperAdminCtrl[superAdmin.controller.js]
    BusinessRoutes -->|Calls| BusinessCtrls[Controllers: business, product, invoice, CRM, employee, attendance, expense, dashboard]
    UploadRoutes -->|multer upload| UploadHandler[upload.routes.js handler]

    SuperAdminCtrl -->|Queries| Models[Mongoose Models]
    BusinessCtrls -->|Queries| Models
    UploadHandler -->|Writes File| LocalUploads[src/uploads Static Storage]

    Models -->|Reads/Writes| MongoDB[(MongoDB Database)]
```

### Key Design Pillars
- **ES Modules (ESM)**: Fully compliant with Node.js ES Modules to make use of standard `import/export` statements for cleaner code import.
- **RESTful Endpoints**: Versioned routing structure (`/api/v1/...`) supporting standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
- **Security-First Pipeline**: Protects all business operations behind JWT checks and limits request traffic at the router level.

---

## 2. Database Schema & ER Diagram

We use a document-oriented structure in **MongoDB** configured via **Mongoose**. Documents are linked using ObjectIDs, allowing relational-like querying via Mongoose `.populate()`.

```mermaid
erDiagram
    BUSINESS ||--o{ USER : "has users"
    BUSINESS ||--o{ PRODUCT : "owns catalog"
    BUSINESS ||--o{ CUSTOMER : "manages CRM"
    BUSINESS ||--o{ INVOICE : "records transactions"
    BUSINESS ||--o{ EMPLOYEE : "employs roster"
    BUSINESS ||--o{ EXPENSE : "tracks expenses"
    
    USER ||--o{ INVOICE : "creates"
    CUSTOMER ||--o{ INVOICE : "buys"
    INVOICE ||--|{ INVOICE_ITEM : "contains"
    PRODUCT ||--o{ INVOICE_ITEM : "referenced in"
    
    EMPLOYEE ||--o{ ATTENDANCE : "logs punches"
    EMPLOYEE ||--o{ EXPENSE : "claims reimbursement"
    USER ||--o{ EXPENSE : "approves claims"
```

### Models Detailed Schema

#### 1. Business
- `_id`: ObjectId
- `name`: String (Required, trimmed)
- `address`: String
- `gstin`: String
- `logo`: String (URL)
- `phone`: String
- `email`: String
- `owner`: ObjectId (Ref -> User, Required)
- `subscription`: Sub-document containing:
  - `plan`: String (Enum: `Free`, `Basic`, `Pro`, `Enterprise`, Default: `Free`)
  - `status`: String (Enum: `Trial`, `Active`, `Expired`, Default: `Trial`)
  - `startDate`: Date (Default: null)
  - `endDate`: Date (Default: null)

#### 2. User
- `_id`: ObjectId
- `name`: String (Required, trimmed)
- `email`: String (Required, unique, lowercase, trimmed)
- `password`: String (Required, minlength: 6, select: false)
- `role`: String (Enum: `Admin`, `Manager`, `Staff`, `Employee`, `Accountant`, `SuperAdmin`, Default: `Admin`)
- `phone`: String (Trimmed)
- `designation`: String (Default: null)
- `businessId`: ObjectId (Ref -> Business)

#### 3. Product (Inventory catalog)
- `_id`: ObjectId
- `name`: String (Required)
- `category`: String (Required)
- `unit`: String (Required, e.g., Kg, Pcs)
- `purchasePrice`: Number (Required)
- `sellingPrice`: Number (Required)
- `stockQuantity`: Number (Default: 0)
- `minStockLevel`: Number (Default: 5)
- `expiryDate`: Date
- `barcode`: String (Indexed)
- `warehouse`: String
- `businessId`: ObjectId (Ref -> Business, Indexed)
- `createdBy`: ObjectId (Ref -> User)

#### 4. Customer (CRM Ledger)
- `_id`: ObjectId
- `name`: String (Required)
- `phone`: String (Required, Indexed)
- `email`: String
- `address`: String
- `gstin`: String
- `tags`: [String] (Default: `["Retail"]`)
- `outstandingBalance`: Number (Default: 0)
- `loyaltyPoints`: Number (Default: 0)
- `businessId`: ObjectId (Ref -> Business, Indexed)
- `createdBy`: ObjectId (Ref -> User)

#### 5. Invoice (Billing details)
- `_id`: ObjectId
- `invoiceNumber`: String (Required, unique per business)
- `customerId`: ObjectId (Ref -> Customer)
- `items`: Array of InvoiceItems:
  - `productId`: ObjectId (Ref -> Product)
  - `name`: String (Cached name)
  - `quantity`: Number
  - `purchasePrice`: Number
  - `sellingPrice`: Number
  - `discount`: Number
  - `taxRate`: Number
  - `taxAmount`: Number
  - `total`: Number
- `subtotal`: Number
- `taxTotal`: Number
- `discountTotal`: Number
- `totalAmount`: Number
- `paymentMode`: String (Enum: `Cash`, `UPI`, `Card`, `Credit`)
- `status`: String (Enum: `Paid`, `Partially Paid`, `Unpaid`, `Returned`)
- `paidAmount`: Number
- `outstandingAmount`: Number
- `dueDate`: Date
- `businessId`: ObjectId (Ref -> Business)
- `createdBy`: ObjectId (Ref -> User)

#### 6. Employee
- `_id`: ObjectId
- `name`: String (Required)
- `role`: String (Required, e.g., Driver, Counter clerk)
- `salaryDetails`:
  - `baseSalary`: Number (Required)
  - `overtimeRate`: Number (Hourly)
  - `workingHours`: Number (Daily default: 8)
- `shiftTimings`:
  - `start`: String (Default: `"09:00"`)
  - `end`: String (Default: `"18:00"`)
- `status`: String (Enum: `Active`, `Inactive`)
- `businessId`: ObjectId (Ref -> Business)

#### 7. Attendance
- `_id`: ObjectId
- `employeeId`: ObjectId (Ref -> Employee)
- `date`: String (YYYY-MM-DD, Unique index per employee/day)
- `status`: String (Enum: `Present`, `Absent`, `Leave`, `Half Day`)
- `timeIn`: String (HH:MM)
- `timeOut`: String (HH:MM)
- `selfieUrl`: String
- `gpsCoordinates`: { `lat`: Number, `lng`: Number }
- `overtimeHours`: Number
- `businessId`: ObjectId (Ref -> Business)

#### 8. Expense
- `_id`: ObjectId
- `category`: String (Enum: `Rent`, `Salaries`, `Utilities`, `Raw Materials`, `Transport`, `Marketing`, `Misc`)
- `amount`: Number (Required)
- `date`: Date (Required)
- `description`: String
- `receiptUrl`: String
- `status`: String (Enum: `Pending`, `Approved`, `Rejected`)
- `employeeId`: ObjectId (Ref -> Employee)
- `approvedBy`: ObjectId (Ref -> User)
- `reimbursementStatus`: String (Enum: `N/A`, `Pending`, `Reimbursed`)
- `businessId`: ObjectId (Ref -> Business)

---

## 3. Key Architectural Flows

### A. Transaction Billing & Stock Allocation
Every time a bill is finalized, the system coordinates inventory state and financial ledgers atomically.

```mermaid
sequenceDiagram
    participant Client as POS App
    participant InvoiceController as Invoice Controller
    participant Product as Product Catalog
    participant Customer as Customer Ledger
    
    Client->>InvoiceController: POST /api/v1/invoices {customerId, items, paidAmount}
    loop Verify Items
        InvoiceController->>Product: Get Stock levels
        alt Insufficient Stock
            Product-->>InvoiceController: Throw "Insufficient Stock"
            InvoiceController-->>Client: 400 Bad Request
        else Stock OK
            InvoiceController->>Product: Decrement Quantity (Save)
        end
    end
    InvoiceController->>Customer: Add Loyalty Points (InvoiceTotal / 100)
    alt Invoice has outstanding balance
        InvoiceController->>Customer: Add outstandingAmount to customer balance
    end
    Customer-->>InvoiceController: Ledger updated
    InvoiceController-->>Client: 201 Created (Returns Invoice PDF metadata)
```

### B. Daily Attendance selfie & GPS punch-in
- **Check-In (`POST /api/v1/attendance/check-in`)**: Logs daily employee check-in details. Requires `employeeId`, `date` (YYYY-MM-DD), and records optional fields: `timeIn` (defaults to current server time `HH:MM`), `selfieUrl` (image upload URL for validation), and `gpsCoordinates` (longitude & latitude coordinates). Employees are restricted to only checking in for themselves.
- **Check-Out (`POST /api/v1/attendance/check-out`)**: Logs daily check-out details. If check-in exists, sets `timeOut` (defaults to current server time `HH:MM`). Calculates decimal hours worked based on `timeIn` and `timeOut`:
  $$\text{Hours Worked} = (\text{Out Hour} + \frac{\text{Out Minute}}{60}) - (\text{In Hour} + \frac{\text{In Minute}}{60})$$
  If the calculated hours exceed the standard work day (`workingHours`, default: 8) defined in the employee's salary settings, the difference is saved as `overtimeHours`.

### C. Monthly Payroll Wages Calculation
At month end:
1. Fetch Employee record to obtain `baseSalary`, daily standard wage, and `overtimeRate`.
2. Scan the month's Attendance records for match `YYYY-MM`.
3. Compute summary statistics:
   - Days Present, Leaves, Half Days, and Absences.
4. Calculate net pay:
   $$\text{Daily Wage} = \frac{\text{Base Salary}}{30}$$
   $$\text{Deductions} = (\text{Absent Days} \times \text{Daily Wage}) + (\text{Half Days} \times \text{Daily Wage} \times 0.5)$$
   $$\text{Overtime Payout} = \text{Total Overtime Hours} \times \text{Overtime Rate}$$
   $$\text{Net Salary} = \text{Base Salary} + \text{Overtime Payout} - \text{Deductions}$$

---

## 4. Security & Optimization Features

### Security Controls
- **Bcrypt Hashing**: User passwords are automatically hashed with a salt factor of 10 prior to DB persistence (`pre-save` Mongoose hook).
- **Strict Rate Limiting**:
  - Auth Endpoints: Capped at 100 requests per 15 minutes to prevent brute-force attacks (`authLimiter`).
  - General API Endpoints: Capped at 300 requests per 15 minutes (`apiLimiter`).
- **Helmet Headers**: Exposes cross-origin resource policies, script injection guards (XSS), and frame-guard protections.
- **Route guards & validation**:
  - `protect`: Validates incoming authorization header (`Bearer <token>`) or cookie, attaching current user to `req.user`.
  - `requireSuperAdmin`: Restricts access exclusively to the system administrator for platform metrics and billing updates.
  - `blockSuperAdmin`: Blocks `SuperAdmin` from access to standard MSME tenant features.
- **Role authorization check (`authorizeRoles`)**: Filters and controls route access dynamically:
  - *SuperAdmin*: Tenant statistics summaries, subscription plan updates.
  - *Admin*: Absolute operational CRUD control, business profile settings.
  - *Manager*: Core inventory adjustment, client invoice check/returns, attendance details, claim approvals.
  - *Staff*: Invoice creation, product creation, customer ledger tracking, selfie/GPS check-in/out, expense logging.
  - *Employee*: GPS selfie check-in/out, own attendance retrieval, own employee profile check.
  - *Accountant*: Read-only catalog details, financial audits (expenses, profit & loss, reports, payroll sheets).

### Database Indexing Strategy
We implement composite index configurations to ensure fast queries:
- `Product`: `{ businessId: 1, name: 1 }` and `{ businessId: 1, barcode: 1 }` (lowers scan lookups during quick barcode registers).
- `Invoice`: `{ businessId: 1, invoiceNumber: 1 }` (unique per business) and `{ businessId: 1, createdAt: 1 }` (fast chronological queries).
- `Customer`: `{ businessId: 1, phone: 1 }` and `{ businessId: 1, name: 1 }`.
- `Attendance`: `{ employeeId: 1, date: 1 }` (prevents double check-ins).
