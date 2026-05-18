# Internship Portal Backend

## Project Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   ├── routes/           # API route definitions
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   ├── middlewares/      # Express middlewares
│   ├── utils/            # Helper functions
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── data/                 # JSON data storage
├── tests/                # Tests
├── .env                  # Environment variables
└── package.json
```

The core portal entity model stubs live in `src/models` and use one file per entity: `user`, `student`, `company`, `internship`, `application`, `interview`, `document`, and `notification`.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`

3. Start the server:
```bash
npm start
```

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user

### Users
- GET `/api/users` - Get all users (protected)
- GET `/api/users/:id` - Get user by ID (protected)
- PUT `/api/users/:id` - Update user (protected)
- DELETE `/api/users/:id` - Delete user (protected)
