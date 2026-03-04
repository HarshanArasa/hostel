# Sahyadri Hostel

**Modern Sahyadri Hostel Complaint & Maintenance Management System**

Built with **Next.js 15** (App Router), **Neon (PostgreSQL)**, **Tailwind CSS**, **Framer Motion**, and JWT-based role auth.

---

## Tech Stack

| Layer       | Technology                      |
|-------------|----------------------------------|
| Frontend    | React (Next.js App Router)       |
| Backend     | Next.js API Routes               |
| Database    | Neon (PostgreSQL)                |
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
MONGODB_URI=mongodb+srv://your-user:your-password@cluster.mongodb.net/hostelops
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
ADMIN_EMAIL=admin@hostelops.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=HostelOps Admin
```

### 3. Set Up Initial Admin

After configuring your `MONGODB_URI`, run the seed route to create the initial admin account:
`POST /api/auth/seed`

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Request Lifecycle

```
Browser                     Next.js API Route              MongoDB
  │                               │                            │
  │── POST /api/auth/login ───────▶│                            │
  │                               │── findOne({ email }) ──────▶│
  │                               │◀── user document ──────────│
  │                               │ bcrypt.compare(password)   │
  │                               │ signToken(userId, role)    │
  │◀─── { token, user } ─────────│                            │
  │                               │                            │
  │── GET /api/complaints ────────▶│                            │
  │   Authorization: Bearer <tok> │                            │
  │                               │ requireAuth() → verifyToken│
  │                               │── find().populate(...) ────▶│
  │                               │◀── documents ──────────────│
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
  -e MONGODB_URI=... \
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
=======
# hostel
>>>>>>> fb48cc15c2f46915a3152736d2466c8be22f1577
