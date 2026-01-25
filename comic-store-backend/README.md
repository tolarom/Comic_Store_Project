# Comic Store Backend

Actix Web + MongoDB backend with **simple** JWT authentication.

## Features

- 🔐 Simple JWT authentication for route protection
- 📦 MongoDB database
- 🚀 Fast and reliable with Actix Web
- 📝 Easy to understand and modify

## Quick Start

1. Install Rust and ensure `cargo` is available.
2. Copy `.env.example` to `.env` and configure:

```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=comic_store
SERVER_ADDRESS=127.0.0.1
SERVER_PORT=8080
JWT_SECRET=my-secret-key
RUST_LOG=info
```

3. Build and run:

```bash
cargo build
cargo run
```

Server starts at http://127.0.0.1:8080

## Simplified Authentication

The authentication is intentionally kept simple - no complex middleware or route guards. Just:

1. **Register** or **Login** to get a JWT token
2. Include the token in requests that need auth: `Authorization: Bearer <token>`
3. Endpoints check the token when needed

### Register a new user
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
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
    "password": "password123"
  }'
```

### Use the token
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Key Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login and get token
- GET /api/auth/me - Get current user (needs token)

### Products
- GET /api/products - List all products
- POST /api/products - Create product
- PUT /api/products/{id} - Update product
- DELETE /api/products/{id} - Delete product

### Other Resources
- Users, Orders, Ratings, Categories, Groups, Carts

See [API_ENDPOINTS.md](API_ENDPOINTS.md) for complete API documentation.
See [SECURITY.md](SECURITY.md) for authentication details.
