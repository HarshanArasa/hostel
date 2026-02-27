# HostelOps

**Modern Hostel Complaint & Maintenance Management System**

Built with **Next.js 15** (App Router), **Supabase** (PostgreSQL), **Tailwind CSS**, **Framer Motion**, and JWT-based role auth.

---

## Tech Stack

| Layer       | Technology                      |
|-------------|----------------------------------|
| Frontend    | React (Next.js App Router)       |
| Backend     | Next.js API Routes               |
| Database    | Supabase (PostgreSQL)            |
| Auth        | JWT (jsonwebtoken + bcryptjs)    |
| Styling     | Tailwind CSS                     |
| Animations  | Framer Motion                    |
| Icons       | Lucide React                     |
| Toasts      | react-hot-toast                  |

---

## Quick Start

### 1. Clone & Install

```bash
cd hostelops
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
```

### 3. Set Up Supabase Database

Run the following SQL in your **Supabase SQL Editor** (Dashboard → SQL Editor → New Query):

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster complaint lookups by user
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
```

> **Note:** Disable Row Level Security (RLS) or configure it to allow the Service Role key unrestricted access, since HostelOps handles authorization at the API route level using JWT.

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Request Lifecycle

```
Browser                     Next.js API Route              Supabase
  │                               │                            │
  │── POST /api/auth/login ───────▶│                            │
  │                               │── SELECT users WHERE email ▶│
  │                               │◀── user row ───────────────│
  │                               │ bcrypt.compare(password)   │
  │                               │ signToken(userId, role)    │
  │◀─── { token, user } ─────────│                            │
  │                               │                            │
  │── GET /api/complaints ────────▶│                            │
  │   Authorization: Bearer <tok> │                            │
  │                               │ requireAuth() → verifyToken│
  │                               │── SELECT complaints ───────▶│
  │                               │◀── rows ──────────────────│
  │◀─── { complaints: [...] } ───│                            │
```

---

## Docker

### Build & Run

```bash
# Build image
docker build -t hostelops .

# Run container (pass your env vars)
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e JWT_SECRET=... \
  hostelops
```

### With Nginx

Place `nginx.conf` in `/etc/nginx/sites-available/hostelops`, then:

```bash
sudo ln -s /etc/nginx/sites-available/hostelops /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## Project Structure

```
hostelops/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js       # POST login
│   │   │   └── register/route.js    # POST register
│   │   └── complaints/
│   │       ├── route.js             # GET list / POST create
│   │       └── [id]/route.js        # PUT update status
│   ├── dashboard/
│   │   ├── admin/page.js            # Admin dashboard
│   │   └── student/page.js          # Student dashboard
│   ├── login/page.js
│   ├── register/page.js
│   ├── layout.js                    # Root layout + Toaster
│   ├── page.js                      # Landing page
│   └── globals.css
├── components/
│   ├── ComplaintCard.js
│   ├── Loader.js
│   ├── Navbar.js
│   ├── Sidebar.js
│   └── SkeletonCard.js
├── lib/
│   ├── auth.js                      # JWT helpers
│   └── supabase.js                  # Supabase clients
├── middleware/
│   └── auth.js                      # JWT auth guard
├── .env.example
├── Dockerfile
├── nginx.conf
└── README.md
```

---

## Roles

| Feature                  | Student | Admin |
|--------------------------|:-------:|:-----:|
| Register / Login         | ✓       | ✓     |
| Submit complaint         | ✓       | ✗     |
| View own complaints      | ✓       | ✗     |
| View all complaints      | ✗       | ✓     |
| Filter / search          | ✗       | ✓     |
| Update complaint status  | ✗       | ✓     |
