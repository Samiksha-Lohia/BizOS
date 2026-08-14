# BizOS — MSME Business Operating System

> **Not just a ledger.** BizOS is an all-in-one Business Operating System built to digitize day-to-day operations for small and medium enterprises (MSMEs). It replaces manual paper logs and spreadsheets by consolidating five core business pillars — **Inventory**, **Billing**, **CRM**, **Employee Attendance**, and **Expenses** — into a single unified application.

[![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20MongoDB%20%7C%20Mongoose-orange?style=flat-square)](https://github.com)
[![Security Pipeline](https://img.shields.io/badge/Security-JWT%20%2B%20Bcrypt%20%2B%20Helmet%20%2B%20Rate%20Limiters-blue?style=flat-square)](https://github.com)
[![Architecture](https://img.shields.io/badge/Architecture-MVC%20REST%20API-green?style=flat-square)](https://github.com)

---

## 📋 Table of Contents
- [Overview](#-overview)
- [What Makes BizOS Different](#-what-makes-bizos-different)
- [Core Features & Modules](#-core-features--modules)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Core Data Pipelines & Lifecycles](#-core-data-pipelines--lifecycles)
- [Environment Variables](#-environment-variables)
- [Installation & Setup](#-installation--setup)
- [Security & Optimization Features](#-security--optimization-features)
- [License](#-license)

---

## 🌟 Overview

BizOS is designed as a centralized platform for small business owners and managers to monitor operations in real-time. By connecting POS billing directly with live inventory and customer ledgers, the platform ensures that every transaction immediately reflects across the business's financial and logistical state.

Additionally, BizOS integrates robust employee shifts and expenses tracking, providing owners with automated monthly payroll sheets and Profit & Loss summaries in one secure space.

---

## What Makes BizOS Different

These are the engineering highlights that separate BizOS from generic spreadsheet applications and basic trackers:

| Feature | Implementation |
|---|---|
| 📦 **Atomic Inventory Allocation** | Automatically decrements stock quantities on invoice checkouts and rolls back transactions or raises alerts if stock drops below reorder thresholds. |
| 🕐 **Geo-location & Selfie Attendance** | Validates daily employee clock-in records using coordinates and selfie image validation to prevent buddy-punching. |
| 💸 **Dynamic Payroll Wages Engine** | Computes monthly employee wages dynamically by evaluating shift records, daily standard wages, and hourly overtime rates. |
| 🔒 **Granular Role-Based Access** | Strict Express route guards verifying roles from SuperAdmin (platform diagnostics) to Employees (attendance logs) and Accountants (financial read-only auditing). |
| ⚡ **Composite Indexing & Routing** | Optimized Mongoose indices (`{ businessId: 1, barcode: 1 }`, `{ businessId: 1, invoiceNumber: 1 }`) to ensure fast barcode lookups and checkout queries under load. |

---

## ✨ Core Features & Modules

### 1. Inventory Management
- **Catalog Tracking**: Manage details, categories, purchase/selling prices, and minimum stock alert levels.
- **Low Stock Alerts**: Automatically highlights products reaching critical stock levels.
- **Barcode Support**: Speeds up checkout registers with indexed barcode scan matches.

### 2. Billing & Invoicing
- **Multi-mode Payments**: Handles payments made in Cash, UPI, Card, or Store Credit.
- **Stock Decoupling**: Seamlessly reduces inventory volumes at checkout.
- **Invoice Records**: Saves history, taxes, discounts, outstanding balances, and returns.

### 3. CRM & Customer Ledger
- **Customer Profiles**: Retains loyalty points and balances.
- **Store Credit Tracker**: Automatically adds unpaid balances to customer ledgers.
- **Loyalty Program**: Grants loyalty points computed dynamically as a percentage of checkout totals.

### 4. Employee Attendance
- **GPS & Selfie Punches**: Enables employees to punch in/out using coordinates and visual check URLs.
- **Overtime Calculations**: Computes overtime hours automatically for shifts running past standard hours.
- **Detailed Attendance Logs**: Retains check-in/out times, statuses, and coordinates.

### 5. Expense Tracking
- **Categorized Claims**: Classify expenses under Rent, Salaries, Utilities, Materials, Transport, or Marketing.
- **Approval Workflow**: Submissions by managers or staff require Admin approvals before reimbursement.
- **Profit & Loss Metrics**: Directly feeds into dashboard metrics for dynamic P&L calculation.

---

## 🏗️ System Architecture

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

---

## 🛠️ Tech Stack

### Backend
- **Node.js**: Main runtime environment.
- **Express.js**: HTTP REST framework using ES Modules (ESM).
- **MongoDB + Mongoose**: Document database and Object Data Modeling (ODM).
- **JWT (JSON Web Tokens)**: Secure token-based session authentication.
- **Helmet & Rate Limit**: Express security middleware and endpoint rate limits.
- **Bcrypt**: Salted password hashing.

### Frontend
- **React 18**: Dynamic UI client framework.
- **Vite**: High-speed frontend building tool.
- **Vanilla CSS**: Foundational, flexible styling system.

---

## 📁 Project Directory Structure

```text
MSME/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # Database connection & setup
│   │   ├── controllers/      # Business logic controllers (invoices, inventory, CRM, etc.)
│   │   ├── docs/             # Swagger and internal API documentation
│   │   ├── middlewares/      # Express middlewares (Auth guards, file upload)
│   │   ├── models/           # Mongoose schemas & models (User, Business, Product, etc.)
│   │   ├── routes/           # Express router endpoints
│   │   ├── seed/             # DB seeding scripts for mock data setup
│   │   ├── services/         # Third-party integrations & utilities
│   │   ├── uploads/          # Static file uploads directory
│   │   └── utils/            # Helper classes, error formats, and constants
│   ├── app.js                # Express app setup (cors, helmet, rate limiting)
│   ├── constants.js          # Shared app-wide constants
│   ├── package.json
│   └── .env                  # Environment variables (not committed)
│
├── frontend/                 # React + Vite client application
│   ├── src/
│   │   ├── assets/           # Client-side static assets (icons, brand logos)
│   │   ├── components/       # Shared UI layouts and components (DashboardLayout, etc.)
│   │   ├── context/          # React Context providers (AuthContext, ThemeContext)
│   │   ├── pages/            # View pages (Billing, CRM, Dashboard, Expenses, etc.)
│   │   ├── utils/            # Helper files (sidebar route mappings)
│   │   ├── App.css           # Global stylesheet and premium theme variables
│   │   ├── App.jsx           # Root app with React Router configuration
│   │   ├── index.css         # Foundational CSS reset styles
│   │   └── main.jsx          # React renderer entrypoint
│   ├── index.html
│   └── package.json
│
├── SYSTEM_DESIGN.md          # Architecture, DB schema, and workflow diagrams
└── README.md
```

---

## 🔄 Core Data Pipelines & Lifecycles

### 1. Transaction Billing & Stock Allocation
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

### 2. Daily Attendance & Selfie Punch-In/Out
```mermaid
graph TD
    PunchIn[POST /api/v1/attendance/check-in] --> VerifyUser{Valid User?}
    VerifyUser -->|No| Reject[401/403 Unauthorized]
    VerifyUser -->|Yes| RecordDetails[Save timeIn, gpsCoordinates, selfieUrl]
    RecordDetails --> CheckOut[POST /api/v1/attendance/check-out]
    CheckOut --> CalcHours[Compute Total Hours Worked]
    CalcHours --> OvertimeCheck{Hours > workingHours?}
    OvertimeCheck -->|No| SaveNormal[Save timeOut]
    OvertimeCheck -->|Yes| SaveOvertime[Save timeOut & overtimeHours]
```

### 3. Monthly Payroll Wage Pipeline
```mermaid
graph TD
    FetchEmp[Retrieve Employee details, baseSalary, overtimeRate] --> FetchAtt[Query Month Attendance logs]
    FetchAtt --> SumStats[Compute Days Present, Leaves, Half Days, Absences]
    SumStats --> CalcWages[Daily Wage = Base / 30]
    CalcWages --> Deduct[Compute Deductions for Absences & Half Days]
    Deduct --> Overtime[Compute Overtime Payout]
    Overtime --> Final[Net Salary = Base Salary + Overtime Payout - Deductions]
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bizos
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

---

## ⚡ Installation & Setup

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB** — local instance or a MongoDB Atlas connection string

### 1. Configure and Run Backend
```bash
cd backend
npm install
npm run dev
```
The API will start at **`http://localhost:5000`**.  
Health check: `http://localhost:5000/health`

### 2. Configure and Run Frontend
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will start at **`http://localhost:5173`**.

---

## 🧠 Security & Optimization Features

- **Bcrypt Salted Hashing**: Enforces standard cryptographic security for stored passwords via Mongoose pre-save middleware hooks.
- **Strict Endpoint Rate Limiting**: Capping sensitive routes at 100 requests per 15 minutes and standard routes at 300 requests to mitigate DDoS or credential stuffing.
- **Helmet Headers Integration**: Exposes strict script, injection, and frame security controls.
- **Optimized Composite Indexes**: Composite Mongo indexes to accelerate product searches (`{ businessId: 1, barcode: 1 }`) and daily operations logs lookup.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.
