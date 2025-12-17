---
`md
# 💰 Financial Ledger API – Double-Entry Bookkeeping System

A robust backend REST API that implements double-entry bookkeeping principles for a mock banking system.

This project focuses on data integrity, ACID compliance, immutability, and correctness rather than simple CRUD operations.  
The ledger acts as the single source of truth, and account balances are always calculated from immutable ledger entries.

---

## 🚀 Tech Stack

| Component | Technology |
|---------|------------|
| Language | Node.js (JavaScript) |
| Framework | Express.js |
| Database | PostgreSQL 15 |
| DB Driver | pg (node-postgres) |
| Containers | Docker & Docker Compose |
| API Tool | Postman |

---

## 🎯 Project Objectives

- Implement double-entry bookkeeping
- Ensure ACID-compliant financial transactions
- Maintain an immutable audit trail
- Prevent negative balances (overdrafts)
- Handle concurrent transactions safely
- Calculate balances only from ledger entries

---

## ⚙ Setup Instructions (Docker-Based)

### 1️⃣ Clone Repository
bash
git clone https://github.com/Swetha-svvv/financial-ledger-api.git
cd financial-ledger-api
`

### 2️⃣ Environment Variables

Create `.env` file:

env
DB_HOST=localhost
DB_PORT=5432
DB_USER=ledger_user
DB_PASSWORD=ledger_password
DB_NAME=ledger_db
PORT=3000


### 3️⃣ Start Database

bash
docker compose up -d


Verify:

bash
docker ps


### 4️⃣ Install Dependencies

bash
npm install


### 5️⃣ Run Server

bash
node app.js


Server URL:


http://localhost:3000


---

## 🌐 API Base URLs

| Purpose      | URL                                            |
| ------------ | ---------------------------------------------- |
| Base API     | [http://localhost:3000](http://localhost:3000) |
| Accounts     | /accounts                                      |
| Transactions | /deposits, /withdrawals, /transfers            |

---

## 🗄 Database Schema (ERD)

### accounts

* id (UUID, PK)
* user_id
* account_type
* currency
* status

> Balance is NOT stored.

### transactions

* id (UUID, PK)
* type (deposit / withdrawal / transfer)
* source_account_id (FK)
* destination_account_id (FK)
* amount (NUMERIC)
* currency
* status
* description
* created_at

### ledger_entries

* id (UUID, PK)
* account_id (FK)
* transaction_id (FK)
* entry_type (credit / debit)
* amount (NUMERIC)
* created_at

### ER Diagram


accounts ───< ledger_entries >─── transactions


---

## 📌 API Endpoints

### 🧾 Accounts – /accounts

| Method | Endpoint              | Description           |
| ------ | --------------------- | --------------------- |
| POST   | /accounts             | Create account        |
| GET    | /accounts             | List accounts         |
| GET    | /accounts/{id}        | Get account + balance |
| GET    | /accounts/{id}/ledger | Ledger history        |

Create Account:

json
{
  "user_id": "user_101",
  "account_type": "savings",
  "currency": "INR",
  "status": "active"
}


---

### 💵 Deposits – /deposits

json
{
  "account_id": "uuid",
  "amount": 1000,
  "currency": "INR",
  "description": "Initial deposit"
}


✔ Creates one CREDIT ledger entry

---

### 💸 Withdrawals – /withdrawals

json
{
  "account_id": "uuid",
  "amount": 500,
  "currency": "INR",
  "description": "ATM withdrawal"
}


✔ Creates one DEBIT ledger entry
❌ Fails if balance becomes negative

---

### 🔁 Transfers – /transfers

json
{
  "source_account_id": "uuid_1",
  "destination_account_id": "uuid_2",
  "amount": 300,
  "currency": "INR",
  "description": "Internal transfer"
}


✔ Two ledger entries created
✔ Single database transaction

---

## 🔐 Design Decisions

### Double-Entry Bookkeeping

* Every transaction creates ledger entries
* Transfers create balanced debit and credit records
* Ledger is immutable (append-only)

### ACID Compliance

All operations run inside:

sql
BEGIN;
COMMIT;
ROLLBACK;


Ensures atomicity and consistency.

### Transaction Isolation

* PostgreSQL default READ COMMITTED
* Prevents dirty reads
* Safe for concurrent financial operations

### Balance Calculation


SUM(credits) - SUM(debits)


* No balance column
* Ledger is source of truth

### Negative Balance Prevention

* Balance checked before commit
* Transaction rolled back if result < 0

---

## 🧪 Testing

* Postman collection included
* Covers deposits, withdrawals, transfers
* Includes insufficient balance scenarios

---

## ✅ Outcomes

✔ Double-entry accounting
✔ ACID-compliant transactions
✔ Immutable ledger
✔ Correct balance calculation
✔ Overdraft prevention
✔ Concurrent safety

---