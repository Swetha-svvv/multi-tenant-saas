# ✅ STEP 1.1.1 – RESEARCH DOCUMENT

**File:** `docs/research.md`

---

## 🔹 SECTION 1: Multi-Tenancy Analysis (Minimum 800 words)

### 👉 What is Multi-Tenancy? (Intro – MUST write)

**Write this first:**

> Multi-tenancy is an architectural approach in which a single software application instance serves multiple organizations, known as tenants. Each tenant uses the same application but their data, users, and configurations must remain completely isolated from other tenants. Multi-tenancy is a core concept in Software as a Service (SaaS) applications because it enables cost efficiency, scalability, and centralized management while serving multiple customers.

Why this is important:

* Shows conceptual understanding
* Sets context for comparison

---

### 🔹 Approach 1: Shared Database + Shared Schema (tenant_id column)

**Explanation (write in paragraph form):**

> In this approach, all tenants share the same database and the same set of tables. Tenant-specific data is differentiated using a `tenant_id` column in every table. For example, tables such as users, projects, and tasks contain a tenant_id that identifies which tenant owns the data.

**Pros:**

* Low infrastructure cost
* Easy to onboard new tenants
* Single database to manage
* Best for early-stage SaaS products

**Cons:**

* Risk of data leakage if tenant_id filtering is missed
* Queries become more complex
* Requires strict backend enforcement

---

### 🔹 Approach 2: Shared Database + Separate Schema (per tenant)

**Explanation:**

> In this model, a single database is used, but each tenant has its own schema. Each schema contains its own set of tables such as users, projects, and tasks. The application dynamically switches schemas based on the tenant context.

**Pros:**

* Better data isolation than shared schema
* Easier data deletion per tenant
* Reduced risk of cross-tenant data access

**Cons:**

* Schema creation and migration complexity
* Harder to manage large number of tenants
* More operational overhead

---

### 🔹 Approach 3: Separate Database per Tenant

**Explanation:**

> In this approach, each tenant is assigned a completely separate database. The application connects to a different database depending on the tenant. This model provides the strongest isolation between tenants.

**Pros:**

* Maximum data isolation
* Easier compliance with regulations
* Simple tenant-level backup and restore

**Cons:**

* Very high infrastructure cost
* Difficult to scale
* Complex connection management

---

### 🔹 Comparison Table (MANDATORY)

| Approach                    | Isolation | Cost   | Scalability | Complexity |
| --------------------------- | --------- | ------ | ----------- | ---------- |
| Shared DB + Shared Schema   | Logical   | Low    | High        | Medium     |
| Shared DB + Separate Schema | Medium    | Medium | Medium      | High       |
| Separate Database           | Strong    | High   | Low         | Very High  |

---

### 🔹 Chosen Approach & Justification (IMPORTANT)

**Write clearly:**

> This project uses the **Shared Database + Shared Schema** approach with a `tenant_id` column. This approach was selected because it provides the best balance between scalability, cost efficiency, and maintainability. It is well-suited for SaaS applications that need to support multiple organizations while keeping infrastructure costs low.

> Data isolation is enforced at the application level using strict query filtering and middleware-based tenant validation. PostgreSQL indexing on tenant_id ensures acceptable performance even with large datasets.

---

## 🔹 SECTION 2: Technology Stack Justification (Minimum 500 words)

### Backend – Node.js + Express.js

> Node.js with Express.js was chosen as the backend framework due to its non-blocking, event-driven architecture. This makes it highly suitable for handling multiple concurrent requests, which is essential in a multi-tenant SaaS environment.

**Why chosen:**

* Fast REST API development
* Huge ecosystem
* Easy JWT integration

**Alternatives considered:**

* Spring Boot (more complex, heavier)
* Django (less flexible for microservices)

---

### Frontend – React.js

> React.js was selected as the frontend framework because of its component-based architecture and efficient rendering using the Virtual DOM. It allows building dynamic and responsive user interfaces suitable for dashboards and admin panels.

**Why chosen:**

* Reusable components
* Fast UI updates
* Strong community support

**Alternatives:**

* Angular (steeper learning curve)
* Vue.js (smaller ecosystem)

---

### Database – PostgreSQL

> PostgreSQL is used as the primary database due to its strong relational capabilities, ACID compliance, and support for advanced features such as indexing, foreign keys, and UUIDs.

---

### Authentication – JWT

> JSON Web Tokens (JWT) are used for authentication because they are stateless, scalable, and suitable for distributed systems. JWT enables role-based access control without maintaining server-side sessions.

---

### Deployment – Docker & Docker Compose

> Docker was chosen to containerize the application, ensuring consistent environments across development and deployment. Docker Compose simplifies orchestration of backend, frontend, and database services.

---

## 🔹 SECTION 3: Security Considerations (Minimum 400 words)

### 1. Tenant Data Isolation

* tenant_id enforced in all queries
* Middleware injects tenant context

### 2. Authentication & Authorization

* JWT-based authentication
* Role-based access (Super Admin, Tenant Admin, User)

### 3. Password Security

* Passwords hashed using bcrypt
* Salted hashing to prevent rainbow table attacks

### 4. API Security

* Protected routes
* Centralized error handling
* Input validation

### 5. Infrastructure Security

* Environment variables for secrets
* Docker container isolation

---
