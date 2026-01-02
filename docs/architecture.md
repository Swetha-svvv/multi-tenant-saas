**STEP 1.2.1 – ARCHITECTURE DOCUMENT**

📁 **File:** `docs/architecture.md`

# 🏗️ System Architecture Document

---

## 1. Overview

This document describes the **high-level system architecture**, **database design**, and **API architecture** of the **Multi-Tenant SaaS Task Management System**.
The system follows a **three-tier architecture** consisting of a frontend client, backend API server, and a relational database, with strict tenant data isolation and role-based access control.

---

## 2. High-Level System Architecture

### 2.1 Architecture Description

The application follows a **client–server model**:

* The **Client (Browser)** interacts with the system through a web-based frontend.
* The **Frontend Application (React.js)** handles UI rendering, user interactions, and API requests.
* The **Backend API Server (Node.js + Express)** processes requests, enforces business logic, authentication, authorization, and tenant isolation.
* The **Database (PostgreSQL)** stores all persistent data such as tenants, users, projects, and tasks.
* **JWT-based authentication** secures communication between frontend and backend.

---

### 2.2 Architecture Diagram

📌 **Diagram File Location:**
`docs/images/system-architecture.png`

### Diagram Components (Explain this in words)

1. **Client (Browser)**

   * Used by Super Admins, Tenant Admins, and End Users
   * Sends HTTP requests to backend APIs

2. **Frontend Application (React.js)**

   * Runs in the browser
   * Manages routing, state, and UI components
   * Stores JWT token in browser storage
   * Communicates with backend via REST APIs

3. **Backend API Server (Express.js)**

   * Validates JWT tokens
   * Extracts tenant_id and role from token
   * Applies role-based authorization
   * Enforces tenant data isolation
   * Handles business logic

4. **Database (PostgreSQL)**

   * Stores tenant-specific data
   * Uses foreign keys and tenant_id columns
   * Ensures relational integrity

5. **Authentication Flow**

   * User logs in
   * Backend issues JWT
   * JWT is sent with every API request
   * Backend verifies token before processing request

---

## 3. Database Schema Design (ERD)

### 3.1 ERD Diagram

📌 **Diagram File Location:**
`docs/images/database-erd.png`

---

### 3.2 Entities and Relationships

#### 1. Tenants Table

* Represents organizations using the system
* Each tenant has a unique identifier

**Key Fields:**

* id (Primary Key)
* name
* subdomain
* subscription_plan
* status

---

#### 2. Users Table

* Stores users belonging to tenants
* Supports multiple roles

**Key Fields:**

* id (Primary Key)
* tenant_id (Foreign Key → tenants.id)
* email
* password_hash
* role

📌 **Note:**

* `tenant_id` enforces data isolation
* Super Admin users have `tenant_id = NULL`

---

#### 3. Projects Table

* Represents projects under a tenant

**Key Fields:**

* id (Primary Key)
* tenant_id (Foreign Key → tenants.id)
* created_by (Foreign Key → users.id)
* name
* status

---

#### 4. Tasks Table

* Represents tasks within projects

**Key Fields:**

* id (Primary Key)
* project_id (Foreign Key → projects.id)
* tenant_id (Foreign Key → tenants.id)
* assigned_to (Foreign Key → users.id)

---

### 3.3 Tenant Isolation Strategy

* Every tenant-owned table includes a `tenant_id` column
* Backend queries always filter using `tenant_id` from JWT
* No tenant_id is accepted from frontend requests
* Ensures complete data isolation at application level

---

## 4. API Architecture

The backend exposes RESTful APIs grouped by functional modules.
All APIs follow a consistent response format and use JWT-based authentication.

---

### 4.1 Authentication APIs

| Method | Endpoint           | Auth Required | Role   |
| ------ | ------------------ | ------------- | ------ |
| POST   | /api/auth/register | ❌ No          | Public |
| POST   | /api/auth/login    | ❌ No          | Public |
| GET    | /api/auth/me       | ✅ Yes         | All    |
| POST   | /api/auth/logout   | ✅ Yes         | All    |

---

### 4.2 Tenant APIs

| Method | Endpoint         | Auth Required | Role        |
| ------ | ---------------- | ------------- | ----------- |
| GET    | /api/tenants     | ✅ Yes         | Super Admin |
| GET    | /api/tenants/:id | ✅ Yes         | Super Admin |
| PUT    | /api/tenants/:id | ✅ Yes         | Super Admin |

---

### 4.3 User APIs

| Method | Endpoint       | Auth Required | Role         |
| ------ | -------------- | ------------- | ------------ |
| POST   | /api/users     | ✅ Yes         | Tenant Admin |
| GET    | /api/users     | ✅ Yes         | Tenant Admin |
| PUT    | /api/users/:id | ✅ Yes         | Tenant Admin |
| DELETE | /api/users/:id | ✅ Yes         | Tenant Admin |

---

### 4.4 Project APIs

| Method | Endpoint          | Auth Required | Role         |
| ------ | ----------------- | ------------- | ------------ |
| POST   | /api/projects     | ✅ Yes         | Tenant Admin |
| GET    | /api/projects     | ✅ Yes         | All          |
| PUT    | /api/projects/:id | ✅ Yes         | Tenant Admin |
| DELETE | /api/projects/:id | ✅ Yes         | Tenant Admin |

---

### 4.5 Task APIs

| Method | Endpoint       | Auth Required | Role         |
| ------ | -------------- | ------------- | ------------ |
| POST   | /api/tasks     | ✅ Yes         | All          |
| GET    | /api/tasks     | ✅ Yes         | All          |
| PUT    | /api/tasks/:id | ✅ Yes         | All          |
| DELETE | /api/tasks/:id | ✅ Yes         | Tenant Admin |

---

## 5. Summary

* The system uses a **modular, scalable architecture**
* Tenant data is isolated using `tenant_id`
* JWT ensures secure authentication
* Role-based access control protects sensitive operations
* Docker-based deployment ensures consistency

---
