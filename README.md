 ⚙️ Setup Instructions
 🔹 Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
Backend runs on: http://localhost:5000

🔹 Frontend Setup
bash
Copy code
cd frontend
npm install
npm start
Frontend runs on: http://localhost:3000

🏗 Architecture Diagram
pgsql
Copy code
     Shopify Store
         │
         ▼
   (APIs / Webhooks)
         │
         ▼
 ┌─────────────────────┐
 │  Express.js Backend │
 │  - Auth (JWT)       │
 │  - Sync APIs        │
 │  - Webhooks         │
 └─────────┬───────────┘
           │
      Prisma ORM
           │
           ▼
   PostgreSQL Database
           │
           ▼
 ┌─────────────────────┐
 │ React.js Frontend   │
 │ - Login / Signup    │
 │ - KPI Cards         │
 │ - Charts (Recharts) │
 └─────────────────────┘
📌 API Endpoints
🔹 Auth Routes
POST /api/auth/signup → Create new user

POST /api/auth/login → Login and get JWT

🔹 Tenant Routes
POST /api/tenants/register → Register Shopify store with domain + token

🔹 Data Routes
POST /api/data/sync/:tenantId → Manually trigger Shopify data sync

GET /api/data/summary → Get total customers, orders, revenue

GET /api/data/orders-by-date?start=YYYY-MM-DD&end=YYYY-MM-DD → Get revenue grouped by date

GET /api/data/top-customers → Get top 5 customers by spend

🗄 Database Schema (Prisma)
prisma
Copy code
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Tenant model → Represents a Shopify store
model Tenant {
  id            Int       @id @default(autoincrement())
  shopifyDomain String    @unique
  accessToken   String
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  customers     Customer[]
  orders        Order[]
  products      Product[]
}

// User model → Auth users for dashboard
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  password      String
  isVerified    Boolean   @default(false)
  verifyToken   String?
  verifyExpires DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Customer model → Shopify customers
model Customer {
  id                BigInt    @id @default(autoincrement())
  shopifyCustomerId String    @unique
  tenantId          Int
  tenant            Tenant    @relation(fields: [tenantId], references: [id])

  email             String?
  firstName         String?
  lastName          String?
  totalSpent        Float     @default(0)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  orders            Order[]
}

// Order model → Shopify orders
model Order {
  id               BigInt    @id @default(autoincrement())
  shopifyOrderId   String    @unique
  tenantId         Int
  tenant           Tenant    @relation(fields: [tenantId], references: [id])

  customerId       BigInt?
  customer         Customer? @relation(fields: [customerId], references: [id])

  totalPrice       Float
  currency         String
  createdAt        DateTime
  updatedAt        DateTime  @updatedAt
}

// Product model → Shopify products
model Product {
  id               BigInt    @id @default(autoincrement())
  shopifyProductId String    @unique
  tenantId         Int
  tenant           Tenant    @relation(fields: [tenantId], references: [id])

  title            String
  price            Float
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
⚠️ Known Limitations / Assumptions
tenantId is hardcoded as 1 in some endpoints for demo purposes.

Authentication uses email/password + JWT instead of full Shopify OAuth.

Deployment instructions assume local development.
(Can be extended to Vercel, Railway, or Heroku for production).

