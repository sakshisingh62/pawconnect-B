# Connecting Backend

Minimal starter backend for Connecting (Express + MongoDB + Cloudinary).

Getting started

1. copy `.env.example` to `.env` and fill values
2. install deps

```bash
cd backend
npm install
npm run dev
```

API endpoints
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me
- GET /api/pets
- GET /api/pets/:id
- POST /api/pets (protected)
- PUT /api/pets/:id (protected, owner only)
- DELETE /api/pets/:id (protected, owner only)
- POST /api/pets/upload (protected, form-data key `image`)
