# 🌬️ vento - Deployment & Setup Guide

Welcome to **vento**, your modern, enterprise-grade secure cloud storage system. Follow this guide to get the platform running locally for development or production testing.

## 📋 Prerequisites
- **Java 17** (or higher)
- **Node.js 18+** & **npm**
- **PostgreSQL** (running locally or via Docker)
- **Maven** (optional, wrapper included)

---

## 🗄️ 1. Database Setup
The system is designed to automatically create the database if it doesn't exist.

1.  Ensure PostgreSQL is running on `localhost:5432`.
2.  Default Credentials:
    - **User**: `postgres`
    - **Password**: `password`
3.  The backend will automatically create the `sharevault_db` database and all necessary tables on the first run.

> [!TIP]
> To change these credentials, edit `backend/src/main/resources/application.yml`.

---

## 🚀 2. Backend Setup (Spring Boot)
1.  Navigate to the `backend` directory.
2.  Install dependencies and build:
    ```bash
    ./mvnw clean install
    ```
3.  Run the application:
    ```bash
    ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
    ```
4.  The API will be live at: `http://localhost:8080`

---

## 💻 3. Frontend Setup (React + Vite)
1.  Navigate to the `frontend` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create/Verify `.env` file:
    ```env
    VITE_API_URL=http://localhost:8080/api
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Access the app at: `http://localhost:5173`

---

## 🔑 4. Default Accounts
| Role  | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@vento.com` | `admin123` |
| **User** | `user@gmail.com` | `user123` |

---

## 🛠️ 5. Monitoring & Audit
- **Analytics**: Visit the `Command Center` in the sidebar for storage trends.
- **API Traces**: Admin can visit `System Audit` to see live JSON request/response logs.
- **pgAdmin**: Connect to `sharevault_db` to inspect tables directly.

---

## 🛡️ 6. Security Features
- **Auto-Logout**: Sessions expire after 30 minutes of inactivity.
- **Rate Limiting**: API protected against brute-force attacks.
- **Encryption**: Files are stored securely on the local filesystem (configurable).
