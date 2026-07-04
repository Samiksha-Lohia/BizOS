# BizOS — MSME Business Operating System

BizOS is an all-in-one Business Operating System built to digitize day-to-day operations for small and medium enterprises (MSMEs). It replaces manual paper logs and spreadsheets by consolidating five core business pillars — **Inventory**, **Billing**, **CRM**, **Employee Attendance**, and **Expenses** — into a single unified application.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Vanilla CSS |
| Backend | Node.js, Express.js (ESM) |
| Database | MongoDB (via Mongoose) |
| Auth | JWT (JSON Web Tokens) |
| Security | Helmet, bcrypt, express-rate-limit |

---

## Repository Structure

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

## Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB** — local instance or a MongoDB Atlas connection string

### 1. Configure the Backend

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bizos
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### 2. Run the Backend API

```bash
cd backend
npm install
npm run dev
```

The API will start at **`http://localhost:5000`**.  
Health check: `http://localhost:5000/health`

### 3. Run the Frontend Client

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start at **`http://localhost:5173`**.

---

## Features

- 📦 **Inventory Management** — Track stock levels, set reorder alerts, manage product catalog with barcode support.
- 🧾 **Billing & Invoicing** — Generate invoices, handle partial payments, auto-decrement stock on sale.
- 👥 **CRM (Customer Ledger)** — Manage customer profiles, outstanding balances, and loyalty points.
- 🕐 **Employee Attendance** — GPS + selfie punch-in/out, overtime tracking, monthly payroll computation.
- 💸 **Expense Tracking** — Log, categorize, approve, and reimburse business expenses.
- 📊 **Dashboard** — Unified analytics view with revenue, expense, and inventory summaries.

---

## API Overview

All endpoints are versioned under `/api/v1/` and protected by JWT authentication (excluding public login/register routes).

| Resource | Base Route | Description / Access Rules |
|---|---|---|
| Auth | `/api/v1/auth` | Public signup/login, protected logout, session checks |
| SuperAdmin | `/api/v1/superadmin` | Platform diagnostics, business stats, subscription updates (SuperAdmin only) |
| Business | `/api/v1/business` | Manage business profile configurations (Admin only) |
| Products | `/api/v1/products` | Stock adjustments, full CRUD (Admin, Manager, Staff) |
| Invoices | `/api/v1/invoices` | Checkout invoicing, returns, payment records (Admin, Manager, Staff) |
| Customers | `/api/v1/customers` | Customer profiling, outstanding logs, loyalty points ledger (Admin, Manager, Staff) |
| Employees | `/api/v1/employees` | Internal roster management (Admin, Manager, Accountant) |
| Attendance | `/api/v1/attendance` | Daily check-in/out, GPS selfie punch logs, payroll report sheets |
| Expenses | `/api/v1/expenses` | Claim processing, utility bills, categories, profit & loss reports |
| Dashboard | `/api/v1/dashboard` | Main metrics tracking dashboards (Admin, Manager, Accountant) |
| Upload | `/api/v1/upload` | File attachment upload utility (receipts, logo files, etc.) |

## Role-Based Access

| Role | Access Level |
|---|---|
| **SuperAdmin** | System-wide dashboard statistics. Manage business accounts and subscription status. Cannot access business modules. |
| **Admin** | Owner account. Full CRUD capabilities on all business resources, setup profile, employee management, payroll control. |
| **Manager** | Operational management. Roster editing, product catalog setup, invoice checks, expense approvals, analytics review. |
| **Staff** | Daily operator. Inventory check, invoice processing, CRM editing, self-attendance logs, expense logging. |
| **Employee** | Daily staff member. Log selfie/GPS attendance, view own profile statistics, view own attendance logs. |
| **Accountant** | Financial audit access. Read-only on CRM and roster, view sales reports, log/approve expenses, verify payroll sheets. |

---

## Further Reading

See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for the full architecture diagram, database ER diagram, Mongoose schema details, and key workflow sequence diagrams.
