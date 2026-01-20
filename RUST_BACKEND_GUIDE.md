# 🦀 Rust Backend API Guide for Comic Store (MongoDB/NoSQL)

This guide will walk you through creating a Rust backend API with MongoDB (NoSQL) that integrates with your Vue.js Comic Store frontend.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Project Structure](#project-structure)
4. [MongoDB Setup](#mongodb-setup)
5. [Models & Schemas](#models--schemas)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Authorization](#authentication--authorization)
8. [Implementing Features](#implementing-features)
9. [Error Handling](#error-handling)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Frontend Integration](#frontend-integration)

---

## Prerequisites

### Install Rust
```bash
# Windows (using rustup)
# Download and run rustup-init.exe from https://rustup.rs/

# Or using winget
winget install Rustlang.Rustup

# Verify installation
rustc --version
cargo --version
```

### Required Tools
```bash
# Install additional tools
cargo install cargo-watch  # For hot reloading
cargo install cargo-edit   # For easy dependency management
```

### MongoDB
Option 1 - Install MongoDB locally:
```bash
# Windows - Download from https://www.mongodb.com/try/download/community
# Or use winget
winget install MongoDB.Server
```

Option 2 - Use Docker:
```bash
docker run --name comic-store-mongo -p 27017:27017 -d mongo:latest
```

Option 3 - Use MongoDB Atlas (Cloud):
- Create free account at https://www.mongodb.com/atlas
- Create a cluster and get connection string

---

## Project Setup

### 1. Create New Project
```bash
cargo new comic-store-api
cd comic-store-api
```

### 2. Add Dependencies to `Cargo.toml`
```toml
[package]
name = "comic-store-api"
version = "0.1.0"
edition = "2021"

[dependencies]
# Web Framework
axum = { version = "0.7", features = ["macros"] }
tokio = { version = "1.0", features = ["full"] }
tower = "0.4"
tower-http = { version = "0.5", features = ["cors", "trace"] }

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# MongoDB
mongodb = "2.8"
bson = { version = "2.9", features = ["chrono-0_4"] }
futures = "0.3"

# Authentication
jsonwebtoken = "9.0"
bcrypt = "0.15"

# Utilities
chrono = { version = "0.4", features = ["serde"] }
uuid = { version = "1.0", features = ["v4", "serde"] }
dotenvy = "0.15"
thiserror = "1.0"
validator = { version = "0.18", features = ["derive"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
rand = "0.8"

[dev-dependencies]
reqwest = { version = "0.11", features = ["json"] }
```

### 3. Environment Configuration
Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=comic_store
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=86400
RUST_LOG=debug
SERVER_HOST=127.0.0.1
SERVER_PORT=8080
```

---

## Project Structure

```
comic-store-api/
├── Cargo.toml
├── .env
├── src/
│   ├── main.rs
│   ├── lib.rs
│   ├── config/
│   │   └── mod.rs
│   ├── db/
│   │   └── mod.rs
│   ├── models/
│   │   ├── mod.rs
│   │   ├── user.rs
│   │   ├── product.rs
│   │   ├── order.rs
│   │   ├── cart.rs
│   │   └── rating.rs
│   ├── handlers/
│   │   ├── mod.rs
│   │   ├── auth.rs
│   │   ├── users.rs
│   │   ├── products.rs
│   │   ├── orders.rs
│   │   ├── cart.rs
│   │   ├── ratings.rs
│   │   └── admin.rs
│   ├── middleware/
│   │   ├── mod.rs
│   │   └── auth.rs
│   ├── routes/
│   │   └── mod.rs
│   ├── services/
│   │   ├── mod.rs
│   │   └── db_service.rs
│   └── errors/
│       └── mod.rs
└── tests/
    └── integration_tests.rs
```

---

## MongoDB Setup

### Database Service

#### `src/db/mod.rs`
```rust
use mongodb::{Client, Database, Collection, IndexModel};
use mongodb::options::{ClientOptions, IndexOptions};
use bson::doc;
use std::env;

pub struct MongoDB {
    pub client: Client,
    pub db: Database,
}

impl MongoDB {
    pub async fn init() -> Result<Self, mongodb::error::Error> {
        let uri = env::var("MONGODB_URI").unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
        let db_name = env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string());

        let mut client_options = ClientOptions::parse(&uri).await?;
        client_options.app_name = Some("comic-store-api".to_string());

        let client = Client::with_options(client_options)?;
        let db = client.database(&db_name);

        // Test connection
        db.run_command(doc! { "ping": 1 }, None).await?;
        tracing::info!("Connected to MongoDB!");

        let mongo = Self { client, db };
        
        // Create indexes
        mongo.create_indexes().await?;

        Ok(mongo)
    }

    async fn create_indexes(&self) -> Result<(), mongodb::error::Error> {
        // Users indexes
        let users_collection = self.db.collection::<bson::Document>("users");
        users_collection.create_index(
            IndexModel::builder()
                .keys(doc! { "email": 1 })
                .options(IndexOptions::builder().unique(true).build())
                .build(),
            None,
        ).await?;

        // Products indexes
        let products_collection = self.db.collection::<bson::Document>("products");
        products_collection.create_index(
            IndexModel::builder()
                .keys(doc! { "title": "text", "description": "text" })
                .build(),
            None,
        ).await?;
        products_collection.create_index(
            IndexModel::builder()
                .keys(doc! { "category": 1 })
                .build(),
            None,
        ).await?;

        // Orders indexes
        let orders_collection = self.db.collection::<bson::Document>("orders");
        orders_collection.create_index(
            IndexModel::builder()
                .keys(doc! { "user_id": 1 })
                .build(),
            None,
        ).await?;
        orders_collection.create_index(
            IndexModel::builder()
                .keys(doc! { "status": 1 })
                .build(),
            None,
        ).await?;

        // Cart indexes
        let cart_collection = self.db.collection::<bson::Document>("carts");
        cart_collection.create_index(
            IndexModel::builder()
                .keys(doc! { "user_id": 1 })
                .options(IndexOptions::builder().unique(true).build())
                .build(),
            None,
        ).await?;

        // Ratings indexes
        let ratings_collection = self.db.collection::<bson::Document>("ratings");
        ratings_collection.create_index(
            IndexModel::builder()
                .keys(doc! { "product_id": 1 })
                .build(),
            None,
        ).await?;
        ratings_collection.create_index(
            IndexModel::builder()
                .keys(doc! { "user_id": 1, "product_id": 1, "order_id": 1 })
                .options(IndexOptions::builder().unique(true).build())
                .build(),
            None,
        ).await?;

        tracing::info!("Created MongoDB indexes");
        Ok(())
    }

    pub fn collection<T>(&self, name: &str) -> Collection<T> {
        self.db.collection(name)
    }
}
```

---

## Models & Schemas

### `src/models/mod.rs`
```rust
pub mod user;
pub mod product;
pub mod order;
pub mod cart;
pub mod rating;

pub use user::*;
pub use product::*;
pub use order::*;
pub use cart::*;
pub use rating::*;
```

### `src/models/user.rs`
```rust
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub role: UserRole,
    pub status: UserStatus,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub joined_date: DateTime<Utc>,
    pub last_login: Option<DateTime<Utc>>,
    pub total_orders: i32,
    pub total_spent: f64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum UserRole {
    Customer,
    Admin,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum UserStatus {
    Active,
    Blocked,
}

impl Default for User {
    fn default() -> Self {
        let now = Utc::now();
        Self {
            id: None,
            name: String::new(),
            email: String::new(),
            password_hash: String::new(),
            role: UserRole::Customer,
            status: UserStatus::Active,
            phone: None,
            address: None,
            joined_date: now,
            last_login: None,
            total_orders: 0,
            total_spent: 0.0,
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateUserRequest {
    #[validate(length(min = 2, max = 255))]
    pub name: String,
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 6))]
    pub password: String,
    pub phone: Option<String>,
    pub address: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct LoginRequest {
    #[validate(email)]
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: UserRole,
    pub status: UserStatus,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub joined_date: DateTime<Utc>,
    pub total_orders: i32,
    pub total_spent: f64,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        UserResponse {
            id: user.id.map(|id| id.to_hex()).unwrap_or_default(),
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            phone: user.phone,
            address: user.address,
            joined_date: user.joined_date,
            total_orders: user.total_orders,
            total_spent: user.total_spent,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserRequest {
    pub name: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserStatusRequest {
    pub status: UserStatus,
}
```

### `src/models/product.rs`
```rust
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Product {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub title: String,
    pub subtitle: Option<String>,
    pub description: Option<String>,
    pub price: f64,
    pub discount: i32,
    pub rating: f64,
    pub review_count: i32,
    pub image: Option<String>,
    pub category: Option<String>,
    pub stock: i32,
    pub sales: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Default for Product {
    fn default() -> Self {
        let now = Utc::now();
        Self {
            id: None,
            title: String::new(),
            subtitle: None,
            description: None,
            price: 0.0,
            discount: 0,
            rating: 0.0,
            review_count: 0,
            image: None,
            category: None,
            stock: 0,
            sales: 0,
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct ProductResponse {
    pub id: String,
    pub title: String,
    pub subtitle: Option<String>,
    pub description: Option<String>,
    pub price: f64,
    pub discount: i32,
    pub rating: f64,
    pub review_count: i32,
    pub image: Option<String>,
    pub category: Option<String>,
    pub stock: i32,
    pub sales: i32,
}

impl From<Product> for ProductResponse {
    fn from(product: Product) -> Self {
        ProductResponse {
            id: product.id.map(|id| id.to_hex()).unwrap_or_default(),
            title: product.title,
            subtitle: product.subtitle,
            description: product.description,
            price: product.price,
            discount: product.discount,
            rating: product.rating,
            review_count: product.review_count,
            image: product.image,
            category: product.category,
            stock: product.stock,
            sales: product.sales,
        }
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateProductRequest {
    #[validate(length(min = 1, max = 255))]
    pub title: String,
    pub subtitle: Option<String>,
    pub description: Option<String>,
    #[validate(range(min = 0.01))]
    pub price: f64,
    #[validate(range(min = 0, max = 100))]
    pub discount: Option<i32>,
    pub image: Option<String>,
    pub category: Option<String>,
    #[validate(range(min = 0))]
    pub stock: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProductRequest {
    pub title: Option<String>,
    pub subtitle: Option<String>,
    pub description: Option<String>,
    pub price: Option<f64>,
    pub discount: Option<i32>,
    pub image: Option<String>,
    pub category: Option<String>,
    pub stock: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct ProductQuery {
    pub category: Option<String>,
    pub search: Option<String>,
    pub min_price: Option<f64>,
    pub max_price: Option<f64>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct ProductListResponse {
    pub products: Vec<ProductResponse>,
    pub total: i64,
    pub page: i64,
    pub limit: i64,
    pub total_pages: i64,
}
```

### `src/models/order.rs`
```rust
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum OrderStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "processing")]
    Processing,
    #[serde(rename = "shipped")]
    Shipped,
    #[serde(rename = "delivered")]
    Delivered,
    #[serde(rename = "cancelled")]
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ShippingMethod {
    #[serde(rename = "delivery")]
    Delivery,
    #[serde(rename = "pickup")]
    Pickup,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderItem {
    pub product_id: String,
    pub name: String,
    pub price: f64,
    pub quantity: i32,
    pub image: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Order {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub order_id: String,  // Human-readable order ID like "ORD-2026-001"
    pub user_id: ObjectId,
    pub items: Vec<OrderItem>,
    pub total: f64,
    pub status: OrderStatus,
    pub shipping_method: ShippingMethod,
    pub full_name: String,
    pub email: String,
    pub phone: String,
    pub country: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub zip: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct OrderResponse {
    pub id: String,
    pub order_id: String,
    pub items: Vec<OrderItem>,
    pub total: f64,
    pub status: OrderStatus,
    pub shipping_method: ShippingMethod,
    pub full_name: String,
    pub email: String,
    pub phone: String,
    pub country: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub zip: Option<String>,
    pub created_at: DateTime<Utc>,
}

impl From<Order> for OrderResponse {
    fn from(order: Order) -> Self {
        OrderResponse {
            id: order.id.map(|id| id.to_hex()).unwrap_or_default(),
            order_id: order.order_id,
            items: order.items,
            total: order.total,
            status: order.status,
            shipping_method: order.shipping_method,
            full_name: order.full_name,
            email: order.email,
            phone: order.phone,
            country: order.country,
            city: order.city,
            state: order.state,
            zip: order.zip,
            created_at: order.created_at,
        }
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateOrderRequest {
    pub shipping_method: ShippingMethod,
    #[validate(length(min = 2))]
    pub full_name: String,
    #[validate(email)]
    pub email: String,
    pub phone: String,
    pub country: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub zip: Option<String>,
    pub items: Vec<OrderItemRequest>,
}

#[derive(Debug, Deserialize)]
pub struct OrderItemRequest {
    pub product_id: String,
    pub name: String,
    pub price: f64,
    pub quantity: i32,
    pub image: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateOrderStatusRequest {
    pub status: OrderStatus,
}

#[derive(Debug, Deserialize)]
pub struct OrderQuery {
    pub status: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}
```

### `src/models/cart.rs`
```rust
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CartItem {
    pub product_id: ObjectId,
    pub name: String,
    pub price: f64,
    pub quantity: i32,
    pub image: Option<String>,
    pub selected: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cart {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: ObjectId,
    pub items: Vec<CartItem>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct CartItemResponse {
    pub product_id: String,
    pub name: String,
    pub price: f64,
    pub quantity: i32,
    pub image: Option<String>,
    pub selected: bool,
}

impl From<CartItem> for CartItemResponse {
    fn from(item: CartItem) -> Self {
        CartItemResponse {
            product_id: item.product_id.to_hex(),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            selected: item.selected,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct CartResponse {
    pub items: Vec<CartItemResponse>,
    pub subtotal: f64,
    pub shipping: f64,
    pub total: f64,
}

#[derive(Debug, Deserialize)]
pub struct AddToCartRequest {
    pub product_id: String,
    pub quantity: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCartItemRequest {
    pub quantity: Option<i32>,
    pub selected: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct SelectAllRequest {
    pub selected: bool,
}
```

### `src/models/rating.rs`
```rust
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rating {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: ObjectId,
    pub user_name: String,
    pub product_id: ObjectId,
    pub order_id: String,
    pub rating: i32,
    pub comment: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct RatingResponse {
    pub id: String,
    pub user_id: String,
    pub user_name: String,
    pub product_id: String,
    pub order_id: String,
    pub rating: i32,
    pub comment: Option<String>,
    pub created_at: DateTime<Utc>,
}

impl From<Rating> for RatingResponse {
    fn from(rating: Rating) -> Self {
        RatingResponse {
            id: rating.id.map(|id| id.to_hex()).unwrap_or_default(),
            user_id: rating.user_id.to_hex(),
            user_name: rating.user_name,
            product_id: rating.product_id.to_hex(),
            order_id: rating.order_id,
            rating: rating.rating,
            comment: rating.comment,
            created_at: rating.created_at,
        }
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateRatingRequest {
    pub product_id: String,
    pub order_id: String,
    #[validate(range(min = 1, max = 5))]
    pub rating: i32,
    pub comment: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct BulkRatingRequest {
    pub ratings: Vec<CreateRatingRequest>,
}
```

---

## API Endpoints

### `src/routes/mod.rs`
```rust
use axum::{
    routing::{get, post, put, delete, patch},
    Router,
};
use crate::handlers;
use crate::middleware::auth::auth_middleware;
use crate::db::MongoDB;
use std::sync::Arc;

pub struct AppState {
    pub db: MongoDB,
    pub jwt_secret: String,
}

pub fn create_routes(state: Arc<AppState>) -> Router {
    let public_routes = Router::new()
        // Auth routes
        .route("/api/auth/register", post(handlers::auth::register))
        .route("/api/auth/login", post(handlers::auth::login))
        // Public product routes
        .route("/api/products", get(handlers::products::list_products))
        .route("/api/products/:id", get(handlers::products::get_product))
        .route("/api/products/:id/ratings", get(handlers::ratings::get_product_ratings));

    let protected_routes = Router::new()
        // User routes
        .route("/api/users/me", get(handlers::users::get_current_user))
        .route("/api/users/me", put(handlers::users::update_current_user))
        .route("/api/users/me/password", put(handlers::users::change_password))
        // Cart routes
        .route("/api/cart", get(handlers::cart::get_cart))
        .route("/api/cart", post(handlers::cart::add_to_cart))
        .route("/api/cart/:product_id", put(handlers::cart::update_cart_item))
        .route("/api/cart/:product_id", delete(handlers::cart::remove_from_cart))
        .route("/api/cart/select-all", put(handlers::cart::select_all))
        .route("/api/cart/clear", delete(handlers::cart::clear_cart))
        .route("/api/cart/remove-selected", delete(handlers::cart::remove_selected))
        // Order routes
        .route("/api/orders", get(handlers::orders::list_orders))
        .route("/api/orders", post(handlers::orders::create_order))
        .route("/api/orders/:id", get(handlers::orders::get_order))
        // Rating routes
        .route("/api/ratings", post(handlers::ratings::create_rating))
        .route("/api/ratings/bulk", post(handlers::ratings::create_bulk_ratings))
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            auth_middleware,
        ));

    let admin_routes = Router::new()
        // Admin user management
        .route("/api/admin/users", get(handlers::admin::list_users))
        .route("/api/admin/users/:id", get(handlers::admin::get_user))
        .route("/api/admin/users/:id/status", patch(handlers::admin::update_user_status))
        // Admin product management
        .route("/api/admin/products", post(handlers::admin::create_product))
        .route("/api/admin/products/:id", put(handlers::admin::update_product))
        .route("/api/admin/products/:id", delete(handlers::admin::delete_product))
        // Admin order management
        .route("/api/admin/orders", get(handlers::admin::list_all_orders))
        .route("/api/admin/orders/:id/status", patch(handlers::admin::update_order_status))
        // Admin analytics
        .route("/api/admin/analytics/overview", get(handlers::admin::get_analytics_overview))
        .route("/api/admin/analytics/sales", get(handlers::admin::get_sales_analytics))
        .route("/api/admin/analytics/users", get(handlers::admin::get_user_analytics))
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            handlers::admin::admin_middleware,
        ))
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            auth_middleware,
        ));

    Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .merge(admin_routes)
        .with_state(state)
}
```

---

## Authentication & Authorization

### `src/middleware/mod.rs`
```rust
pub mod auth;
```

### `src/middleware/auth.rs`
```rust
use axum::{
    extract::{Request, State},
    http::{header, StatusCode},
    middleware::Next,
    response::Response,
};
use bson::oid::ObjectId;
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::routes::AppState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,        // user_id as hex string
    pub email: String,
    pub role: String,
    pub exp: usize,
}

impl Claims {
    pub fn user_id(&self) -> Result<ObjectId, bson::oid::Error> {
        ObjectId::parse_str(&self.sub)
    }
}

pub async fn auth_middleware(
    State(state): State<Arc<AppState>>,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok());

    let token = match auth_header {
        Some(h) if h.starts_with("Bearer ") => &h[7..],
        _ => return Err(StatusCode::UNAUTHORIZED),
    };

    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| StatusCode::UNAUTHORIZED)?
    .claims;

    request.extensions_mut().insert(claims);
    Ok(next.run(request).await)
}
```

### `src/handlers/mod.rs`
```rust
pub mod auth;
pub mod users;
pub mod products;
pub mod orders;
pub mod cart;
pub mod ratings;
pub mod admin;
```

### `src/handlers/auth.rs`
```rust
use axum::{extract::State, Json};
use bcrypt::{hash, verify, DEFAULT_COST};
use bson::doc;
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use std::sync::Arc;
use validator::Validate;

use crate::{
    errors::AppError,
    middleware::auth::Claims,
    models::{AuthResponse, CreateUserRequest, LoginRequest, User, UserResponse, UserRole, UserStatus},
    routes::AppState,
};

pub async fn register(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    payload.validate()?;

    let users = state.db.collection::<User>("users");

    // Check if email already exists
    let existing = users
        .find_one(doc! { "email": &payload.email }, None)
        .await?;

    if existing.is_some() {
        return Err(AppError::BadRequest("Email already registered".to_string()));
    }

    // Hash password
    let password_hash = hash(&payload.password, DEFAULT_COST)
        .map_err(|_| AppError::InternalError)?;

    let now = Utc::now();
    let user = User {
        id: None,
        name: payload.name,
        email: payload.email,
        password_hash,
        role: UserRole::Customer,
        status: UserStatus::Active,
        phone: payload.phone,
        address: payload.address,
        joined_date: now,
        last_login: Some(now),
        total_orders: 0,
        total_spent: 0.0,
        created_at: now,
        updated_at: now,
    };

    let result = users.insert_one(&user, None).await?;
    let user_id = result.inserted_id.as_object_id().unwrap();

    let mut user_with_id = user.clone();
    user_with_id.id = Some(user_id);

    // Generate JWT
    let token = generate_token(&user_with_id, &state.jwt_secret)?;

    Ok(Json(AuthResponse {
        token,
        user: user_with_id.into(),
    }))
}

pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    payload.validate()?;

    let users = state.db.collection::<User>("users");

    let user = users
        .find_one(doc! { "email": &payload.email }, None)
        .await?
        .ok_or(AppError::Unauthorized)?;

    if user.status == UserStatus::Blocked {
        return Err(AppError::BadRequest("Account is blocked".to_string()));
    }

    // Verify password
    if !verify(&payload.password, &user.password_hash).unwrap_or(false) {
        return Err(AppError::Unauthorized);
    }

    // Update last login
    if let Some(user_id) = &user.id {
        users
            .update_one(
                doc! { "_id": user_id },
                doc! { "$set": { "last_login": Utc::now() } },
                None,
            )
            .await?;
    }

    // Generate JWT
    let token = generate_token(&user, &state.jwt_secret)?;

    Ok(Json(AuthResponse {
        token,
        user: user.into(),
    }))
}

fn generate_token(user: &User, secret: &str) -> Result<String, AppError> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .expect("valid timestamp")
        .timestamp() as usize;

    let user_id = user.id.map(|id| id.to_hex()).unwrap_or_default();
    let role = match user.role {
        UserRole::Admin => "Admin",
        UserRole::Customer => "Customer",
    };

    let claims = Claims {
        sub: user_id,
        email: user.email.clone(),
        role: role.to_string(),
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|_| AppError::InternalError)
}
```

---

## Implementing Features

### `src/handlers/products.rs`
```rust
use axum::{
    extract::{Path, Query, State},
    Json,
};
use bson::{doc, oid::ObjectId};
use futures::TryStreamExt;
use std::sync::Arc;

use crate::{
    errors::AppError,
    models::{Product, ProductListResponse, ProductQuery, ProductResponse},
    routes::AppState,
};

pub async fn list_products(
    State(state): State<Arc<AppState>>,
    Query(query): Query<ProductQuery>,
) -> Result<Json<ProductListResponse>, AppError> {
    let products = state.db.collection::<Product>("products");

    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(12).min(100);
    let skip = (page - 1) * limit;

    // Build filter
    let mut filter = doc! {};

    if let Some(ref category) = query.category {
        filter.insert("category", category);
    }

    if let Some(ref search) = query.search {
        filter.insert("$text", doc! { "$search": search });
    }

    if query.min_price.is_some() || query.max_price.is_some() {
        let mut price_filter = doc! {};
        if let Some(min) = query.min_price {
            price_filter.insert("$gte", min);
        }
        if let Some(max) = query.max_price {
            price_filter.insert("$lte", max);
        }
        filter.insert("price", price_filter);
    }

    // Count total
    let total = products.count_documents(filter.clone(), None).await? as i64;

    // Build sort
    let sort_field = query.sort_by.unwrap_or_else(|| "created_at".to_string());
    let sort_order = if query.sort_order.as_deref() == Some("ASC") { 1 } else { -1 };
    let sort = doc! { sort_field: sort_order };

    // Find products
    let options = mongodb::options::FindOptions::builder()
        .sort(sort)
        .skip(skip as u64)
        .limit(limit)
        .build();

    let cursor = products.find(filter, options).await?;
    let product_list: Vec<Product> = cursor.try_collect().await?;

    let total_pages = ((total as f64) / (limit as f64)).ceil() as i64;

    Ok(Json(ProductListResponse {
        products: product_list.into_iter().map(|p| p.into()).collect(),
        total,
        page,
        limit,
        total_pages,
    }))
}

pub async fn get_product(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<ProductResponse>, AppError> {
    let products = state.db.collection::<Product>("products");

    let object_id = ObjectId::parse_str(&id).map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let product = products
        .find_one(doc! { "_id": object_id }, None)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(product.into()))
}
```

### `src/handlers/cart.rs`
```rust
use axum::{
    extract::{Extension, Path, State},
    Json,
};
use bson::{doc, oid::ObjectId};
use chrono::Utc;
use std::sync::Arc;

use crate::{
    errors::AppError,
    middleware::auth::Claims,
    models::{AddToCartRequest, Cart, CartItem, CartItemResponse, CartResponse, Product, SelectAllRequest, UpdateCartItemRequest},
    routes::AppState,
};

pub async fn get_cart(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<CartResponse>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let carts = state.db.collection::<Cart>("carts");

    let cart = carts
        .find_one(doc! { "user_id": user_id }, None)
        .await?
        .unwrap_or_else(|| Cart {
            id: None,
            user_id,
            items: vec![],
            created_at: Utc::now(),
            updated_at: Utc::now(),
        });

    let items: Vec<CartItemResponse> = cart.items.into_iter().map(|i| i.into()).collect();

    let subtotal: f64 = items
        .iter()
        .filter(|item| item.selected)
        .map(|item| item.price * item.quantity as f64)
        .sum();

    let shipping = if subtotal >= 50.0 { 0.0 } else { 5.0 };

    Ok(Json(CartResponse {
        items,
        subtotal,
        shipping,
        total: subtotal + shipping,
    }))
}

pub async fn add_to_cart(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<AddToCartRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let product_id = ObjectId::parse_str(&payload.product_id)
        .map_err(|_| AppError::BadRequest("Invalid product ID".to_string()))?;

    // Get product info
    let products = state.db.collection::<Product>("products");
    let product = products
        .find_one(doc! { "_id": product_id }, None)
        .await?
        .ok_or(AppError::NotFound)?;

    let quantity = payload.quantity.unwrap_or(1);
    let carts = state.db.collection::<Cart>("carts");

    // Check if cart exists
    let existing_cart = carts
        .find_one(doc! { "user_id": user_id }, None)
        .await?;

    if let Some(cart) = existing_cart {
        // Check if item already in cart
        let item_exists = cart.items.iter().any(|item| item.product_id == product_id);

        if item_exists {
            // Update quantity
            carts
                .update_one(
                    doc! { "user_id": user_id, "items.product_id": product_id },
                    doc! { 
                        "$inc": { "items.$.quantity": quantity },
                        "$set": { "updated_at": Utc::now() }
                    },
                    None,
                )
                .await?;
        } else {
            // Add new item
            let cart_item = CartItem {
                product_id,
                name: product.title,
                price: product.price,
                quantity,
                image: product.image,
                selected: true,
            };

            carts
                .update_one(
                    doc! { "user_id": user_id },
                    doc! { 
                        "$push": { "items": bson::to_bson(&cart_item).unwrap() },
                        "$set": { "updated_at": Utc::now() }
                    },
                    None,
                )
                .await?;
        }
    } else {
        // Create new cart
        let cart_item = CartItem {
            product_id,
            name: product.title,
            price: product.price,
            quantity,
            image: product.image,
            selected: true,
        };

        let cart = Cart {
            id: None,
            user_id,
            items: vec![cart_item],
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        carts.insert_one(&cart, None).await?;
    }

    Ok(Json(serde_json::json!({"message": "Added to cart"})))
}

pub async fn update_cart_item(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(product_id): Path<String>,
    Json(payload): Json<UpdateCartItemRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let product_oid = ObjectId::parse_str(&product_id)
        .map_err(|_| AppError::BadRequest("Invalid product ID".to_string()))?;

    let carts = state.db.collection::<Cart>("carts");

    let mut update_doc = doc! { "updated_at": Utc::now() };

    if let Some(quantity) = payload.quantity {
        update_doc.insert("items.$.quantity", quantity);
    }
    if let Some(selected) = payload.selected {
        update_doc.insert("items.$.selected", selected);
    }

    carts
        .update_one(
            doc! { "user_id": user_id, "items.product_id": product_oid },
            doc! { "$set": update_doc },
            None,
        )
        .await?;

    Ok(Json(serde_json::json!({"message": "Cart updated"})))
}

pub async fn remove_from_cart(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(product_id): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let product_oid = ObjectId::parse_str(&product_id)
        .map_err(|_| AppError::BadRequest("Invalid product ID".to_string()))?;

    let carts = state.db.collection::<Cart>("carts");

    carts
        .update_one(
            doc! { "user_id": user_id },
            doc! { 
                "$pull": { "items": { "product_id": product_oid } },
                "$set": { "updated_at": Utc::now() }
            },
            None,
        )
        .await?;

    Ok(Json(serde_json::json!({"message": "Item removed"})))
}

pub async fn select_all(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<SelectAllRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let carts = state.db.collection::<Cart>("carts");

    carts
        .update_one(
            doc! { "user_id": user_id },
            doc! { 
                "$set": { 
                    "items.$[].selected": payload.selected,
                    "updated_at": Utc::now()
                }
            },
            None,
        )
        .await?;

    Ok(Json(serde_json::json!({"message": "Selection updated"})))
}

pub async fn clear_cart(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let carts = state.db.collection::<Cart>("carts");

    carts
        .update_one(
            doc! { "user_id": user_id },
            doc! { 
                "$set": { 
                    "items": [],
                    "updated_at": Utc::now()
                }
            },
            None,
        )
        .await?;

    Ok(Json(serde_json::json!({"message": "Cart cleared"})))
}

pub async fn remove_selected(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let carts = state.db.collection::<Cart>("carts");

    carts
        .update_one(
            doc! { "user_id": user_id },
            doc! { 
                "$pull": { "items": { "selected": true } },
                "$set": { "updated_at": Utc::now() }
            },
            None,
        )
        .await?;

    Ok(Json(serde_json::json!({"message": "Selected items removed"})))
}
```

### `src/handlers/orders.rs`
```rust
use axum::{
    extract::{Extension, Path, Query, State},
    Json,
};
use bson::{doc, oid::ObjectId};
use chrono::Utc;
use futures::TryStreamExt;
use rand::Rng;
use std::sync::Arc;

use crate::{
    errors::AppError,
    middleware::auth::Claims,
    models::{Cart, CreateOrderRequest, Order, OrderItem, OrderQuery, OrderResponse, OrderStatus, Product, User},
    routes::AppState,
};

pub async fn list_orders(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Query(query): Query<OrderQuery>,
) -> Result<Json<Vec<OrderResponse>>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let orders = state.db.collection::<Order>("orders");

    let mut filter = doc! { "user_id": user_id };

    if let Some(ref status) = query.status {
        if status != "all" {
            filter.insert("status", status);
        }
    }

    let options = mongodb::options::FindOptions::builder()
        .sort(doc! { "created_at": -1 })
        .build();

    let cursor = orders.find(filter, options).await?;
    let order_list: Vec<Order> = cursor.try_collect().await?;

    Ok(Json(order_list.into_iter().map(|o| o.into()).collect()))
}

pub async fn create_order(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<CreateOrderRequest>,
) -> Result<Json<OrderResponse>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let orders = state.db.collection::<Order>("orders");
    let products = state.db.collection::<Product>("products");
    let users = state.db.collection::<User>("users");
    let carts = state.db.collection::<Cart>("carts");

    // Generate order ID
    let random_num: u16 = rand::thread_rng().gen_range(0..1000);
    let order_id = format!("ORD-{}-{:03}", Utc::now().format("%Y%m%d"), random_num);

    // Convert items
    let items: Vec<OrderItem> = payload
        .items
        .into_iter()
        .map(|item| OrderItem {
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
        })
        .collect();

    // Calculate total
    let total: f64 = items.iter().map(|item| item.price * item.quantity as f64).sum();

    let now = Utc::now();
    let order = Order {
        id: None,
        order_id: order_id.clone(),
        user_id,
        items: items.clone(),
        total,
        status: OrderStatus::Pending,
        shipping_method: payload.shipping_method,
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        country: payload.country,
        city: payload.city,
        state: payload.state,
        zip: payload.zip,
        created_at: now,
        updated_at: now,
    };

    let result = orders.insert_one(&order, None).await?;
    let mut order_with_id = order;
    order_with_id.id = result.inserted_id.as_object_id();

    // Update product stock and sales
    for item in &items {
        if let Ok(product_oid) = ObjectId::parse_str(&item.product_id) {
            products
                .update_one(
                    doc! { "_id": product_oid },
                    doc! { 
                        "$inc": { 
                            "stock": -item.quantity,
                            "sales": item.quantity
                        }
                    },
                    None,
                )
                .await?;
        }
    }

    // Clear user's cart (selected items)
    carts
        .update_one(
            doc! { "user_id": user_id },
            doc! { 
                "$pull": { "items": { "selected": true } },
                "$set": { "updated_at": Utc::now() }
            },
            None,
        )
        .await?;

    // Update user stats
    users
        .update_one(
            doc! { "_id": user_id },
            doc! { 
                "$inc": { 
                    "total_orders": 1,
                    "total_spent": total
                }
            },
            None,
        )
        .await?;

    Ok(Json(order_with_id.into()))
}

pub async fn get_order(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<String>,
) -> Result<Json<OrderResponse>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let orders = state.db.collection::<Order>("orders");

    // Try to find by order_id first, then by _id
    let mut filter = doc! { "user_id": user_id, "order_id": &id };
    
    let mut order = orders.find_one(filter.clone(), None).await?;

    if order.is_none() {
        if let Ok(oid) = ObjectId::parse_str(&id) {
            filter = doc! { "user_id": user_id, "_id": oid };
            order = orders.find_one(filter, None).await?;
        }
    }

    let order = order.ok_or(AppError::NotFound)?;
    Ok(Json(order.into()))
}
```

### `src/handlers/ratings.rs`
```rust
use axum::{
    extract::{Extension, Path, State},
    Json,
};
use bson::{doc, oid::ObjectId};
use chrono::Utc;
use futures::TryStreamExt;
use std::sync::Arc;

use crate::{
    errors::AppError,
    middleware::auth::Claims,
    models::{BulkRatingRequest, CreateRatingRequest, Product, Rating, RatingResponse, User},
    routes::AppState,
};

pub async fn create_rating(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<CreateRatingRequest>,
) -> Result<Json<RatingResponse>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let product_id = ObjectId::parse_str(&payload.product_id)
        .map_err(|_| AppError::BadRequest("Invalid product ID".to_string()))?;

    let ratings = state.db.collection::<Rating>("ratings");
    let users = state.db.collection::<User>("users");

    // Get user name
    let user = users
        .find_one(doc! { "_id": user_id }, None)
        .await?
        .ok_or(AppError::NotFound)?;

    let rating = Rating {
        id: None,
        user_id,
        user_name: user.name,
        product_id,
        order_id: payload.order_id,
        rating: payload.rating,
        comment: payload.comment,
        created_at: Utc::now(),
    };

    let result = ratings.insert_one(&rating, None).await?;
    let mut rating_with_id = rating;
    rating_with_id.id = result.inserted_id.as_object_id();

    // Update product rating
    update_product_rating(&state, product_id).await?;

    Ok(Json(rating_with_id.into()))
}

pub async fn create_bulk_ratings(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<BulkRatingRequest>,
) -> Result<Json<Vec<RatingResponse>>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let ratings_coll = state.db.collection::<Rating>("ratings");
    let users = state.db.collection::<User>("users");

    // Get user name
    let user = users
        .find_one(doc! { "_id": user_id }, None)
        .await?
        .ok_or(AppError::NotFound)?;

    let mut result_ratings = Vec::new();

    for item in payload.ratings {
        let product_id = ObjectId::parse_str(&item.product_id)
            .map_err(|_| AppError::BadRequest("Invalid product ID".to_string()))?;

        // Check if rating already exists
        let existing = ratings_coll
            .find_one(
                doc! { 
                    "user_id": user_id, 
                    "product_id": product_id, 
                    "order_id": &item.order_id 
                },
                None,
            )
            .await?;

        let rating = if let Some(mut existing_rating) = existing {
            // Update existing rating
            ratings_coll
                .update_one(
                    doc! { "_id": existing_rating.id },
                    doc! { 
                        "$set": { 
                            "rating": item.rating,
                            "comment": &item.comment
                        }
                    },
                    None,
                )
                .await?;
            existing_rating.rating = item.rating;
            existing_rating.comment = item.comment;
            existing_rating
        } else {
            // Create new rating
            let new_rating = Rating {
                id: None,
                user_id,
                user_name: user.name.clone(),
                product_id,
                order_id: item.order_id,
                rating: item.rating,
                comment: item.comment,
                created_at: Utc::now(),
            };

            let insert_result = ratings_coll.insert_one(&new_rating, None).await?;
            let mut rating_with_id = new_rating;
            rating_with_id.id = insert_result.inserted_id.as_object_id();
            rating_with_id
        };

        // Update product rating
        update_product_rating(&state, product_id).await?;
        result_ratings.push(rating.into());
    }

    Ok(Json(result_ratings))
}

pub async fn get_product_ratings(
    State(state): State<Arc<AppState>>,
    Path(product_id): Path<String>,
) -> Result<Json<Vec<RatingResponse>>, AppError> {
    let product_oid = ObjectId::parse_str(&product_id)
        .map_err(|_| AppError::BadRequest("Invalid product ID".to_string()))?;

    let ratings = state.db.collection::<Rating>("ratings");

    let options = mongodb::options::FindOptions::builder()
        .sort(doc! { "created_at": -1 })
        .build();

    let cursor = ratings.find(doc! { "product_id": product_oid }, options).await?;
    let rating_list: Vec<Rating> = cursor.try_collect().await?;

    Ok(Json(rating_list.into_iter().map(|r| r.into()).collect()))
}

async fn update_product_rating(state: &Arc<AppState>, product_id: ObjectId) -> Result<(), AppError> {
    let ratings = state.db.collection::<Rating>("ratings");
    let products = state.db.collection::<Product>("products");

    // Calculate average rating
    let pipeline = vec![
        doc! { "$match": { "product_id": product_id } },
        doc! { 
            "$group": { 
                "_id": null, 
                "avg_rating": { "$avg": "$rating" },
                "count": { "$sum": 1 }
            }
        },
    ];

    let mut cursor = ratings.aggregate(pipeline, None).await?;
    
    if let Some(result) = cursor.try_next().await? {
        let avg_rating = result.get_f64("avg_rating").unwrap_or(0.0);
        let count = result.get_i32("count").unwrap_or(0);

        products
            .update_one(
                doc! { "_id": product_id },
                doc! { 
                    "$set": { 
                        "rating": avg_rating,
                        "review_count": count
                    }
                },
                None,
            )
            .await?;
    }

    Ok(())
}
```

### `src/handlers/users.rs`
```rust
use axum::{
    extract::{Extension, State},
    Json,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use bson::doc;
use chrono::Utc;
use std::sync::Arc;

use crate::{
    errors::AppError,
    middleware::auth::Claims,
    models::{UpdateUserRequest, User, UserResponse},
    routes::AppState,
};

pub async fn get_current_user(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<UserResponse>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let users = state.db.collection::<User>("users");

    let user = users
        .find_one(doc! { "_id": user_id }, None)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(user.into()))
}

pub async fn update_current_user(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<UpdateUserRequest>,
) -> Result<Json<UserResponse>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let users = state.db.collection::<User>("users");

    let mut update_doc = doc! { "updated_at": Utc::now() };

    if let Some(ref name) = payload.name {
        update_doc.insert("name", name);
    }
    if let Some(ref phone) = payload.phone {
        update_doc.insert("phone", phone);
    }
    if let Some(ref address) = payload.address {
        update_doc.insert("address", address);
    }

    users
        .update_one(doc! { "_id": user_id }, doc! { "$set": update_doc }, None)
        .await?;

    let user = users
        .find_one(doc! { "_id": user_id }, None)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(user.into()))
}

#[derive(serde::Deserialize)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

pub async fn change_password(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<ChangePasswordRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = claims.user_id().map_err(|_| AppError::Unauthorized)?;
    let users = state.db.collection::<User>("users");

    let user = users
        .find_one(doc! { "_id": user_id }, None)
        .await?
        .ok_or(AppError::NotFound)?;

    // Verify current password
    if !verify(&payload.current_password, &user.password_hash).unwrap_or(false) {
        return Err(AppError::BadRequest("Current password is incorrect".to_string()));
    }

    // Hash new password
    let new_hash = hash(&payload.new_password, DEFAULT_COST)
        .map_err(|_| AppError::InternalError)?;

    users
        .update_one(
            doc! { "_id": user_id },
            doc! { "$set": { "password_hash": new_hash, "updated_at": Utc::now() } },
            None,
        )
        .await?;

    Ok(Json(serde_json::json!({"message": "Password changed successfully"})))
}
```

### `src/handlers/admin.rs`
```rust
use axum::{
    extract::{Extension, Path, Request, State},
    http::StatusCode,
    middleware::Next,
    response::Response,
    Json,
};
use bson::{doc, oid::ObjectId};
use chrono::Utc;
use futures::TryStreamExt;
use std::sync::Arc;

use crate::{
    errors::AppError,
    middleware::auth::Claims,
    models::{
        CreateProductRequest, Order, OrderStatus, Product, ProductResponse, 
        UpdateOrderStatusRequest, UpdateProductRequest, UpdateUserStatusRequest, 
        User, UserResponse,
    },
    routes::AppState,
};

// Admin middleware
pub async fn admin_middleware(
    Extension(claims): Extension<Claims>,
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    if claims.role != "Admin" {
        return Err(StatusCode::FORBIDDEN);
    }
    Ok(next.run(request).await)
}

// User Management
pub async fn list_users(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<UserResponse>>, AppError> {
    let users = state.db.collection::<User>("users");

    let cursor = users.find(None, None).await?;
    let user_list: Vec<User> = cursor.try_collect().await?;

    Ok(Json(user_list.into_iter().map(|u| u.into()).collect()))
}

pub async fn get_user(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<UserResponse>, AppError> {
    let users = state.db.collection::<User>("users");
    let user_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid user ID".to_string()))?;

    let user = users
        .find_one(doc! { "_id": user_id }, None)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(user.into()))
}

pub async fn update_user_status(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateUserStatusRequest>,
) -> Result<Json<UserResponse>, AppError> {
    let users = state.db.collection::<User>("users");
    let user_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid user ID".to_string()))?;

    users
        .update_one(
            doc! { "_id": user_id },
            doc! { "$set": { "status": bson::to_bson(&payload.status).unwrap(), "updated_at": Utc::now() } },
            None,
        )
        .await?;

    let user = users
        .find_one(doc! { "_id": user_id }, None)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(user.into()))
}

// Product Management
pub async fn create_product(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateProductRequest>,
) -> Result<Json<ProductResponse>, AppError> {
    let products = state.db.collection::<Product>("products");

    let now = Utc::now();
    let product = Product {
        id: None,
        title: payload.title,
        subtitle: payload.subtitle,
        description: payload.description,
        price: payload.price,
        discount: payload.discount.unwrap_or(0),
        rating: 0.0,
        review_count: 0,
        image: payload.image,
        category: payload.category,
        stock: payload.stock.unwrap_or(0),
        sales: 0,
        created_at: now,
        updated_at: now,
    };

    let result = products.insert_one(&product, None).await?;
    let mut product_with_id = product;
    product_with_id.id = result.inserted_id.as_object_id();

    Ok(Json(product_with_id.into()))
}

pub async fn update_product(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateProductRequest>,
) -> Result<Json<ProductResponse>, AppError> {
    let products = state.db.collection::<Product>("products");
    let product_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid product ID".to_string()))?;

    let mut update_doc = doc! { "updated_at": Utc::now() };

    if let Some(ref title) = payload.title {
        update_doc.insert("title", title);
    }
    if let Some(ref subtitle) = payload.subtitle {
        update_doc.insert("subtitle", subtitle);
    }
    if let Some(ref description) = payload.description {
        update_doc.insert("description", description);
    }
    if let Some(price) = payload.price {
        update_doc.insert("price", price);
    }
    if let Some(discount) = payload.discount {
        update_doc.insert("discount", discount);
    }
    if let Some(ref image) = payload.image {
        update_doc.insert("image", image);
    }
    if let Some(ref category) = payload.category {
        update_doc.insert("category", category);
    }
    if let Some(stock) = payload.stock {
        update_doc.insert("stock", stock);
    }

    products
        .update_one(doc! { "_id": product_id }, doc! { "$set": update_doc }, None)
        .await?;

    let product = products
        .find_one(doc! { "_id": product_id }, None)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(product.into()))
}

pub async fn delete_product(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let products = state.db.collection::<Product>("products");
    let product_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid product ID".to_string()))?;

    let result = products.delete_one(doc! { "_id": product_id }, None).await?;

    if result.deleted_count == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({"message": "Product deleted"})))
}

// Order Management
pub async fn list_all_orders(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Order>>, AppError> {
    let orders = state.db.collection::<Order>("orders");

    let options = mongodb::options::FindOptions::builder()
        .sort(doc! { "created_at": -1 })
        .build();

    let cursor = orders.find(None, options).await?;
    let order_list: Vec<Order> = cursor.try_collect().await?;

    Ok(Json(order_list))
}

pub async fn update_order_status(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateOrderStatusRequest>,
) -> Result<Json<Order>, AppError> {
    let orders = state.db.collection::<Order>("orders");

    // Try to find by order_id first
    let filter = doc! { "order_id": &id };
    
    orders
        .update_one(
            filter.clone(),
            doc! { "$set": { "status": bson::to_bson(&payload.status).unwrap(), "updated_at": Utc::now() } },
            None,
        )
        .await?;

    let order = orders
        .find_one(filter, None)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(order))
}

// Analytics
#[derive(serde::Serialize)]
pub struct AnalyticsOverview {
    pub total_users: i64,
    pub total_products: i64,
    pub total_orders: i64,
    pub total_revenue: f64,
    pub active_users: i64,
    pub blocked_users: i64,
}

pub async fn get_analytics_overview(
    State(state): State<Arc<AppState>>,
) -> Result<Json<AnalyticsOverview>, AppError> {
    let users = state.db.collection::<User>("users");
    let products = state.db.collection::<Product>("products");
    let orders = state.db.collection::<Order>("orders");

    let total_users = users.count_documents(None, None).await? as i64;
    let total_products = products.count_documents(None, None).await? as i64;
    let total_orders = orders.count_documents(None, None).await? as i64;
    
    let active_users = users
        .count_documents(doc! { "status": "Active" }, None)
        .await? as i64;
    
    let blocked_users = users
        .count_documents(doc! { "status": "Blocked" }, None)
        .await? as i64;

    // Calculate total revenue
    let pipeline = vec![
        doc! { "$match": { "status": { "$ne": "cancelled" } } },
        doc! { "$group": { "_id": null, "total": { "$sum": "$total" } } },
    ];

    let mut cursor = orders.aggregate(pipeline, None).await?;
    let total_revenue = if let Some(result) = cursor.try_next().await? {
        result.get_f64("total").unwrap_or(0.0)
    } else {
        0.0
    };

    Ok(Json(AnalyticsOverview {
        total_users,
        total_products,
        total_orders,
        total_revenue,
        active_users,
        blocked_users,
    }))
}

#[derive(serde::Serialize)]
pub struct SalesData {
    pub date: String,
    pub sales: f64,
    pub orders: i64,
}

pub async fn get_sales_analytics(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<SalesData>>, AppError> {
    let orders = state.db.collection::<Order>("orders");

    let thirty_days_ago = Utc::now() - chrono::Duration::days(30);

    let pipeline = vec![
        doc! { "$match": { "created_at": { "$gte": thirty_days_ago } } },
        doc! { 
            "$group": { 
                "_id": { "$dateToString": { "format": "%Y-%m-%d", "date": "$created_at" } },
                "sales": { "$sum": "$total" },
                "orders": { "$sum": 1 }
            }
        },
        doc! { "$sort": { "_id": 1 } },
    ];

    let mut cursor = orders.aggregate(pipeline, None).await?;
    let mut sales_data = Vec::new();

    while let Some(result) = cursor.try_next().await? {
        sales_data.push(SalesData {
            date: result.get_str("_id").unwrap_or("").to_string(),
            sales: result.get_f64("sales").unwrap_or(0.0),
            orders: result.get_i64("orders").unwrap_or(0),
        });
    }

    Ok(Json(sales_data))
}

#[derive(serde::Serialize)]
pub struct UserAnalytics {
    pub new_users_today: i64,
    pub new_users_week: i64,
    pub new_users_month: i64,
}

pub async fn get_user_analytics(
    State(state): State<Arc<AppState>>,
) -> Result<Json<UserAnalytics>, AppError> {
    let users = state.db.collection::<User>("users");

    let now = Utc::now();
    let today_start = now.date_naive().and_hms_opt(0, 0, 0).unwrap();
    let week_ago = now - chrono::Duration::days(7);
    let month_ago = now - chrono::Duration::days(30);

    let new_users_today = users
        .count_documents(
            doc! { "joined_date": { "$gte": today_start.to_string() } },
            None,
        )
        .await? as i64;

    let new_users_week = users
        .count_documents(doc! { "joined_date": { "$gte": week_ago } }, None)
        .await? as i64;

    let new_users_month = users
        .count_documents(doc! { "joined_date": { "$gte": month_ago } }, None)
        .await? as i64;

    Ok(Json(UserAnalytics {
        new_users_today,
        new_users_week,
        new_users_month,
    }))
}
```

---

## Error Handling

### `src/errors/mod.rs`
```rust
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(Debug)]
pub enum AppError {
    BadRequest(String),
    Unauthorized,
    Forbidden,
    NotFound,
    InternalError,
    MongoError(mongodb::error::Error),
    ValidationError(validator::ValidationErrors),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized".to_string()),
            AppError::Forbidden => (StatusCode::FORBIDDEN, "Forbidden".to_string()),
            AppError::NotFound => (StatusCode::NOT_FOUND, "Resource not found".to_string()),
            AppError::InternalError => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error".to_string(),
            ),
            AppError::MongoError(e) => {
                tracing::error!("MongoDB error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
            }
            AppError::ValidationError(e) => (
                StatusCode::BAD_REQUEST,
                format!("Validation error: {}", e),
            ),
        };

        let body = Json(json!({
            "error": message,
            "status": status.as_u16()
        }));

        (status, body).into_response()
    }
}

impl From<mongodb::error::Error> for AppError {
    fn from(error: mongodb::error::Error) -> Self {
        AppError::MongoError(error)
    }
}

impl From<validator::ValidationErrors> for AppError {
    fn from(error: validator::ValidationErrors) -> Self {
        AppError::ValidationError(error)
    }
}
```

---

## Main Application

### `src/main.rs`
```rust
use dotenvy::dotenv;
use std::{env, sync::Arc};
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod db;
mod errors;
mod handlers;
mod middleware;
mod models;
mod routes;

use db::MongoDB;
use routes::{create_routes, AppState};

#[tokio::main]
async fn main() {
    // Load environment variables
    dotenv().ok();

    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // MongoDB connection
    let mongodb = MongoDB::init().await.expect("Failed to connect to MongoDB");

    tracing::info!("Connected to MongoDB");

    // Create app state
    let state = Arc::new(AppState {
        db: mongodb,
        jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET must be set"),
    });

    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router
    let app = create_routes(state)
        .layer(cors)
        .layer(tower_http::trace::TraceLayer::new_for_http());

    // Start server
    let host = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("SERVER_PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("{}:{}", host, port);

    tracing::info!("🚀 Starting server on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

---

## Deployment

### Docker Setup

#### `Dockerfile`
```dockerfile
# Build stage
FROM rust:1.75-alpine AS builder

RUN apk add --no-cache musl-dev openssl-dev openssl-libs-static pkgconfig

WORKDIR /app
COPY . .
RUN cargo build --release

# Runtime stage
FROM alpine:latest

RUN apk add --no-cache ca-certificates

WORKDIR /app
COPY --from=builder /app/target/release/comic-store-api .

EXPOSE 8080

CMD ["./comic-store-api"]
```

#### `docker-compose.yml`
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - MONGODB_URI=mongodb://mongo:27017
      - DATABASE_NAME=comic_store
      - JWT_SECRET=your-production-secret-key
      - RUST_LOG=info
      - SERVER_HOST=0.0.0.0
      - SERVER_PORT=8080
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  mongo-express:
    image: mongo-express
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_SERVER=mongo
    depends_on:
      - mongo
    restart: unless-stopped

volumes:
  mongo_data:
```

### Build and Run
```bash
# Development
cargo run

# With hot-reload
cargo watch -x run

# Production build
cargo build --release

# Docker
docker-compose up -d

# View MongoDB data at http://localhost:8081
```

---

## Frontend Integration

### Create `src/services/api.ts`
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/loginPage';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Products
export const productService = {
  getAll: (params?: Record<string, any>) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
};

// Cart
export const cartService = {
  get: () => api.get('/cart'),
  add: (productId: string, quantity?: number) =>
    api.post('/cart', { product_id: productId, quantity }),
  update: (productId: string, data: { quantity?: number; selected?: boolean }) =>
    api.put(`/cart/${productId}`, data),
  remove: (productId: string) => api.delete(`/cart/${productId}`),
  clear: () => api.delete('/cart/clear'),
  selectAll: (selected: boolean) => api.put('/cart/select-all', { selected }),
  removeSelected: () => api.delete('/cart/remove-selected'),
};

// Orders
export const orderService = {
  getAll: (status?: string) => api.get('/orders', { params: { status } }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
};

// Ratings
export const ratingService = {
  create: (data: any) => api.post('/ratings', data),
  createBulk: (ratings: any[]) => api.post('/ratings/bulk', { ratings }),
  getByProduct: (productId: string) => api.get(`/products/${productId}/ratings`),
};

// User
export const userService = {
  getCurrent: () => api.get('/users/me'),
  update: (data: any) => api.put('/users/me', data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.put('/users/me/password', data),
};

// Admin
export const adminService = {
  getUsers: () => api.get('/admin/users'),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id: string, status: 'Active' | 'Blocked') =>
    api.patch(`/admin/users/${id}/status`, { status }),
  createProduct: (data: any) => api.post('/admin/products', data),
  updateProduct: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  getAllOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/admin/orders/${id}/status`, { status }),
  getAnalytics: () => api.get('/admin/analytics/overview'),
  getSalesAnalytics: () => api.get('/admin/analytics/sales'),
  getUserAnalytics: () => api.get('/admin/analytics/users'),
};
```

### Add environment variable
Create `.env` in your Vue project:
```env
VITE_API_URL=http://localhost:8080/api
```

---

## API Endpoints Summary

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/:id/ratings` | Get product ratings |

### Protected Endpoints (Require Authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/me` | Update current user |
| PUT | `/api/users/me/password` | Change password |
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart` | Add to cart |
| PUT | `/api/cart/:product_id` | Update cart item |
| DELETE | `/api/cart/:product_id` | Remove from cart |
| DELETE | `/api/cart/clear` | Clear cart |
| PUT | `/api/cart/select-all` | Select/deselect all |
| DELETE | `/api/cart/remove-selected` | Remove selected items |
| GET | `/api/orders` | List user's orders |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/:id` | Get order details |
| POST | `/api/ratings` | Create rating |
| POST | `/api/ratings/bulk` | Create bulk ratings |

### Admin Endpoints (Require Admin Role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/:id` | Get user by ID |
| PATCH | `/api/admin/users/:id/status` | Update user status |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |
| GET | `/api/admin/orders` | List all orders |
| PATCH | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/analytics/overview` | Get analytics overview |
| GET | `/api/admin/analytics/sales` | Get sales analytics |
| GET | `/api/admin/analytics/users` | Get user analytics |

---

## MongoDB Collections Structure

### Collections Overview
```
comic_store/
├── users          # User accounts
├── products       # Products catalog
├── orders         # Order records
├── carts          # Shopping carts (one per user)
└── ratings        # Product ratings/reviews
```

### Sample Documents

#### User
```json
{
  "_id": ObjectId("..."),
  "name": "John Doe",
  "email": "john@example.com",
  "password_hash": "$2b$12$...",
  "role": "Customer",
  "status": "Active",
  "phone": "+1 555-1234",
  "address": "123 Main St",
  "joined_date": ISODate("2026-01-20"),
  "last_login": ISODate("2026-01-20"),
  "total_orders": 5,
  "total_spent": 150.99
}
```

#### Product
```json
{
  "_id": ObjectId("..."),
  "title": "Batman: The Killing Joke",
  "subtitle": "A graphic novel by Alan Moore",
  "description": "A dark story...",
  "price": 15.99,
  "discount": 10,
  "rating": 4.5,
  "review_count": 42,
  "image": "https://...",
  "category": "comics",
  "stock": 45,
  "sales": 125
}
```

#### Cart
```json
{
  "_id": ObjectId("..."),
  "user_id": ObjectId("..."),
  "items": [
    {
      "product_id": ObjectId("..."),
      "name": "Batman: The Killing Joke",
      "price": 15.99,
      "quantity": 2,
      "image": "https://...",
      "selected": true
    }
  ]
}
```

#### Order
```json
{
  "_id": ObjectId("..."),
  "order_id": "ORD-20260120-042",
  "user_id": ObjectId("..."),
  "items": [...],
  "total": 45.99,
  "status": "pending",
  "shipping_method": "delivery",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 555-1234",
  "country": "USA",
  "city": "New York",
  "state": "NY",
  "zip": "10001",
  "created_at": ISODate("2026-01-20")
}
```

---

## Next Steps

1. **Set up MongoDB**: Install locally, use Docker, or MongoDB Atlas
2. **Create the project**: Follow the setup instructions above
3. **Start the server**: `cargo run`
4. **Test the API**: Use Postman, curl, or the frontend
5. **Update frontend**: Replace mock data with API calls
6. **Add more features**: File uploads, email notifications, etc.

## Resources

- [Axum Documentation](https://docs.rs/axum/latest/axum/)
- [MongoDB Rust Driver](https://docs.rs/mongodb/latest/mongodb/)
- [BSON Documentation](https://docs.rs/bson/latest/bson/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Tokio Tutorial](https://tokio.rs/tokio/tutorial)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
