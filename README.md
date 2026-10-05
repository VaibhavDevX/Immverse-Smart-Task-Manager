# Immverse AI - Smart Task Manager Web Application

A professional, full-stack SaaS Smart Task Manager built for the **Immverse AI Internship Assignment**.

Featuring a **DFS Directed Graph Dependency Engine**, **Completion Lock Validation**, **Self & Circular Dependency Protection**, and a sleek **Next.js App Router + Tailwind CSS Dashboard**.

---

## 🌟 Key Features

1. **User Management & Mock Login**:
   - Create new users with email uniqueness enforcement.
   - Switch active mock session seamlessly across the application.
   - Dedicated `POST /api/auth/login` mock authentication endpoint.

2. **Task CRUD & State Management**:
   - Create, view, edit, and delete tasks.
   - Assign priority (`Low`, `Medium`, `High`) and status (`To Do`, `In Progress`, `Done`).
   - Assign tasks to team members with real-time progress indicators.

3. **Task Dependency & Graph Engine**:
   - Multi-level task dependencies (Task A can depend on Task B & Task C).
   - **Completion Lock**: A task can **only** be marked `Done` when **all** its prerequisite dependencies are `Done`.
   - **Self-Dependency Prevention**: A task cannot depend on itself.
   - **DFS Cycle Detection**: Rejects circular dependency chains (e.g., A ➔ B ➔ C ➔ A) with descriptive graph path errors.
   - **Un-completion Protection**: Prevents reverting a completed task to incomplete if completed dependent tasks rely on it.
   - **Reference Cleanup**: Deleting a task automatically cleans up its ID from all other tasks' dependency arrays.

4. **Views & SaaS Dashboard**:
   - **Dashboard Overview**: KPI summary counters, completion progress bar, priority overview, and recent activity grid.
   - **All Tasks**: Full task board with multi-attribute filter toolbar (Search, Priority, Status, Assignee).
   - **My Tasks**: Tasks assigned specifically to the active mock user.
   - **Blocked Tasks**: Dedicated view of tasks locked due to incomplete prerequisites.
   - **Users Directory**: Team member directory with user switcher & modal.

---

## 🏗️ Tech Stack

### **Backend (`/backend`)**
- **Runtime**: Node.js + Express.js + TypeScript
- **Storage**: In-memory JavaScript `Map` store (resets on server restart)
- **Validation**: Custom DFS Dependency Graph Validator
- **Testing**: Node Native Test Runner + `supertest` (26 automated test cases)

### **Frontend (`/frontend`)**
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS + Custom Glassmorphic Dark SaaS Theme
- **State Management**: Zustand
- **Icons & HTTP**: Lucide React + Axios

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Backend Setup & Launch
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Run automated test suite (26 passing tests)
npm test

# Build TypeScript
npm run build

# Development Mode (auto-reload)
npm run dev
# Backend server runs on http://localhost:5000
```

### 3. Frontend Setup & Launch
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Build production bundle & verify TypeScript
npm run build

# Development Mode
npm run dev
# Frontend web app runs on http://localhost:3000
```

---

## 🔗 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🧪 Testing Summary

The backend includes a comprehensive 26-test suite covering edge cases:

```bash
cd backend
npm test
```

### Test Coverage Highlights:
- User creation, duplicate email rejection & mock login
- Task creation & assignment validation
- Self-dependency & DFS circular dependency rejection (Direct A➔B➔A & Deep A➔B➔C➔A)
- Completion lock enforcement (attempting completion with incomplete prerequisites)
- Un-completion protection (reverting completed prerequisites)
- Automatic reference cleanup upon task deletion
- Integration tests for all HTTP REST routes

---

## 📜 API Endpoints Overview

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create a user |
| `POST` | `/api/auth/login` | Mock login authentication |
| `GET` | `/api/tasks` | Get tasks with optional filters (`priority`, `status`, `assignedTo`, `search`) |
| `GET` | `/api/tasks/my` | Get tasks assigned to active user (`x-user-id` header) |
| `GET` | `/api/tasks/blocked` | Get tasks currently blocked by dependencies |
| `GET` | `/api/tasks/:id` | Get single task details |
| `POST` | `/api/tasks` | Create task with dependency validation |
| `PUT` | `/api/tasks/:id` | Update task details & dependency graph |
| `PATCH` | `/api/tasks/:id/complete` | Complete task (enforces completion lock) |
| `DELETE` | `/api/tasks/:id` | Delete task & clean up references |
