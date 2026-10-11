# PVault API

PVault API is a secure password vault backend built with Node.js, Express, and MongoDB. It provides user authentication, protected vault item storage, and encrypted credential handling for password manager-style workflows.

## Features

- User registration and login
- JWT-based authentication for protected routes
- Password update flow for authenticated users
- Password vault item CRUD operations
- AES-256-GCM encryption for stored secrets
- MongoDB persistence with Mongoose
- Rate limiting and security middleware with Helmet and CORS
- Auth logging for login, logout, and password events
- Health check endpoint

## Tech Stack

- Node.js 20+
- Express 5
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs for password hashing
- AES-256-GCM encryption with Node crypto
- dotenv for configuration
- Helmet, CORS, and express-rate-limit

## Project Structure

```text
pvault-api/
├── api/
│   └── index.js
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/
│   │   ├── auth.controllers.js
│   │   ├── authLogs.controllers.js
│   │   └── vault.controller.js
│   ├── logger/
│   │   └── auth.logs.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── AuthLogs.js
│   │   ├── User.js
│   │   └── VaultItem.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── vault.routes.js
│   └── utils/
│       ├── ApiError.js
│       └── crypto.js
├── .env.example
├── package.json
├── server.js
├── vercel.json
└── README.md
```

## Prerequisites

Before running the API, make sure you have:

- Node.js 20 or newer
- MongoDB instance running locally or remotely
- A valid `.env` file with required config values

## Environment Variables

Create a `.env` file in the project root with the following values:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/pvault
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=64_character_hex_string_for_aes_256_gcm
```

Notes:

- `ENCRYPTION_KEY` must be exactly 64 characters long to satisfy the 256-bit key requirement.
- `JWT_SECRET` should be a strong random value.
- `MONGODB_URI` should point to your MongoDB database.

## Installation

Install dependencies with npm or pnpm:

```bash
npm install
# or
pnpm install
```

## Running the Project

Development mode:

```bash
npm run dev
```

Or start the app directly:

```bash
npm start
```

The app starts on `http://localhost:<PORT>` as configured in `.env`.

## API Overview

Base URL:

```text
http://localhost:3000/api/v1
```

### Authentication Endpoints

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/v1/users` | Register a new user |
| POST | `/api/v1/sessions` | Log in and receive a JWT |
| DELETE | `/api/v1/sessions/current` | Log out the current authenticated user |
| GET | `/api/v1/users/me` | Fetch the current authenticated user |
| PATCH | `/api/v1/users/me/password` | Change the current user's password |
| GET | `/api/v1/auth-logs` | Get recent authentication logs |
| DELETE | `/api/v1/auth-logs` | Delete auth logs for the current user |
| GET | `/api/v1/auth-logs/export` | Export auth logs |
| GET | `/api/v1/auth-logs/backup` | Backup auth log data |

### Vault Item Endpoints

All vault routes require a valid Bearer token.

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/v1/vault-items` | Create a vault item |
| GET | `/api/v1/vault-items` | List vault items for the current user |
| GET | `/api/v1/vault-items/:itemId` | Retrieve one vault item |
| PATCH | `/api/v1/vault-items/:itemId` | Update a vault item |
| DELETE | `/api/v1/vault-items/:itemId` | Delete a vault item |

### Health Check

```bash
GET /health
```

Returns a simple JSON response showing the server status.

## Authentication

Protected endpoints require an Authorization header like this:

```http
Authorization: Bearer <token>
```

Example:

```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer <your-jwt>"
```

## Example Requests

### Register a user

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create a vault item

```bash
curl -X POST http://localhost:3000/api/v1/vault-items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt>" \
  -d '{
    "siteName": "GitHub",
    "siteUrl": "https://github.com",
    "username": "octocat",
    "password": "super-secret-password",
    "notes": "Primary work account"
  }'
```

## Security Notes

- Passwords are hashed with bcrypt before storage.
- Vault secrets are encrypted before being saved to MongoDB using AES-256-GCM.
- JWT tokens are required for all vault operations.
- Request rate limiting helps reduce abuse on authentication routes.
- Sensitive configuration is kept in environment variables instead of source code.

## License

This project is licensed under the MIT License.

## Notes

This application is intended for backend/API usage and is most useful when paired with a frontend client or an API consumer such as a browser app, mobile app, or admin dashboard.
