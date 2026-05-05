# 🚀 TaskFlow — Team Task Manager

<div align="center">

![TaskFlow Banner](https://via.placeholder.com/1200x300/6366f1/ffffff?text=TaskFlow+—+Team+Task+Manager)

**A production-grade, full-stack SaaS task management application built for modern engineering teams.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-teal?style=flat-square&logo=prisma)](https://prisma.io)
[![Docker](https://img.shields.io/badge/Docker-ready-blue?style=flat-square&logo=docker)](https://docker.com)
[![Railway](https://img.shields.io/badge/Deploy-Railway-purple?style=flat-square)](https://railway.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Live Demo](https://taskflow-demo.railway.app) · [API Docs](https://api.taskflow-demo.railway.app/api-docs) · [Report Bug](issues)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Quick Start (Local)](#quick-start-local)
- [Docker Setup](#docker-setup)
- [Railway Deployment](#railway-deployment)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Folder Structure](#folder-structure)
- [CI/CD Pipeline](#cicd-pipeline)

---

## 🎯 Overview

TaskFlow is a **full-stack SaaS application** that enables engineering teams to plan, track, and ship projects efficiently. It features real-time collaboration via WebSockets, a drag-and-drop Kanban board, analytics dashboards, role-based access control, and JWT authentication with token rotation.

This project is designed as a **portfolio-grade** codebase demonstrating:
- Clean architecture (controller → service → repository)
- Production security practices (Helmet, rate limiting, CORS, input validation)
- Real-time features with Socket.IO
- Scalable database design with Prisma + PostgreSQL
- Containerized deployment with Docker & Railway

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT Access + Refresh Token rotation
- Secure bcrypt password hashing
- httpOnly cookie refresh token storage
- Role-Based Access Control (Admin / Member)
- Protected routes (frontend + backend middleware)
- Token auto-refresh with retry queue

### 📊 Dashboard
- Animated productivity metrics cards
- Task distribution charts (Recharts)
- Upcoming deadlines tracker
- Real-time activity feed
- Team member stats

### 📁 Project Management
- Create, edit, archive, delete projects
- Color-coded project cards
- Priority levels (Low → Critical)
- Member management with role assignment
- Project-level progress tracking

### ✅ Task Management
- Drag-and-drop Kanban board (dnd-kit)
- 4 status columns: Todo → In Progress → Review → Done
- Task priority levels with color coding
- Assignee management
- Due dates with overdue detection
- Tags / labels
- Comments with real-time updates
- Task activity history

### 👥 Team Collaboration
- Real-time updates via Socket.IO
- In-app notifications
- Activity logs
- Task commenting
- Member invitation system

### 🎨 UI/UX
- Dark / Light mode
- Responsive design (mobile → desktop)
- Framer Motion animations
- Loading skeletons
- Toast notifications (Sonner)
- Empty states
- ShadCN UI component library

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | Next.js 14 (App Router) |
| **Frontend Language** | TypeScript 5 |
| **Styling** | Tailwind CSS + ShadCN UI |
| **Animation** | Framer Motion |
| **State Management** | Zustand |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Drag & Drop** | @dnd-kit |
| **HTTP Client** | Axios |
| **Backend Framework** | Express.js |
| **Backend Language** | TypeScript 5 |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL 16 |
| **Authentication** | JWT (jsonwebtoken) |
| **Password Hashing** | bcryptjs |
| **Real-time** | Socket.IO |
| **Validation** | Zod + express-validator |
| **Logging** | Winston + Morgan |
| **API Docs** | Swagger / OpenAPI 3.0 |
| **Security** | Helmet, express-rate-limit, CORS |
| **Containerization** | Docker + Docker Compose |
| **Reverse Proxy** | Nginx |
| **CI/CD** | GitHub Actions |
| **Deployment** | Railway |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│                   CLIENT BROWSER                 │
│              Next.js 14 (App Router)             │
│      Zustand │ React Hook Form │ Recharts         │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS + WebSocket
┌──────────────────────▼──────────────────────────┐
│                  NGINX (Reverse Proxy)            │
│           Routes: /api/* → Backend               │
│                   /* → Frontend                  │
└────────────┬──────────────────┬─────────────────┘
             │                  │
┌────────────▼────────┐  ┌──────▼──────────────────┐
│   Express.js API     │  │   Socket.IO Server       │
│  /api/v1/*           │  │   Real-time events       │
│  Controller Layer    │  │   Room management        │
│  Service Layer       │  └─────────────────────────┘
│  Repository Layer    │
│  Middleware Chain:   │
│   Helmet → CORS →    │
│   RateLimit → Auth   │
└────────────┬─────────┘
             │ Prisma ORM
┌────────────▼─────────┐
│     PostgreSQL 16     │
│  Normalized Schema   │
│  8 Tables + Indexes  │
└──────────────────────┘
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

```bash
node --version   # v20+
npm --version    # v10+
docker --version # v24+ (for DB)
```

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager
```

### 2. Start PostgreSQL with Docker

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env — the defaults work for local dev

# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed the database with demo data
npx ts-node prisma/seed.ts

# Start dev server
npm run dev
```

Backend runs at: **http://localhost:5000**
API Docs at: **http://localhost:5000/api-docs**

### 4. Setup Frontend

```bash
# Open a new terminal tab
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local if needed

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:3000**

### 5. Login with Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@taskflow.com | Admin@123 |
| **Member** | sarah@taskflow.com | Member@123 |

---

## 🐳 Docker Setup (Full Stack)

### Run everything with one command

```bash
# 1. Copy and configure environment
cp .env.example .env
# Edit .env with your secrets

# 2. Build and start all containers
docker compose up --build -d

# 3. Run migrations inside the backend container
docker compose exec backend npx prisma migrate deploy

# 4. Seed the database
docker compose exec backend npx ts-node prisma/seed.ts

# 5. View logs
docker compose logs -f
```

### Access the application
- **App:** http://localhost (via Nginx)
- **Frontend direct:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api-docs

### Stop all containers
```bash
docker compose down

# Remove volumes too (WARNING: deletes DB data)
docker compose down -v
```

---

## 🚂 Railway Deployment (Full Guide)

Railway is the recommended hosting platform for TaskFlow. It supports GitHub-connected auto-deploys, managed PostgreSQL, and environment variable management.

### Step 1: Create a Railway Account

1. Go to [railway.app](https://railway.app) and sign up
2. Connect your GitHub account

### Step 2: Create a New Project

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Login to Railway
railway login
```

### Step 3: Deploy the Database

1. In the Railway dashboard → **New Project** → **Deploy PostgreSQL**
2. Click the PostgreSQL service → **Connect** tab
3. Copy the `DATABASE_URL` connection string — you'll need it shortly

Or via CLI:
```bash
railway add --plugin postgresql
```

### Step 4: Deploy the Backend

```bash
cd backend

# Initialize Railway project in this folder
railway init

# When prompted, select "Empty Project" and name it "taskflow-backend"

# Link to your Railway project
railway link
```

Now set environment variables in the Railway dashboard (or via CLI):

```bash
# Set all required env vars
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set DATABASE_URL="postgresql://..." # from Step 3
railway variables set JWT_ACCESS_SECRET="$(openssl rand -base64 48)"
railway variables set JWT_REFRESH_SECRET="$(openssl rand -base64 48)"
railway variables set JWT_ACCESS_EXPIRES_IN=15m
railway variables set JWT_REFRESH_EXPIRES_IN=7d
railway variables set CLIENT_URL="https://YOUR-FRONTEND.up.railway.app"
```

Deploy:
```bash
railway up
```

After deploy, get your backend URL:
```bash
railway domain
# Example: taskflow-backend-production.up.railway.app
```

Run migrations on production:
```bash
railway run npx prisma migrate deploy
railway run npx ts-node prisma/seed.ts
```

### Step 5: Deploy the Frontend

```bash
cd ../frontend

# Initialize new Railway service
railway init
# Name it "taskflow-frontend"

railway link
```

Set environment variables:
```bash
railway variables set NODE_ENV=production
railway variables set NEXT_PUBLIC_API_URL="https://YOUR-BACKEND.up.railway.app"
railway variables set NEXT_PUBLIC_SOCKET_URL="https://YOUR-BACKEND.up.railway.app"
```

Deploy:
```bash
railway up
```

### Step 6: Update CORS on Backend

Go back to backend Railway service and update:
```bash
cd backend
railway variables set CLIENT_URL="https://YOUR-FRONTEND.up.railway.app"
```

Railway will auto-redeploy.

### Step 7: Verify Deployment

```bash
# Check backend health
curl https://YOUR-BACKEND.up.railway.app/health

# Expected response:
# {"status":"ok","timestamp":"...","uptime":...,"environment":"production"}
```

---

### 🔁 Auto-Deploy with GitHub

To enable automatic deploys on every push to `main`:

1. Railway Dashboard → your service → **Settings**
2. Under **Source** → Connect GitHub repo
3. Set **Branch**: `main`
4. Set **Root Directory**: `backend` (or `frontend`)
5. Toggle **Auto Deploy**: ✅ ON

---

### 📋 Railway Deployment Checklist

```
✅ PostgreSQL provisioned
✅ DATABASE_URL set on backend
✅ JWT_ACCESS_SECRET set (min 32 chars)
✅ JWT_REFRESH_SECRET set (min 32 chars)
✅ CLIENT_URL set on backend (= frontend URL)
✅ NEXT_PUBLIC_API_URL set on frontend (= backend URL)
✅ Migrations ran: railway run npx prisma migrate deploy
✅ Seed ran (optional): railway run npx ts-node prisma/seed.ts
✅ Health check passing: GET /health → 200
✅ Frontend loads and can reach API
✅ Login with demo credentials works
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | ✅ | Environment | `production` |
| `PORT` | ✅ | Server port | `5000` |
| `DATABASE_URL` | ✅ | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_ACCESS_SECRET` | ✅ | JWT signing secret (min 32 chars) | `random-64-char-string` |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token secret (min 32 chars) | `another-random-64-char-string` |
| `JWT_ACCESS_EXPIRES_IN` | ✅ | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | ✅ | Refresh token TTL | `7d` |
| `CLIENT_URL` | ✅ | Frontend URL for CORS | `https://app.taskflow.com` |
| `SMTP_HOST` | ❌ | SMTP server (for emails) | `smtp.gmail.com` |
| `SMTP_PORT` | ❌ | SMTP port | `587` |
| `SMTP_USER` | ❌ | SMTP username | `user@gmail.com` |
| `SMTP_PASS` | ❌ | SMTP app password | `app-password` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL | `https://api.taskflow.com` |
| `NEXT_PUBLIC_SOCKET_URL` | ✅ | Socket.IO server URL | `https://api.taskflow.com` |

---

## 📡 API Documentation

Full interactive docs available at `/api-docs` (Swagger UI).

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/auth/register` | Register new user | ❌ |
| `POST` | `/api/v1/auth/login` | Login | ❌ |
| `POST` | `/api/v1/auth/refresh-token` | Refresh access token | ❌ |
| `POST` | `/api/v1/auth/logout` | Logout | ✅ |
| `GET` | `/api/v1/auth/me` | Get current user | ✅ |

### Projects Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/projects` | List user's projects | ✅ |
| `POST` | `/api/v1/projects` | Create project | ✅ |
| `GET` | `/api/v1/projects/:id` | Get project details | ✅ Member |
| `PATCH` | `/api/v1/projects/:id` | Update project | ✅ Admin |
| `DELETE` | `/api/v1/projects/:id` | Delete project | ✅ Admin |
| `POST` | `/api/v1/projects/:id/members` | Add member | ✅ Admin |
| `DELETE` | `/api/v1/projects/:id/members/:userId` | Remove member | ✅ Admin |
| `GET` | `/api/v1/projects/:id/stats` | Project statistics | ✅ Member |

### Tasks Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/tasks?projectId=xxx` | List tasks (filterable) | ✅ |
| `POST` | `/api/v1/tasks` | Create task | ✅ |
| `GET` | `/api/v1/tasks/:id` | Get task details | ✅ |
| `PATCH` | `/api/v1/tasks/:id` | Update task | ✅ |
| `DELETE` | `/api/v1/tasks/:id` | Delete task | ✅ |
| `POST` | `/api/v1/tasks/reorder` | Reorder tasks (drag-drop) | ✅ |

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/dashboard/stats` | Full dashboard analytics |
| `GET` | `/api/v1/dashboard/projects-overview` | Projects with progress |

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/users` | List all users |
| `PATCH` | `/api/v1/users/profile` | Update profile |
| `GET` | `/api/v1/notifications` | Get notifications |
| `PATCH` | `/api/v1/notifications/mark-all-read` | Mark all as read |
| `POST` | `/api/v1/comments` | Add comment |
| `GET` | `/api/v1/activity` | Activity feed |
| `GET` | `/health` | Health check |

---

## 📁 Folder Structure

```
team-task-manager/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database models
│   │   └── seed.ts                # Demo data seeder
│   ├── src/
│   │   ├── config.ts              # Environment config (Zod-validated)
│   │   ├── index.ts               # Server entry point
│   │   ├── controllers/           # HTTP request handlers
│   │   │   └── auth.controller.ts
│   │   ├── services/              # Business logic layer
│   │   │   ├── auth.service.ts
│   │   │   ├── project.service.ts
│   │   │   ├── task.service.ts
│   │   │   └── dashboard.service.ts
│   │   ├── middlewares/           # Express middlewares
│   │   │   ├── auth.middleware.ts # JWT + RBAC
│   │   │   ├── error.middleware.ts
│   │   │   └── validate.middleware.ts
│   │   ├── routes/                # API route definitions
│   │   │   ├── auth.routes.ts
│   │   │   ├── project.routes.ts
│   │   │   ├── task.routes.ts
│   │   │   └── ...
│   │   ├── lib/
│   │   │   └── prisma.ts          # Prisma client singleton
│   │   └── utils/
│   │       ├── jwt.ts
│   │       ├── logger.ts
│   │       ├── apiResponse.ts
│   │       ├── socket.ts
│   │       └── swagger.ts
│   ├── Dockerfile
│   ├── railway.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js App Router
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx     # Protected layout
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── projects/
│   │   │   │   │   ├── page.tsx   # Projects list
│   │   │   │   │   └── [id]/page.tsx  # Kanban board
│   │   │   │   ├── tasks/page.tsx
│   │   │   │   ├── team/page.tsx
│   │   │   │   ├── activity/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # Landing page
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                # ShadCN components
│   │   │   ├── layout/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── header.tsx
│   │   │   ├── projects/
│   │   │   │   └── create-project-dialog.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── task-card.tsx
│   │   │   │   ├── task-detail-dialog.tsx
│   │   │   │   └── create-task-dialog.tsx
│   │   │   └── providers.tsx
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/
│   │   │   └── utils.ts           # Utilities + cn()
│   │   ├── services/
│   │   │   └── api.ts             # Axios client + endpoints
│   │   ├── store/
│   │   │   └── auth.store.ts      # Zustand auth state
│   │   └── types/
│   │       └── index.ts           # TypeScript interfaces
│   ├── Dockerfile
│   ├── railway.json
│   └── package.json
│
├── nginx/
│   └── nginx.conf
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```

---

## 🔄 CI/CD Pipeline

GitHub Actions pipeline (`.github/workflows/ci-cd.yml`):

```
Push to main
    │
    ├─► Lint & TypeCheck (backend + frontend)
    │
    ├─► Build Backend (tsc + prisma generate)
    │
    ├─► Build Frontend (next build)
    │
    ├─► Docker: Build & Push images to DockerHub
    │
    └─► Deploy to Railway (backend + frontend)
```

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `RAILWAY_TOKEN` | Railway API token (from railway.app → Account → Tokens) |
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `NEXT_PUBLIC_API_URL` | Production backend URL |

---

## 🗄 Database Schema

```
User ──── ProjectMember ──── Project ──── Task ──── Comment
 │                                │         │
 │                                │         └──── Subtask
 │                                │         └──── ActivityLog
 └──── RefreshToken               └──── Invitation
 └──── Notification
 └──── ActivityLog
```

8 tables, 25+ indexes, cascading deletes for data integrity.

---

## 🔒 Security

- **Helmet** — HTTP security headers
- **Rate limiting** — 100 req/15min globally, 10 req/15min for auth
- **CORS** — Allowlist-based origin control
- **JWT** — Short-lived access tokens (15m) + rotating refresh tokens (7d)
- **bcrypt** — Password hashing with cost factor 12
- **httpOnly cookies** — Refresh tokens never exposed to JS
- **Input validation** — express-validator on all endpoints
- **SQL injection** — Prevented by Prisma parameterized queries
- **XSS** — Input sanitization via xss library

---

## 📄 License

MIT © 2024 TaskFlow

---

<div align="center">
  <strong>Built with ❤️ for productive engineering teams</strong>
  <br/>
  <sub>If this project helped you, please ⭐ star the repo!</sub>
</div>
