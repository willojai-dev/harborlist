# ⚓ HarborList — Boat Listings Marketplace

A full-stack boat listing platform with React frontend and Node.js/Express backend.

## Tech Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: Node.js + Express
- **Database**: SQLite (via `better-sqlite3`) — zero config, file-based
- **Auth**: JWT (7-day tokens)
- **File Uploads**: Multer (images stored in `backend/uploads/`)

---

## Quick Start

### 1. Install dependencies

```bash
# Root (for concurrently)
npm install

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and set a strong JWT_SECRET
```

### 3. Seed the database with demo data

```bash
cd backend && npm run seed
```

This creates 4 demo users and 8 sample listings.

**Demo login credentials:**
- `james@example.com` / `password123`
- `mark@example.com` / `password123`
- `linda@example.com` / `password123`
- `bob@example.com` / `password123`

### 4. Run in development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## Production Deployment

### Build frontend
```bash
npm run build
```

### Start server (serves frontend + API)
```bash
cd backend
NODE_ENV=production npm start
```

The Express server will serve the React frontend from `frontend/dist/` at port 3001.

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Create account |
| POST | /api/auth/login | — | Login → JWT |
| GET | /api/auth/me | ✅ | Get current user |
| PATCH | /api/auth/me | ✅ | Update profile |

### Listings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/listings | — | Browse with filters |
| GET | /api/listings/mine | ✅ | Seller's own listings |
| GET | /api/listings/:id | — | Single listing detail |
| POST | /api/listings | ✅ | Create listing |
| PATCH | /api/listings/:id | ✅ | Update listing |
| DELETE | /api/listings/:id | ✅ | Delete listing |
| POST | /api/listings/:id/photos | ✅ | Upload photos |
| DELETE | /api/listings/:id/photos/:photoId | ✅ | Delete a photo |

#### Listing query params
`search`, `type`, `condition`, `min_price`, `max_price`, `min_length`, `max_length`, `min_year`, `max_year`, `sort`, `limit`, `offset`

### Messages
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/messages | — | Send message to seller |
| GET | /api/messages | ✅ | Seller inbox |
| PATCH | /api/messages/:id/read | ✅ | Mark as read |

---

## Project Structure

```
harborlist/
├── package.json              # Root scripts (concurrently)
├── backend/
│   ├── server.js             # Express entry point
│   ├── .env.example
│   ├── db/
│   │   ├── index.js          # SQLite schema + init
│   │   └── seed.js           # Demo data seeder
│   ├── middleware/
│   │   ├── auth.js           # JWT middleware
│   │   └── upload.js         # Multer config
│   ├── routes/
│   │   ├── auth.js
│   │   ├── listings.js
│   │   └── messages.js
│   └── uploads/              # Auto-created; stores boat photos
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx            # Routes
        ├── main.jsx
        ├── index.css
        ├── api.js             # API client
        ├── components/
        │   ├── AuthContext.jsx
        │   ├── NavBar.jsx
        │   ├── BoatCard.jsx
        │   └── MapView.jsx
        └── pages/
            ├── HomePage.jsx
            ├── ListingsPage.jsx
            ├── DetailPage.jsx
            ├── AuthPages.jsx   # Login + Register
            ├── ListingFormPage.jsx
            ├── DashboardPage.jsx
            └── InboxPage.jsx
```

---

## Upgrading to PostgreSQL

Swap `better-sqlite3` for `pg` and update `db/index.js` — the query style is similar. Recommended for production with multiple concurrent users.

## Deploying to Render / Railway

1. Push to GitHub
2. Set `NODE_ENV=production` and `JWT_SECRET` as environment variables
3. Build command: `npm install && cd backend && npm install && cd ../frontend && npm install && npm run build`
4. Start command: `cd backend && node server.js`
