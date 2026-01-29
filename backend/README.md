# 🏥 Vaxify – Backend

## 📦 Prerequisites

Before running this application, ensure you have:

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Postman or any REST client (for testing)

---

## 🚀 Getting Started

### 1. Database Setup

Login to MySQL and create the database:

```sql
CREATE
DATABASE vms_db;
```

### 2. Configuration

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/vms_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

> **Note:** Replace `YOUR_PASSWORD` with your actual MySQL password.

### 3. Running the Application

#### Using Terminal

```bash
mvn clean install
mvn spring-boot:run
```

#### Using IntelliJ IDEA

1. Open the project
2. Navigate to `BackendApplication.java`
3. Click the **Run** button

The application will start at: **`http://localhost:8080`**

---

## 📚 API Documentation

### Authentication APIs

All authentication endpoints are publicly accessible.

#### 1. Signup (USER / STAFF)

**Endpoint:** `POST /auth/signup`

**User Signup:**

```json
{
  "name": "John Doe",
  "email": "john@test.com",
  "password": "password123",
  "role": "USER"
}
```

**Staff Signup:**

```json
{
  "name": "Staff User",
  "email": "staff@test.com",
  "password": "password123",
  "role": "STAFF"
}
```

#### 2. Login

**Endpoint:** `POST /auth/login`

**Request:**

```json
{
  "email": "john@test.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@test.com",
    "role": "USER"
  }
}
```

> **Important:** Copy the `token` value and include it in all protected endpoints.

---

### 🔒 Authorization Header

For all protected endpoints, include the JWT token:

```
Authorization: Bearer <YOUR_TOKEN_HERE>
```

---

### 🧑‍⚕️ Staff Hospital APIs

**Base Path:** `/staff/**`  
**Required Role:** `STAFF`

#### 1. Register Hospital

**Endpoint:** `POST /staff/hospitals/register`

**Request:**

```json
{
  "name": "City Care Hospital",
  "address": "Main Street, Downtown"
}
```

**Response:**

```json
{
  "id": 1,
  "name": "City Care Hospital",
  "address": "Main Street, Downtown",
  "status": "PENDING"
}
```

#### 2. View My Hospital

**Endpoint:** `GET /staff/hospitals/me`

**Response:**

```json
{
  "id": 1,
  "name": "City Care Hospital",
  "address": "Main Street, Downtown",
  "status": "PENDING"
}
```

---

### 🛡️ Admin Hospital APIs

**Base Path:** `/admin/**`  
**Required Role:** `ADMIN`

#### 1. Get All Hospitals

**Endpoint:** `GET /admin/hospitals`

**Response:**

```json
[
  {
    "id": 1,
    "name": "City Care Hospital",
    "address": "Main Street, Downtown",
    "status": "PENDING"
  }
]
```

#### 2. Get Pending Hospitals

**Endpoint:** `GET /admin/hospitals/pending`

#### 3. Approve Hospital

**Endpoint:** `PUT /admin/hospitals/approve/{id}`

**Example:**

```
PUT /admin/hospitals/approve/1
```

**Response:**

```json
{
  "id": 1,
  "name": "City Care Hospital",
  "address": "Main Street, Downtown",
  "status": "APPROVED"
}
```

#### 4. Reject Hospital

**Endpoint:** `PUT /admin/hospitals/reject/{id}`

**Example:**

```
PUT /admin/hospitals/reject/1
```

---

## 🔐 Security

- **JWT-based** stateless authentication
- **Role-based access control** enforced via `SecurityConfig`
- **URL Access Rules:**
    - `/auth/**` → Public (no authentication required)
    - `/staff/**` → STAFF role only
    - `/admin/**` → ADMIN role only

---

## ✅ Current Implementation

- [x] User/Staff signup and login
- [x] JWT authentication and authorization
- [x] Hospital registration by Staff
- [x] Hospital approval/rejection by Admin
- [x] Role-based API access control
- [x] Clean REST endpoint structure

