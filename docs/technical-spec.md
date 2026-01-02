**STEP 1.2.2 – TECHNICAL SPECIFICATION**
📁 **File:** `docs/technical-spec.md`

---

# ⚙️ Technical Specification Document

---

## 1. Overview

This document provides detailed technical specifications for the **Multi-Tenant SaaS Task Management System**, including project folder structure, component responsibilities, and development setup instructions.
The goal is to ensure the project is **easy to understand, maintain, and deploy** by developers.

---

## 2. Backend Project Structure

### 📁 Backend Folder Structure

```
backend/
├── server.js
├── package.json
├── package-lock.json
├── Dockerfile
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── tenant.controller.js
│   │   ├── user.controller.js
│   │   ├── project.controller.js
│   │   └── task.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── tenant.routes.js
│   │   ├── user.routes.js
│   │   ├── project.routes.js
│   │   └── task.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── tenant.middleware.js
│   │   └── error.middleware.js
│   ├── models/
│   │   ├── tenant.model.js
│   │   ├── user.model.js
│   │   ├── project.model.js
│   │   └── task.model.js
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── password.js
│   │   └── auditLogger.js
│   └── app.js
├── migrations/
│   ├── 001_create_tenants.sql
│   ├── 002_create_users.sql
│   ├── 003_create_projects.sql
│   ├── 004_create_tasks.sql
│   └── 005_create_audit_logs.sql
└── tests/
    └── api.test.js
```

---

### 📌 Backend Folder Explanation

* **server.js**
  Entry point of the backend application. Starts the server and runs migrations.

* **src/app.js**
  Initializes Express app, middleware, routes, and global error handling.

* **controllers/**
  Contains business logic for each module (Auth, Tenant, User, Project, Task).

* **routes/**
  Defines REST API endpoints and maps them to controllers.

* **middleware/**
  Handles authentication, authorization, tenant isolation, and errors.

* **models/**
  Represents database entities and query logic.

* **config/**
  Database and environment configuration.

* **utils/**
  Helper utilities such as JWT handling, password hashing, and audit logging.

* **migrations/**
  SQL files for creating database tables in order.

* **tests/**
  Contains backend API test cases.

---

## 3. Frontend Project Structure

### 📁 Frontend Folder Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── Dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── Projects/
│   │   │   ├── Projects.jsx
│   │   │   └── ProjectDetails.jsx
│   │   ├── Tasks/
│   │   │   └── Tasks.jsx
│   │   └── Users/
│   │       └── Users.jsx
│   ├── utils/
│   │   └── api.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── App.jsx
│   └── index.js
├── package.json
├── package-lock.json
└── Dockerfile
```

---

### 📌 Frontend Folder Explanation

* **components/**
  Reusable UI components like Navbar and ProtectedRoute.

* **pages/**
  Page-level components grouped by feature.

* **utils/api.js**
  Axios instance configured with base URL and JWT token.

* **context/**
  Global authentication state management using React Context API.

* **App.jsx**
  Defines routing and layout structure.

---

## 4. Development Setup Guide

### 4.1 Prerequisites

* Node.js v18+
* Docker & Docker Compose
* Git
* PostgreSQL (only for non-Docker local setup)
* Web browser (Chrome recommended)

---

### 4.2 Environment Variables

#### Backend (`.env`)

```
PORT=5000
DB_HOST=database
DB_PORT=5432
DB_NAME=saas_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000
```

#### Frontend (`.env`)

```
REACT_APP_API_URL=http://localhost:5000/api
```

---

### 4.3 Installation & Running (Docker – Recommended)

```bash
docker-compose up --build -d
```

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend: [http://localhost:5000](http://localhost:5000)
* Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### 4.4 Running Locally (Without Docker)

#### Backend

```bash
cd backend
npm install
npm start
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

---

### 4.5 Running Tests

```bash
cd backend
npm test
```

---


