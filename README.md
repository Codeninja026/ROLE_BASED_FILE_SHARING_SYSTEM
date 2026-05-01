# Vento Enterprise - Secure Role-Based File Sharing System

Vento is a production-grade enterprise file management and sharing platform built with Spring Boot, React, and PostgreSQL. It features strict data isolation, comprehensive audit logging, and modern aesthetic design.

## 🚀 Priority Setup & Login

### Production Credentials (Pre-seeded)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@vento.ac.in` | `adminadmin` |
| **Security Officer** | `security@vento.ac.in` | `adminadmin` |
| **Demo User** | `user1@gmail.com` | `user123` |

> [!IMPORTANT]
> Use these credentials for initial access. Admins can create additional users via the **Admin Console**.

## ✨ Key Features

- **Strict Data Isolation**: Multi-tenant architecture ensures users only see their own files and analytics.
- **Role-Based Access Control (RBAC)**: Supports roles (Admin, User) and granular file permissions (View, Manage).
- **Enterprise Analytics**: Real-time storage metrics, mime-type distribution, and growth trends.
- **Audit Logging**: Comprehensive tracking of all system actions (logins, uploads, deletions).
- **Smart Uploads**: Supports bulk file uploads and full folder structure preservation.
- **Modern UI/UX**: High-performance dashboard with Glassmorphism, Dark/Light modes, and micro-animations.
- **Google OAuth Integration**: Built-in support for enterprise SSO.

## 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3.x, Spring Security, JWT (JJWT).
- **Frontend**: React 18, Vite, Framer Motion, Recharts, Lucide Icons.
- **Database**: PostgreSQL with managed indexing.
- **Storage**: Local File System (Production-ready abstraction).

## 🛠️ Installation & Running

### 1. Database
Ensure PostgreSQL is running and create a database named `vento`.
The application uses the following defaults in `application-dev.yml`:
- URL: `jdbc:postgresql://localhost:5432/vento`
- Root directory for files: `./uploads/`

### 2. Backend
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔒 Security Architecture

- **Stateless Authentication**: JWT tokens stored securely.
- **Scoped Services**: Every backend service derives the user identity from the security context, preventing IDOR vulnerabilities.
- **CORS Management**: Strict origin validation for production safety.
- **Rate Limiting**: Protection against brute-force login attempts.

---
*Built for ShareVault / Vento Enterprise Platforms.*
