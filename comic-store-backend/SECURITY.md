# Authentication and Security

## Overview
The Comic Store Backend uses simple JWT (JSON Web Token) for route protection. Authentication is straightforward - just passwords and JWT tokens for protecting routes.

## Security Features

### 1. Simple JWT Authentication
- JWT tokens for route protection
- Token expiration: 24 hours
- Tokens include: user ID, email, role, issued at (iat), and expiration (exp)
- Secret key set via environment variable `JWT_SECRET`
- Simple header extraction - just pass `Authorization: Bearer <token>`

### 2. Route Protection
Routes check for authentication tokens internally. Simply include the Bearer token in the Authorization header when needed.

## Authentication Flow

### Registration
1. Client sends POST request to `/api/auth/register` with user details
2. Server checks if email/username already exists
3. User is created with role "customer" and status "active"
4. JWT token is generated and returned with user info

### Login
1. Client sends POST request to `/api/auth/login` with email and password
2. Server finds user by email
3. Server checks if user is blocked (status = "blocked")
4. Password is compared
5. JWT token is generated and returned with user info

### Making Authenticated Requests
Simply include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Routes that need authentication will check the token. If missing or invalid, you'll get a 401 response.

## Configuration

### Environment Variables
Set in `.env` file:
```env
JWT_SECRET=my-secret-key
```

⚠️ **IMPORTANT**: Use a strong, random secret key in production!

### Generating a Strong Secret Key
```bash
# Using openssl
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## User Roles
- **customer**: Regular users (default)
- **admin**: Administrative users

## User Status
- **active**: User can login and use the system
- **blocked**: User is blocked from logging in

## Simplified Implementation

The authentication is intentionally kept simple:
- No complex middleware chains
- Direct header extraction in handlers that need auth
- All routes accessible, auth checked per-handler
- Easy to understand and modify

## Token Claims Structure
```json
{
  "sub": "507f1f77bcf86cd799439011",  // User ID
  "email": "user@example.com",         // User email
  "role": "customer",                  // User role
  "exp": 1706198400,                   // Expiration timestamp
  "iat": 1706112000                    // Issued at timestamp
}
```

## Example Usage

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123",
    "full_name": "John Doe",
    "address": "123 Main St",
    "phone": "555-1234"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Get Current User (Authenticated)
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
