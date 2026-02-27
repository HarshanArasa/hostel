# Docker Instructions for HostelOps

This guide explains how to run the HostelOps application using Docker and Docker Compose.

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

## Setup Instructions

### 1. Environment Variables
Create a file named `.env` in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

### 2. Build and Start
Run the following command to build the image and start the containers:
```bash
docker-compose up -d --build
```
This will start two containers:
- `hostelops`: The Next.js application (internal port 3000).
- `nginx`: The reverse proxy (mapping port 80 to the application).

### 3. Stop
To stop the application:
```bash
docker-compose down
```

## Internal Architecture
- **Next.js Standalone**: The app is built in standalone mode for minimal image size.
- **Nginx Proxy**: Nginx handles static assets and proxies API/page requests to the Node.js server.
- **Environment Variables**: `NEXT_PUBLIC_` variables are baked in at build time, while others are provided at runtime.
