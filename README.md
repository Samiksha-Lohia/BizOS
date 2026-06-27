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
│   │   ├── controllers/      # Business logic (invoices, inventory, CRM, etc.)
│   │   ├── models/           # Mongoose schemas & models
│   │   ├── routes/           # Express route definitions
│   │   └── middleware/       # Auth guards, role checks
│   ├── app.js                # Express app configuration (CORS, Helmet, rate limiting)
│   ├── constants.js          # Shared app-wide constants
│   ├── package.json
│   └── .env                  # Environment variables (not committed)
│
├── frontend/                 # React + Vite client application
│   ├── src/
│   │   ├── pages/            # Full-page views (Dashboard, Inventory, Billing, etc.)
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context providers (Auth, Business)
│   │   ├── App.jsx           # Root app with routing
│   │   └── App.css           # Global styles & design system
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

All endpoints are versioned under `/api/v1/` and protected by JWT authentication.

| Resource | Base Route |
|---|---|
| Auth | `/api/v1/auth` |
| Business | `/api/v1/business` |
| Products | `/api/v1/products` |
| Invoices | `/api/v1/invoices` |
| Customers | `/api/v1/customers` |
| Employees | `/api/v1/employees` |
| Attendance | `/api/v1/attendance` |
| Expenses | `/api/v1/expenses` |
| Dashboard | `/api/v1/dashboard` |

## Role-Based Access

| Role | Access Level |
|---|---|
| **Admin** | Full CRUD on all resources |
| **Manager** | Operations, stock, attendance approvals, expense confirmations |
| **Staff** | Invoice creation, CRM logging, self punch-in/out |
| **Accountant** | Financial reports, GST summaries, payroll review |

---

## Further Reading

See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for the full architecture diagram, database ER diagram, Mongoose schema details, and key workflow sequence diagrams.
