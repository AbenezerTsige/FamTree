# Family Tree Fan Chart Application

A Dockerized web application that visualizes a family tree as a circular fan chart. The application displays family relationships in a radial layout where the oldest member is at the center and each generation expands outward in concentric rings.

## Features

- **Circular Fan Chart Visualization**: Family tree displayed as a radial chart with the oldest member at the center
- **Generation-based Layout**: Each outer ring represents a younger generation
- **Sibling Support**: Siblings appear on the same circular ring
- **RESTful API**: FastAPI backend with endpoints for fetching family tree data
- **Auto-initialization**: Database automatically creates and seeds with sample data on first startup
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
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

The application will automatically:
- Create the PostgreSQL database
- Run database migrations
- Seed the database with sample family data
- Start the backend API server
- Serve the frontend application

## Project Structure

```
FamTree/
├── backend/
│   ├── app/
│   │   ├── __init__.py
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
├── docker-compose.yml           # Multi-container orchestration
└── README.md
```

## API Endpoints

### GET `/api/tree`
Returns the entire family tree formatted for fan chart visualization.

**Response**: JSON object with nested tree structure including:
- Person details (id, name, birth_date, gender)
- Children relationships
- Generation information
- Position data (x, y, angle, radius)

### GET `/api/persons`
Returns all persons in the database.

### POST `/api/persons`
Creates a new person in the database.

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "birth_date": "1990-01-01",
  "gender": "male",
  "parent_id": null
}
```

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

## Deployment on Server

The same Docker setup works for both development and production. To deploy on a server:

1. **Copy the project to your server**:
   ```bash
   scp -r FamTree user@your-server:/path/to/deployment
   ```

2. **SSH into your server**:
   ```bash
   ssh user@your-server
   cd /path/to/deployment/FamTree
   ```

3. **Start the application**:
   ```bash
   docker-compose up -d
   ```

4. **Configure reverse proxy** (optional, for custom domain):
   - Set up Nginx or Apache to proxy requests to `localhost:80`
   - Configure SSL certificates if needed

5. **Environment Variables** (optional):
   You can customize the database connection by setting environment variables:
   ```bash
   export DATABASE_URL=postgresql://user:pass@db:5432/dbname
   ```

## Stopping the Application

```bash
docker-compose down
```

To also remove volumes (database data):
```bash
docker-compose down -v
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
docker-compose up db
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
