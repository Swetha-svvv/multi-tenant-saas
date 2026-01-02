📁 **`docs/API.md`**

---

# 📘 API Documentation

**Multi-Tenant SaaS Task Management System**

---

## 1. Overview

This document describes all REST APIs for the **Multi-Tenant SaaS Task Management System**.
The system supports **multi-tenancy**, **role-based access control (RBAC)**, and **JWT-based authentication**.

* **Base URL:**

  ```
  http://localhost:5000/api
  ```

* **Authentication:**
  JSON Web Token (JWT)

* **Authorization Header Format:**

  ```
  Authorization: Bearer <jwt_token>
  ```

---

## 2. Authentication Module (Step 3.1)

---

### API 1: Tenant Registration

**Endpoint:** `POST /api/auth/register-tenant`
**Authentication:** Public

#### Request Body

```json
{
  "tenantName": "Test Company Alpha",
  "subdomain": "testalpha",
  "adminEmail": "admin@testalpha.com",
  "adminPassword": "TestPass@123",
  "adminFullName": "Alpha Admin"
}
```

#### Success Response (201)

```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenantId": "uuid",
    "subdomain": "testalpha",
    "adminUser": {
      "id": "uuid",
      "email": "admin@testalpha.com",
      "fullName": "Alpha Admin",
      "role": "tenant_admin"
    }
  }
}
```

#### Error Responses

* **400** – Validation errors
* **409** – Subdomain or email already exists

#### Business Rules

* Password hashed using bcrypt/argon2
* Tenant and admin user created in **single transaction**
* Default subscription plan: **Free**

---

### API 2: User Login

**Endpoint:** `POST /api/auth/login`
**Authentication:** Public

#### Request Body

```json
{
  "email": "admin@demo.com",
  "password": "Demo@123",
  "tenantSubdomain": "demo"
}
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@demo.com",
      "fullName": "Demo Admin",
      "role": "tenant_admin",
      "tenantId": "uuid"
    },
    "token": "jwt-token-string",
    "expiresIn": 86400
  }
}
```

#### Error Responses

* **401** – Invalid credentials
* **404** – Tenant not found
* **403** – Account suspended

---

### API 3: Get Current User

**Endpoint:** `GET /api/auth/me`
**Authentication:** Required

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "value",
    "fullName": "value",
    "role": "tenant_admin",
    "isActive": true,
    "tenant": {
      "id": "uuid",
      "name": "value",
      "subdomain": "value",
      "subscriptionPlan": "pro",
      "maxUsers": 10,
      "maxProjects": 20
    }
  }
}
```

---

### API 4: Logout

**Endpoint:** `POST /api/auth/logout`
**Authentication:** Required

#### Success Response (200)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 3. Tenant Management Module (Step 3.2)

---

### API 5: Get Tenant Details

**Endpoint:** `GET /api/tenants/:tenantId`
**Authentication:** Required
**Authorization:** Tenant member or Super Admin

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "value",
    "subdomain": "value",
    "status": "active",
    "subscriptionPlan": "pro",
    "maxUsers": 10,
    "maxProjects": 20,
    "createdAt": "timestamp",
    "stats": {
      "totalUsers": 5,
      "totalProjects": 3,
      "totalTasks": 15
    }
  }
}
```

---

### API 6: Update Tenant

**Endpoint:** `PUT /api/tenants/:tenantId`
**Authentication:** Required
**Authorization:**

* `tenant_admin`: name only
* `super_admin`: all fields

#### Request Body (Example)

```json
{
  "name": "Updated Company Name"
}
```

---

### API 7: List All Tenants

**Endpoint:** `GET /api/tenants`
**Authentication:** Required
**Authorization:** Super Admin only

#### Query Parameters

* `page`
* `limit`
* `status`
* `subscriptionPlan`

---

## 4. User Management Module (Step 3.3)

---

### API 8: Add User to Tenant

**Endpoint:** `POST /api/tenants/:tenantId/users`
**Authentication:** Required
**Authorization:** tenant_admin

#### Request Body

```json
{
  "email": "newuser@demo.com",
  "password": "NewUser@123",
  "fullName": "New User",
  "role": "user"
}
```

---

### API 9: List Tenant Users

**Endpoint:** `GET /api/tenants/:tenantId/users`
**Authentication:** Required

#### Features

* Search
* Role filter
* Pagination
* Excludes password hash

---

### API 10: Update User

**Endpoint:** `PUT /api/users/:userId`
**Authentication:** Required

---

### API 11: Delete User

**Endpoint:** `DELETE /api/users/:userId`
**Authentication:** Required
**Authorization:** tenant_admin

---

## 5. Project Management Module (Step 3.4)

---

### API 12: Create Project

**Endpoint:** `POST /api/projects`
**Authentication:** Required

#### Request Body

```json
{
  "name": "Website Redesign Project",
  "description": "Complete redesign of company website"
}
```

---

### API 13: List Projects

**Endpoint:** `GET /api/projects`
**Authentication:** Required

---

### API 14: Update Project

**Endpoint:** `PUT /api/projects/:projectId`
**Authentication:** Required

---

### API 15: Delete Project

**Endpoint:** `DELETE /api/projects/:projectId`
**Authentication:** Required

---

## 6. Task Management Module (Step 3.5)

---

### API 16: Create Task

**Endpoint:** `POST /api/projects/:projectId/tasks`
**Authentication:** Required

---

### API 17: List Project Tasks

**Endpoint:** `GET /api/projects/:projectId/tasks`
**Authentication:** Required

---

### API 18: Update Task Status

**Endpoint:** `PATCH /api/tasks/:taskId/status`
**Authentication:** Required

---

### API 19: Update Task

**Endpoint:** `PUT /api/tasks/:taskId`
**Authentication:** Required

---

