# CivicAlert — Crowdsourced Civic Issue Reporting & Resolution System

A full-stack platform for citizens to report and track civic/environmental issues in their community.

##  Project Structure

```
civic-alert/
├── backend/                  # Python Flask REST API
│   ├── app.py                # Entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── config/
│   │   └── db.py             # MongoDB connection
│   ├── models/
│   │   ├── user.py           # User schema + helpers
│   │   └── issue.py          # Issue schema + helpers
│   ├── routes/
│   │   ├── auth.py           # /api/auth/*
│   │   └── issues.py         # /api/issues/*
│   └── middleware/
│       └── auth.py           # JWT decorators
└── frontend/                 # React + Vite
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx     # Auth state + login/register
        ├── hooks/
        │   └── useIssues.js        # Data fetching hooks
        ├── utils/
        │   └── api.js              # Axios instance + interceptors
        ├── components/
        │   ├── Navbar.jsx
        │   ├── IssueCard.jsx       # Issue list card + inline vote
        │   ├── IssueModal.jsx      # Full detail, comments, status
        │   ├── ReportForm.jsx      # New issue form w/ geotag + photo
        │   └── StatsBar.jsx        # Dashboard summary cards
        └── pages/
            ├── Home.jsx            # Issue feed with filters
            ├── Login.jsx
            ├── Register.jsx
            └── Dashboard.jsx       # User profile + my issues
```

## ⚙️ Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React 18, React Router v6, Vite |
| Styling   | Inline styles (no build dep)  |
| HTTP      | Axios                         |
| Backend   | Python 3.10+, Flask 3         |
| Auth      | JWT (flask-jwt-extended)      |
| Database  | MongoDB + PyMongo             |
| Uploads   | Werkzeug multipart/form-data  |

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### Backend Setup

```bash
cd backend

# Copy env file
cp .env.example .env
# Edit .env with your MongoDB URI and a strong JWT secret

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server (port 5000)
python app.py
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev    # Runs on http://localhost:3000
```

Frontend proxies `/api/*` and `/uploads/*` to the Flask backend via `vite.config.js`.

## 🔌 API Endpoints

### Auth
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | /api/auth/register  | Register new user    |
| POST   | /api/auth/login     | Login, returns JWT   |
| GET    | /api/auth/me        | Get current user     |

### Issues
| Method | Endpoint                        | Auth | Description              |
|--------|---------------------------------|------|--------------------------|
| GET    | /api/issues/                    | No   | List/filter/search       |
| POST   | /api/issues/                    | Yes  | Create issue + photo     |
| GET    | /api/issues/:id                 | No   | Single issue detail      |
| POST   | /api/issues/:id/vote            | Yes  | Toggle upvote            |
| POST   | /api/issues/:id/comment         | Yes  | Add comment              |
| PATCH  | /api/issues/:id/status          | Yes  | Update status            |
| GET    | /api/issues/stats/summary       | No   | Counts by status         |

## ✨ Features

- **User Authentication** — Register, login, JWT-protected routes
- **Issue Reporting** — Title, category, description, address
- **📍 Geotagging** — Auto-detect GPS via browser API, stored as GeoJSON `2dsphere`
- **📷 Photo Uploads** — Multipart form upload, served as static files
- **Voting System** — Toggle upvotes per user (no duplicates)
- **Comments** — Threaded comments on any issue
- **Status Tracking** — Open → In Progress → Resolved (reporter/admin only)
- **Filtering** — By status, category, free-text search, sort by date/votes
- **Dashboard** — User profile with their reported issues + stats
- **Pagination** — Backend paginated results

## 🔐 Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/civic_alert
JWT_SECRET_KEY=your-strong-secret-key
FLASK_ENV=development
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=10485760
```
