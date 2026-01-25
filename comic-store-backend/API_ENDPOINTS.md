# Comic Store Backend API

Base URL
- Local (default): http://127.0.0.1:8080

Response Envelope
- success: boolean
- message: string
- data: object | array | null

ID Format
- Path params like `id`, `product_id` are MongoDB ObjectId strings.

Authentication
- Some endpoints require a Bearer token in the Authorization header
- Format: `Authorization: Bearer <token>`
- Token expires after 24 hours
- Routes check authentication as needed - no complex middleware

---

## Health
- GET /health
  - 200: `{ "success": true, "message": "Server is running", "data": null }`

---

## Authentication
- POST /api/auth/register
  - Body:
    ```json
    {
      "username": "john_doe",
      "email": "john@example.com",
      "password": "password123",
      "full_name": "John Doe",
      "address": "123 Main St",
      "phone": "555-1234",
      "country": "USA",
      "gender": "male"
    }
    ```
  - 201: `{ success, message, data: { token, user: UserResponse } }`
  - 400: email or username already exists

- POST /api/auth/login
  - Body:
    ```json
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ```
  - 200: `{ success, message, data: { token, user: UserResponse } }`
  - 401: invalid credentials
  - 403: account blocked

- GET /api/auth/me (Requires Token)
  - Headers: `Authorization: Bearer <token>`
  - 200: `{ success, message, data: UserResponse }`
  - 401: invalid or missing token

UserResponse
```json
{
  "id": "507f1f77bcf86cd799439012",
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "customer"
}
```

---

## Products
- GET /api/products
  - 200: `{ success, message, data: [Product] }`
- GET /api/products/{id}
  - 200: `{ success, message, data: Product }`
  - 400: invalid id
  - 404: not found
- POST /api/products
  - Body:
    ```json
    {
      "title": "Spider-Man #1",
      "description": "Amazing spider-man",
      "price": 15.99,
      "category": "comics",
      "stock": 50,
      "image_url": "http://example.com/img.jpg"
    }
    ```
  - 201: `{ success, message, data: Product }`
- PUT /api/products/{id}
  - Body (partial allowed):
    ```json
    { "price": 19.99, "stock": 45 }
    ```
  - 200: `{ success, message, data: "Product updated" }`
  - 400 | 404 on errors
- DELETE /api/products/{id}
  - 200: `{ success, message, data: "Product deleted" }`

Product
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Batman #1",
  "description": "Dark Knight Returns",
  "price": 12.99,
  "category": "comics",
  "stock": 100,
  "image_url": "https://example.com/batman.jpg",
  "created_at": "2024-01-21T10:30:00Z",
  "updated_at": "2024-01-21T10:30:00Z"
}
```

---

## Users
- GET /api/users
  - 200: `{ success, message, data: [User] }`
- GET /api/users/{id}
  - 200: `{ success, message, data: User }`
  - 400 | 404 on errors
- POST /api/users
  - Body:
    ```json
    {
      "username": "john_doe",
      "email": "john@example.com",
      "password": "password123",
      "full_name": "John Doe",
      "address": "123 Main St",
      "phone": "555-1234",
      "role": "customer",
      "country": "USA",
      "gender": "male"
    }
    ```
  - Note: `role` is optional, defaults to "customer" if not provided. Can be "admin" or "customer".
  - 201: `{ success, message, data: User }`
- DELETE /api/users/{id}
  - 200: `{ success, message, data: "User deleted" }`

User
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "address": "123 Main St",
  "phone": "555-1234",
  "role": "customer",
  "country": "USA",
  "gender": "male",
  "created_at": "2024-01-21T10:30:00Z",
  "updated_at": "2024-01-21T10:30:00Z"
}
```

---

## Orders
- GET /api/orders
  - 200: `{ success, message, data: [Order] }`
- GET /api/orders/{id}
  - 200: `{ success, message, data: Order }`
  - 400 | 404 on errors
- POST /api/orders
  - Body:
    ```json
    {
      "user_id": "507f1f77bcf86cd799439012",
      "products": [
        { "product_id": "507f1f77bcf86cd799439011", "quantity": 2, "price": 12.99 }
      ],
      "total_price": 25.98
    }
    ```
  - 201: `{ success, message, data: Order }`
- DELETE /api/orders/{id}
  - 200: `{ success, message, data: "Order deleted" }`

Order
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "user_id": "507f1f77bcf86cd799439012",
  "products": [ { "product_id": "507f1f77bcf86cd799439011", "quantity": 2, "price": 12.99 } ],
  "total_price": 25.98,
  "status": "pending",
  "created_at": "2024-01-21T10:30:00Z",
  "updated_at": "2024-01-21T10:30:00Z"
}
```

---

## Ratings
- GET /api/ratings
  - 200: `{ success, message, data: [Rating] }`
- GET /api/ratings/product/{product_id}
  - 200: `{ success, message, data: [Rating] }`
- POST /api/ratings
  - Body:
    ```json
    {
      "product_id": "507f1f77bcf86cd799439011",
      "user_id": "507f1f77bcf86cd799439012",
      "rating": 5,
      "review": "Excellent comic book!"
    }
    ```
  - 400: rating must be 1..5
  - 201: `{ success, message, data: Rating }`
- DELETE /api/ratings/{id}
  - 200: `{ success, message, data: "Rating deleted" }`

Rating
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "product_id": "507f1f77bcf86cd799439011",
  "user_id": "507f1f77bcf86cd799439012",
  "rating": 5,
  "review": "Excellent comic book!",
  "created_at": "2024-01-21T10:30:00Z",
  "updated_at": "2024-01-21T10:30:00Z"
}
```

---

## Error Codes
- 200: Success
- 201: Created
- 400: Bad Request (e.g., invalid ObjectId, rating out of range)
- 404: Not Found
- 500: Internal Server Error

Notes
- Configure host and port via `.env` (`SERVER_ADDRESS`, `SERVER_PORT`).
- All responses use the standard envelope described above.
