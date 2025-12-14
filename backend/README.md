# DocShield FastAPI Backend

Professional Python backend for DocShield document verification platform.

## QuickStart

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Run Server
```bash
python -m app.main
# Or with uvicorn:
uvicorn app.main:app --reload
```

Server runs on: http://localhost:8000

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app
│   ├── config.py        # Settings
│   ├── database.py      # MongoDB
│   │
│   ├── api/             # API routes
│   │   ├── auth.py      # Authentication
│   │   ├── documents.py # Document CRUD
│   │   └── ai.py        # AI chatbot
│   │
│   ├── schemas/         # Pydantic models
│   │   └── user.py
│   │
│   └── core/            # Core utilities
│       └── security.py  # JWT, passwords
│
├── requirements.txt
└── .env
```

## Features

✅ **Authentication**
- JWT tokens
- bcrypt password hashing
- Register & login endpoints

✅ **AI Chatbot**
- Groq integration
- Streaming responses
- Llama 3.3 70B model

✅ **MongoDB**
- Async driver (Motor)
- User management
- Document storage

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user

### Documents (Coming in v0.2.0)
- `GET /api/documents` - List documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/{id}` - Get document
- `DELETE /api/documents/{id}` - Delete document

### AI
- `POST /api/ai/chat` - Chat with AI assistant

## Development

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Format code
black app/
isort app/
```

## Environment Variables

Required:
- `MONGODB_URI` - MongoDB connection string
- `SECRET_KEY` - JWT secret key
- `GROQ_API_KEY` - Groq API key

Optional:
- `DEBUG` - Debug mode (default: True)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiry (default: 30)

## Tech Stack

- **FastAPI** - Modern async Python framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **JWT** - Authentication
- **Groq** - AI integration
- **bcrypt** - Password hashing

---

Built with ❤️ using FastAPI & Python 3.11+
