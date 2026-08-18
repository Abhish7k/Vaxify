# Vaxify - Vaccine Management System

[![Live Demo](https://img.shields.io/badge/Live-vaxify.xyz-success)](https://vaxify.xyz)

![Vaxify Screenshot](https://ik.imagekit.io/vaxify/vaxify-ss.png?tr=r-15)

Vaxify is a comprehensive web-based platform designed to streamline the vaccine management and appointment booking process. It serves as a centralized hub for hospitals to manage their vaccine stock and for users to book vaccination slots seamlessly.

## 🚀 Features

### User Features (Public)

- **User Registration & Authentication**: Secure sign-up and login functionality.
- **Center Search**: Browse and search for vaccination centers.
- **Slot Booking**: View available time slots and book appointments.
- **Appointment Management**: View booking status/history and cancel appointments.

### Hospital Staff Features

- **Registration**: Request hospital registration for admin approval.
- **Dashboard**: Overview of daily appointments and stock.
- **Hospital Profile**: Manage and update hospital details.
- **Vaccine Management**: Add, update, and delete vaccine stocks.
- **Low Stock Alerts**: Automated email alerts via Brevo to notify staff when vaccine inventory is running low (below 40% and 20%).
- **Appointment Operations**: View hospital appointments, mark as completed, or cancel.

### Admin Features

- **Dashboard**: View system-wide statistics.
- **Hospital Management**:
  - View all registered and pending hospitals.
  - Approve or reject hospital registration requests.
  - Delete hospital records.
- **User Management**:
  - View list of all registered users.
  - Delete users if necessary.

### Technical Features

- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Role-Based Access Control**: Secure endpoints for Admins, Users, and specialized roles.
- **Email Notifications**: Automated email notifications and alerts via Brevo SMTP.
- **CI/CD Pipeline**: GitHub Actions compiles the backend; Render auto-deploys on push to `main`.

## 🛠 Tech Stack

### Frontend

- **Framework**: React.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS, ShadCN UI, Framer Motion
- **Deployment**: Vercel

### Backend

- **Framework**: Java Spring Boot
- **Build Tool**: Maven
- **Database**: MySQL (Aiven)
- **File Storage**: AWS S3
- **Security**: Spring Security + JWT
- **Email Service**: Brevo
- **Deployment**: Render

### DevOps & Infrastructure

- **Containerization**: Docker
- **Backend host**: Render
- **Frontend host**: Vercel
- **DNS**: Cloudflare
- **CI/CD**: GitHub Actions (CI) + Render auto-deploy (CD)

## 🗄️ Database Schema

<details>
<summary><b>Click to expand ER Diagram</b></summary>
<br>

[![](https://mermaid.ink/img/pako:eNqlVV1vmzAU_SvIz0lUEkIa3ljK2mj5UkKraYqEXHwTUMFG_tjWpfnvMyQpGbAsU3mCc67xufeea-9QyAggBwG_i_GW43RN19TQz8N8tRj77mRl7A5A_nwa349nvhETY_GlRJ_c5ejBXRqYEA5C1Ikwlq8leuf6nj-eekbIAUsgAZYlOZnP7n3vq29ETGSxxElAWKhSoDIgWOL6v5M4BCogoCp9Bl7nKU6hjmYxzROvE0JqSSXszR6nBaZErQoa3mwCJYAHuiCfjwXZnwr4uPKWVxTvYjVOqiDFcXJ1bliIH4yTBiZitJocZwlUlD-5o9F45l0hPodCnOH_aPBJS4qp2uBQKv7vrh2qzcKXeqB8zaCm8t07TX1ZTeb-lak9M_ai5YdMUfmhpHPSEAkrTHymt1gAlAQyTquwtheXFeKSHS8m7S4Wcx009Wb-Rz15cSTyFM_2P6Oqc3JGfcdhGFNoFF4eQ29v7TbbleZ0jAiLvwQdenwWcRjGI_tHMZyiy6Li_OZIfWgkioA4N1JzpAgjICqBpu1LtU4-BXgLArXQlscEORucCGihFLieeP2Nil6tkYxA-wA5-pXABqtErtGa7vW6DNNvjKXIkVzplZypbXT6UFlut-PB_h6h_QZ8lHsaOZZd_AE5O_QTOV3T7phmz-paA9vuD63ubQu9IqdtDjr20LZN-3bQG_ZuzKG9b6Ffxa5mZ2BaZtfu9_tdy7IHN70WAhJLxqeHi6W4X_a_AV-OzwE?type=png)](https://mermaid.live/edit#pako:eNqlVV1vmzAU_SvIz0lUEkIa3ljK2mj5UkKraYqEXHwTUMFG_tjWpfnvMyQpGbAsU3mCc67xufeea-9QyAggBwG_i_GW43RN19TQz8N8tRj77mRl7A5A_nwa349nvhETY_GlRJ_c5ejBXRqYEA5C1Ikwlq8leuf6nj-eekbIAUsgAZYlOZnP7n3vq29ETGSxxElAWKhSoDIgWOL6v5M4BCogoCp9Bl7nKU6hjmYxzROvE0JqSSXszR6nBaZErQoa3mwCJYAHuiCfjwXZnwr4uPKWVxTvYjVOqiDFcXJ1bliIH4yTBiZitJocZwlUlD-5o9F45l0hPodCnOH_aPBJS4qp2uBQKv7vrh2qzcKXeqB8zaCm8t07TX1ZTeb-lak9M_ai5YdMUfmhpHPSEAkrTHymt1gAlAQyTquwtheXFeKSHS8m7S4Wcx009Wb-Rz15cSTyFM_2P6Oqc3JGfcdhGFNoFF4eQ29v7TbbleZ0jAiLvwQdenwWcRjGI_tHMZyiy6Li_OZIfWgkioA4N1JzpAgjICqBpu1LtU4-BXgLArXQlscEORucCGihFLieeP2Nil6tkYxA-wA5-pXABqtErtGa7vW6DNNvjKXIkVzplZypbXT6UFlut-PB_h6h_QZ8lHsaOZZd_AE5O_QTOV3T7phmz-paA9vuD63ubQu9IqdtDjr20LZN-3bQG_ZuzKG9b6Ffxa5mZ2BaZtfu9_tdy7IHN70WAhJLxqeHi6W4X_a_AV-OzwE)

</details>

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v18+)
- Java JDK 17+
- Maven
- Docker & Docker Compose

### 1. Clone the Repository

```bash
git clone https://github.com/Abhish7k/vaxify-mono.git
cd vaxify-mono
```

### 2. Environment Variables

Create a `.env` file in the root directory and configure the following variables (refer to `.env.example`):

```env
DB_HOST=your_db_host
DB_PORT=3306
DB_NAME=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
...
```

### 3. Running the backend with Docker (local)

```bash
docker-compose up --build -d
```

The API listens on `http://localhost:8080`. Production hosting is on Render, not this compose file.

### 4. Running Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

### 5. Running Backend Locally

```bash
cd backend
./mvnw spring-boot:run
```

## ☁️ Deploying (Render + Vercel)

The frontend stays on **Vercel**. The Spring Boot API runs on **Render** (Docker). MySQL stays on **Aiven**, files on **S3**, and mail on **Brevo**.

### Backend on Render

1. Push this repo to GitHub and create a Render **Web Service** from it (or apply the Blueprint in `render.yaml`).
2. Use Docker, with Dockerfile `backend/Dockerfile` and context `backend`.
3. Set **Health Check Path** to `/actuator/health`.
4. Copy env vars from `.env.example` into the Render dashboard. Secrets (`sync: false` in the Blueprint) must be filled in by hand.
5. On the **free** instance type, set `MAIL_PORT=2525`. Render blocks outbound SMTP on `25` / `465` / `587`; Brevo accepts `2525`.
6. Set `BACKEND_URL` to the public API URL (`https://<service>.onrender.com` or `https://api.vaxify.xyz`).
7. Optional: in Cloudflare, CNAME `api.vaxify.xyz` to the Render hostname and attach that custom domain on the service.

Free instances spin down after 15 minutes idle. The frontend already pings `/api/ping` on load and shows a short toast when that cold start is slow.

### Frontend on Vercel

Keep the Vercel rewrite in `frontend/vercel.json` pointed at the API host. For more reliable cold starts, also set:

```env
VITE_API_BASE_URL=https://api.vaxify.xyz/api
```

(or the `onrender.com` URL) so the browser talks to Render directly instead of through Vercel’s proxy.

## 👥 Meet the Team

| Name         | Role / Contribution | GitHub                                              |
| ------------ | ------------------- | --------------------------------------------------- |
| **Abhishek** | Frontend & DevOps   | [@abhish7k](https://github.com/Abhish7k)            |
| **Indu**     | Backend & Database  | [@indu61](https://github.com/indu61)                |
| **Rahul**    | Frontend & UI       | [@rahulkhadeeeng](https://github.com/rahulkhadeeng) |
