# Family Tree Fan Chart Application

A Dockerized web application that visualizes a family tree as a circular fan chart. The application displays family relationships in a radial layout where the oldest member is at the center and each generation expands outward in concentric rings.

## Features

- **Circular Fan Chart Visualization**: Family tree displayed as a radial chart with the oldest member at the center
- **Generation-based Layout**: Each outer ring represents a younger generation
- **Sibling Support**: Siblings appear on the same circular ring
- **Authentication**: Login, registration, and password change (JWT)
- **RESTful API**: FastAPI backend; tree and person endpoints require login
- **Auto-initialization**: Database migrations and seed (sample data + default user) on first startup
- **Docker-based**: Fully containerized for easy deployment

## Architecture

- **Frontend**: React with D3.js for visualization
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start (Local Development)

1. **Clone or navigate to the project directory**:
   ```bash
   cd FamTree
   ```

2. **Start the application**:
   ```bash
   docker compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost (login required)
   - Backend API: http://localhost:8000
   - API docs: http://localhost:8000/docs

4. **Default login** (created on first seed): username **admin**, password **admin**. Change the password after first login (Settings).

The application will automatically run migrations, seed sample family data and the default user, then start the API and frontend.

## Project Structure

```
FamTree/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── auth.py              # Password hashing and JWT
│   │   ├── database.py          # Database connection and session
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── main.py              # FastAPI application
│   │   └── services.py          # Business logic for tree building
│   ├── alembic/                 # Database migrations
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile               # Backend container definition
│   ├── init_db.py               # Database initialization script
│   └── seed_data.py             # Sample data seeding
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FamilyTreeChart.js   # D3.js visualization component
│   │   │   └── FamilyTreeChart.css
│   │   ├── App.js                # Main React component
│   │   ├── App.css
│   │   ├── index.js              # React entry point
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── Dockerfile               # Frontend container definition
│   └── nginx.conf               # Nginx configuration
├── docker-compose.yml           # Compose (dev: volume + reload)
├── docker-compose.prod.yml      # Production overrides (no mount, no reload)
├── .env.example                 # Example env vars; copy to .env for production
└── README.md
```

## API Endpoints

All tree and person endpoints require `Authorization: Bearer <token>` (obtain token via login).

- **POST /api/auth/register** – Create account. Body: `{ "username", "password" }`
- **POST /api/auth/login** – Login. Body: `{ "username", "password" }`. Returns `access_token`, `username`
- **POST /api/auth/change-password** – Change password (auth required). Body: `{ "current_password", "new_password" }`

**Protected (require JWT):**

- **GET /api/tree** – Family tree for fan chart (nested structure with children, positions)
- **GET /api/persons** – List all persons
- **POST /api/persons** – Create person. Body: `{ "first_name", "last_name", "birth_date", "gender", "parent_id" }`
- **GET /api/persons/{id}**, **PUT /api/persons/{id}**, **DELETE /api/persons/{id}** – Get, update, delete person

## Database Schema

### Person Table
- `id` (Integer, Primary Key)
- `first_name` (String)
- `last_name` (String)
- `birth_date` (Date)
- `gender` (String: "male", "female", "other")
- `parent_id` (Integer, Foreign Key to Person.id, nullable)

## Family Tree Logic

1. **Root Node**: The oldest person (earliest birth_date with no parent) is placed at the center
2. **Generations**: Each generation is represented by a concentric ring
3. **Siblings**: Children of the same parent appear on the same ring
4. **Positioning**: Children are distributed in a fan pattern around their parent
5. **Visualization**: 
   - Blue circles = Male
   - Pink circles = Female
   - Gray circles = Other/Unknown
   - Lines connect parents to children

## Deployment (Production)

1. **Copy the project to your server** and create a `.env` from the example:
   ```bash
   cp .env.example .env
   # Edit .env: set SECRET_KEY (long random string), strong POSTGRES_PASSWORD, and ALLOWED_ORIGINS
   ```

2. **Set production environment variables** (in `.env` or your host):
   - **SECRET_KEY** – Required. Use a long random string (e.g. `openssl rand -hex 32`).
   - **POSTGRES_PASSWORD** – Use a strong password.
   - **ALLOWED_ORIGINS** – Comma-separated origins, e.g. `https://yourdomain.com` (no trailing slash). Use `*` only for dev.

3. **Run in production mode** (no source mount, no reload):
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
   ```

4. **Reverse proxy and SSL**: Put Nginx or Caddy in front of the app, proxy to `localhost:80`, and add TLS (e.g. Let’s Encrypt). The frontend container already serves the app and proxies `/api` to the backend.

## Stopping the Application

```bash
docker compose down
```

To also remove volumes (database data):
```bash
docker compose down -v
```

## Troubleshooting

### Database connection issues
- Ensure the database container is healthy: `docker-compose ps`
- Check database logs: `docker-compose logs db`

### Frontend not loading
- Check frontend logs: `docker-compose logs frontend`
- Verify backend is running: `curl http://localhost:8000/api/tree`

### Port conflicts
- If port 80 or 8000 are in use, modify `docker-compose.yml` to use different ports

## Development

### Running Backend Only
```bash
cd backend
docker compose up db -d
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Running Frontend Only
```bash
cd frontend
npm install
npm start
```

## License

This project is provided as-is for demonstration purposes.
