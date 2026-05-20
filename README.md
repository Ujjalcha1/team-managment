# 💼 TeamSphere - Modern Team Management Dashboard

TeamSphere is a premium, full-stack workforce planning and team management platform built with **Next.js 16 (App Router, Turbopack)**, **MongoDB/Mongoose**, and **Zustand**. Designed with modern aesthetics including glassmorphism, fluid micro-animations, and a robust dark mode, it offers interactive workforce insights, role-based CRUD permissions, real-time activity auditing, and customizable profile preferences.

---

## ✨ Features

- **📊 Dynamic Analytics Dashboard**
  - Workforce metrics: total employees, active count, leaves, and department totals.
  - Interactive charts (using **Recharts**): hiring trends (Area Chart), department distribution (Bar Chart), and role categories (Pie Chart).
  - Real-time activity feed showing logs of employee additions, updates, register events, and logins.
- **👥 Employee Directory & CRUD (Admin Only)**
  - View employee records in a glassmorphic table with pagination, searching, and filter tools (role, status).
  - Admin controls: Add, Edit, and Delete employee profiles.
  - Dynamic avatar generator using Dicebear seed values matching employee IDs (fully local, no Cloudinary setup needed).
- **🔒 Secure Authentication**
  - JWT & Cookie-based session storage.
  - Client-side navigation guards (`AuthGuard`) to protect dashboard routes.
  - Role-based views: Non-admin users can view directories and details, while only admins can modify entries.
- **🎨 Customizer Settings**
  - Instant theme switcher supporting Light, Dark, and System modes via `next-themes`.
  - Form validation with Zod and React Hook Form.
  - Custom user profile editor to change display name, department, or update account security.

---

## 🛠️ Technology Stack

- **Core Framework:** Next.js 16 (App Router, Turbopack) & React 19
- **Database / ODM:** MongoDB & Mongoose
- **State Management:** Zustand (with persist middleware for session caching)
- **UI Components:** Radix UI (`@base-ui/react`), Lucide Icons
- **Styling:** Tailwind CSS 4 with bespoke CSS variables
- **Forms & Validation:** React Hook Form & Zod
- **Visuals:** Recharts (responsive analytics) & Sonner (smooth notifications)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.x or later)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone the repository
```bash
git clone <repository-url>
cd team-management
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory and configure the following variables:
```env
NEXT_PUBLIC_API_URL=/api
MONGODB_URI=mongodb://localhost:27017/team-management
JWT_SECRET=your_jwt_super_secret_key_here
JWT_EXPIRES_IN=7d
```

### 4. Seed the Database
Pre-populate the database with a default Admin account, initial mock employees, and activity logs:
```bash
npm run seed
```
**Default Admin credentials:**
- **Email:** `admin@teamsphere.com`
- **Password:** `password123`

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📁 Directory Structure

```text
├── app/                  # Next.js App Router pages and API routes
│   ├── (auth)/           # Login & Registration views
│   ├── (dashboard)/      # Dashboard, Employees, Analytics, and Settings
│   ├── api/              # Backend endpoints (employees, auth, analytics)
│   └── layout.tsx        # Global provider configuration
├── components/           # Reusable UI component libraries
│   ├── ui/               # Lower-level components (avatars, buttons, dialogs)
│   ├── layout/           # Sidebar, Header, Page frames
│   └── auth/             # Authentication & client navigation guards
├── lib/                  # Server configuration, utilities, database models, & authentication helpers
├── stores/               # Zustand hooks (auth, employees, analytics)
├── types/                # Shared TypeScript models and interfaces
├── seed.ts               # Database populator script
└── package.json          # Dependency definition
```

---

## 🔌 API Reference

| Endpoint | Method | Authentication | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Register a new user |
| `/api/auth/login` | `POST` | Public | User authentication & session generation |
| `/api/auth/me` | `GET` | User | Get current logged-in user details |
| `/api/auth/profile` | `PUT` | User | Update profile metadata |
| `/api/auth/change-password` | `PUT` | User | Change user password |
| `/api/employees` | `GET` | User | Retrieve list of employees (supports filter & search) |
| `/api/employees` | `POST` | Admin | Create a new employee profile |
| `/api/employees/:id` | `GET` | User | Fetch a single employee's details |
| `/api/employees/:id` | `PUT` | Admin | Modify an employee's profile |
| `/api/employees/:id` | `DELETE` | Admin | Permanently remove an employee |
| `/api/employees/:id/upload` | `POST` | Admin | Upload employee profile picture (stubbed) |
| `/api/analytics/overview` | `GET` | User | General workforce stats & totals |
| `/api/analytics/activity` | `GET` | User | Activity feed audit records |

---

## 🎨 Theme Customization & Design System
The app implements a modern visual style governed by unified HSL theme colors located in the CSS. Toggle seamlessly between theme variations without any page flashes or hydration mismatch errors.
