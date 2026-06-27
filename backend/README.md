# BizOS - MSME Business Operating System Backend

BizOS (Business Operating System) is an all-in-one backend API built specifically to digitize operations for small and medium enterprises (MSMEs). It replaces manual paper logs, scattered Excel spreadsheets, and WhatsApp groups by consolidating core operations—**Inventory, Billing, CRM, Employee Attendance & Payroll, and Expenses**—into a single, highly cohesive system.

This repository hosts the backend RESTful API, structured using **Node.js, Express, MongoDB (Mongoose)**, and modern **ES Modules (ESM)**.

---

## Key Features

1. **Inventory Management**
   - Catalog management (products, categories, prices, stock levels).
   - Real-time stock decrement on sales.
   - Low stock alerts based on minimum threshold settings.
   - Manual stock adjustments (purchases/sales/write-offs) with tracking.

2. **Billing & Invoicing**
   - GST-compliant invoice creation (CGST/SGST/IGST breakdown).
   - Multi-mode payment tracking (Cash, UPI, Card, Credit).
   - Dynamic return/refund handling (restores inventory, adjusts client balance).
   - Partial payment and due-date tracking.

3. **CRM (Customer Relationship Management)**
   - Customer profile storage (contacts, addresses, GSTINs).
   - Sales ledger tracking outstanding balances for credit buyers.
   - Loyalty rewards point engine (automatically issues points per purchase).
   - Transactional purchase histories.

4. **Employee Attendance & HR**
   - Punch-in/out logs capturing GPS location coordinates and Selfie verification paths.
   - Automatic shift duration and overtime hour calculation.
   - Monthly payroll generation aggregating present days, half days, leaves, overtime payouts, and salary deductions.

5. **Expense Management & Cash Flow**
   - Categorized operating expense logger (Rent, Utilities, Salaries, Raw Materials, etc.).
   - Reimbursement claim submittals and admin approval workflows.
   - Live Cash Flow summaries reporting Gross Margin, Cost of Goods Sold (COGS), and Net Profit.

6. **Dashboard Widgets & Reports**
   - Real-time statistics: Today's/Yesterday's Sales, Outstanding Receivables, Active check-in counts.
   - High-performance reporting exports: Sales history ledger, Inventory valuation sheets, CA-ready GST compliance data.

---

## Tech Stack & Architecture

- **Runtime Environment**: Node.js (v18+)
- **Module System**: ES Modules (ESM) (configured with `"type": "module"`)
- **Web Framework**: Express.js
- **Database Engine**: MongoDB with Mongoose ODM
- **Security**: Helmet headers, CORS filters, BCrypt password hashing, JSON Web Tokens (JWT) authentication, and Express Rate Limit.

---

## Project Structure

```text
├── app.js                    # Express app configuration & middleware pipeline
├── constants.js              # Global project constants
├── package.json              # Script configs & dependencies
├── src/
│   ├── config/
│   │   └── db.js             # Mongoose database connector
│   ├── controllers/          # Business logic controllers per module
│   ├── middlewares/
│   │   └── auth.middleware.js # JWT authentication & role-based authorization
│   ├── models/               # MongoDB schema declarations (Mongoose)
│   ├── routes/               # Express routing pipelines
│   └── index.js              # Server entry point
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally

### Installation

1. Clone or download the repository into your workspace.
2. Install the node packages:
   ```bash
   npm install
   ```

3. Setup your environment configurations by creating a `.env` file in the root folder:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/bizos
   JWT_SECRET=your_secure_jwt_secret_key
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   NODE_ENV=development
   ```

### Running the Server

#### Development Mode
Run the server with hot-reloading using Nodemon:
```bash
npm run dev
```

#### Production Mode
Build and run the server natively:
```bash
npm start
```

Once running, verify server wellness by querying the health check endpoint:
- **Endpoint**: `GET http://localhost:3000/health`
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "BizOS API is running",
    "environment": "development",
    "timestamp": "2026-06-18T12:00:00.000Z"
  }
  ```

---

## API Reference
For a complete documentation of all available endpoints, request structures, and role permissions, please refer to our system design files and developer manuals.
