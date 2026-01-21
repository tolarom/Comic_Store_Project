**main.rs**
```rust
use actix_web::{web, App, HttpResponse, HttpServer, middleware};
use chrono::{DateTime, Utc};
use futures::stream::TryStreamExt;
use log::info;
use mongodb::{
    bson::{doc, oid::ObjectId, to_bson},
    options::ClientOptions,
    Client,
};
use serde::{Deserialize, Serialize};

// ============================================================
// DATA MODELS
// ============================================================

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Product {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub title: String,
    pub description: String,
    pub price: f64,
    pub category: String,
    pub stock: i32,
    pub image_url: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub username: String,
    pub email: String,
    pub password: String,
    pub full_name: String,
    pub address: String,
    pub phone: String,
    #[serde(default = "default_role")]
    pub role: String, // "admin" or "customer", defaults to "customer"
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Order {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: String,
    pub products: Vec<OrderItem>,
    pub total_price: f64,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OrderItem {
    pub product_id: String,
    pub quantity: i32,
    pub price: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Rating {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub product_id: String,
    pub user_id: String,
    pub rating: i32,
    pub review: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: String,
    pub data: Option<T>,
}

// ============================================================
// REQUEST STRUCTS
// ============================================================

#[derive(Deserialize)]
pub struct CreateProductRequest {
    pub title: String,
    pub description: String,
    pub price: f64,
    pub category: String,
    pub stock: i32,
    pub image_url: String,
}

#[derive(Deserialize)]
pub struct CreateUserRequest {
    pub username: String,
    pub email: String,
    pub password: String,
    pub full_name: String,
    pub address: String,
    pub phone: String,
    #[serde(default = "default_role")]
    pub role: String, // "admin" or "customer", defaults to "customer"
}

fn default_role() -> String {
    "customer".to_string()
}

#[derive(Deserialize)]
pub struct CreateOrderRequest {
    pub user_id: String,
    pub products: Vec<OrderItem>,
    pub total_price: f64,
}

#[derive(Deserialize)]
pub struct CreateRatingRequest {
    pub product_id: String,
    pub user_id: String,
    pub rating: i32,
    pub review: String,
}

#[derive(Deserialize)]
pub struct UpdateProductRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub price: Option<f64>,
    pub category: Option<String>,
    pub stock: Option<i32>,
    pub image_url: Option<String>,
}

// ============================================================
// APP STATE
// ============================================================

pub struct AppState {
    pub client: Client,
}

// ============================================================
// HEALTH CHECK
// ============================================================

async fn health() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::<String> {
        success: true,
        message: "Server is running".to_string(),
        data: None,
    })
}

// ============================================================
// PRODUCT HANDLERS
// ============================================================

async fn get_all_products(data: web::Data<AppState>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Product>("products");

    match collection.find(None, None).await {
        Ok(mut cursor) => {
            let mut products = Vec::new();
            while let Ok(Some(product)) = cursor.try_next().await {
                products.push(product);
            }
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Products retrieved successfully".to_string(),
                data: Some(products),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Vec<Product>> {
            success: false,
            message: format!("Error retrieving products: {}", e),
            data: None,
        }),
    }
}

async fn get_product_by_id(data: web::Data<AppState>, id: web::Path<String>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Product>("products");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => match collection.find_one(doc! { "_id": object_id }, None).await {
            Ok(Some(product)) => HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Product retrieved successfully".to_string(),
                data: Some(product),
            }),
            Ok(None) => HttpResponse::NotFound().json(ApiResponse::<Product> {
                success: false,
                message: "Product not found".to_string(),
                data: None,
            }),
            Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Product> {
                success: false,
                message: format!("Error retrieving product: {}", e),
                data: None,
            }),
        },
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<Product> {
            success: false,
            message: "Invalid product ID".to_string(),
            data: None,
        }),
    }
}

async fn create_product(
    data: web::Data<AppState>,
    req: web::Json<CreateProductRequest>,
) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Product>("products");

    let product = Product {
        id: None,
        title: req.title.clone(),
        description: req.description.clone(),
        price: req.price,
        category: req.category.clone(),
        stock: req.stock,
        image_url: req.image_url.clone(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    match collection.insert_one(&product, None).await {
        Ok(result) => {
            let mut created_product = product;
            created_product.id = result.inserted_id.as_object_id();
            HttpResponse::Created().json(ApiResponse {
                success: true,
                message: "Product created successfully".to_string(),
                data: Some(created_product),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Product> {
            success: false,
            message: format!("Error creating product: {}", e),
            data: None,
        }),
    }
}

async fn update_product(
    data: web::Data<AppState>,
    id: web::Path<String>,
    req: web::Json<UpdateProductRequest>,
) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Product>("products");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => {
            let mut update_doc = doc! {};

            if let Some(title) = &req.title {
                update_doc.insert("title", title.clone());
            }
            if let Some(description) = &req.description {
                update_doc.insert("description", description.clone());
            }
            if let Some(price) = req.price {
                update_doc.insert("price", price);
            }
            if let Some(category) = &req.category {
                update_doc.insert("category", category.clone());
            }
            if let Some(stock) = req.stock {
                update_doc.insert("stock", stock);
            }
            if let Some(image_url) = &req.image_url {
                update_doc.insert("image_url", image_url.clone());
            }

            update_doc.insert("updated_at", to_bson(&Utc::now()).unwrap());

            match collection
                .update_one(doc! { "_id": object_id }, doc! { "$set": update_doc }, None)
                .await
            {
                Ok(result) => {
                    if result.matched_count == 0 {
                        HttpResponse::NotFound().json(ApiResponse::<String> {
                            success: false,
                            message: "Product not found".to_string(),
                            data: None,
                        })
                    } else {
                        HttpResponse::Ok().json(ApiResponse {
                            success: true,
                            message: "Product updated successfully".to_string(),
                            data: Some("Product updated".to_string()),
                        })
                    }
                }
                Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                    success: false,
                    message: format!("Error updating product: {}", e),
                    data: None,
                }),
            }
        }
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "Invalid product ID".to_string(),
            data: None,
        }),
    }
}

async fn delete_product(data: web::Data<AppState>, id: web::Path<String>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Product>("products");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => match collection.delete_one(doc! { "_id": object_id }, None).await {
            Ok(result) => {
                if result.deleted_count == 0 {
                    HttpResponse::NotFound().json(ApiResponse::<String> {
                        success: false,
                        message: "Product not found".to_string(),
                        data: None,
                    })
                } else {
                    HttpResponse::Ok().json(ApiResponse {
                        success: true,
                        message: "Product deleted successfully".to_string(),
                        data: Some("Product deleted".to_string()),
                    })
                }
            }
            Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                success: false,
                message: format!("Error deleting product: {}", e),
                data: None,
            }),
        },
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "Invalid product ID".to_string(),
            data: None,
        }),
    }
}

// ============================================================
// USER HANDLERS
// ============================================================

async fn get_all_users(data: web::Data<AppState>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<User>("users");

    match collection.find(None, None).await {
        Ok(mut cursor) => {
            let mut users = Vec::new();
            while let Ok(Some(user)) = cursor.try_next().await {
                users.push(user);
            }
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Users retrieved successfully".to_string(),
                data: Some(users),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Vec<User>> {
            success: false,
            message: format!("Error retrieving users: {}", e),
            data: None,
        }),
    }
}

async fn get_user_by_id(data: web::Data<AppState>, id: web::Path<String>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<User>("users");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => match collection.find_one(doc! { "_id": object_id }, None).await {
            Ok(Some(user)) => HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "User retrieved successfully".to_string(),
                data: Some(user),
            }),
            Ok(None) => HttpResponse::NotFound().json(ApiResponse::<User> {
                success: false,
                message: "User not found".to_string(),
                data: None,
            }),
            Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<User> {
                success: false,
                message: format!("Error retrieving user: {}", e),
                data: None,
            }),
        },
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<User> {
            success: false,
            message: "Invalid user ID".to_string(),
            data: None,
        }),
    }
}

async fn create_user(
    data: web::Data<AppState>,
    req: web::Json<CreateUserRequest>,
) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<User>("users");

    let user = User {
        id: None,
        username: req.username.clone(),
        email: req.email.clone(),
        password: req.password.clone(),
        full_name: req.full_name.clone(),
        address: req.address.clone(),
        phone: req.phone.clone(),
        role: req.role.clone(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    match collection.insert_one(&user, None).await {
        Ok(result) => {
            let mut created_user = user;
            created_user.id = result.inserted_id.as_object_id();
            HttpResponse::Created().json(ApiResponse {
                success: true,
                message: "User created successfully".to_string(),
                data: Some(created_user),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<User> {
            success: false,
            message: format!("Error creating user: {}", e),
            data: None,
        }),
    }
}

async fn delete_user(data: web::Data<AppState>, id: web::Path<String>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<User>("users");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => match collection.delete_one(doc! { "_id": object_id }, None).await {
            Ok(result) => {
                if result.deleted_count == 0 {
                    HttpResponse::NotFound().json(ApiResponse::<String> {
                        success: false,
                        message: "User not found".to_string(),
                        data: None,
                    })
                } else {
                    HttpResponse::Ok().json(ApiResponse {
                        success: true,
                        message: "User deleted successfully".to_string(),
                        data: Some("User deleted".to_string()),
                    })
                }
            }
            Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                success: false,
                message: format!("Error deleting user: {}", e),
                data: None,
            }),
        },
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "Invalid user ID".to_string(),
            data: None,
        }),
    }
}

// ============================================================
// ORDER HANDLERS
// ============================================================

async fn get_all_orders(data: web::Data<AppState>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Order>("orders");

    match collection.find(None, None).await {
        Ok(mut cursor) => {
            let mut orders = Vec::new();
            while let Ok(Some(order)) = cursor.try_next().await {
                orders.push(order);
            }
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Orders retrieved successfully".to_string(),
                data: Some(orders),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Vec<Order>> {
            success: false,
            message: format!("Error retrieving orders: {}", e),
            data: None,
        }),
    }
}

async fn get_order_by_id(data: web::Data<AppState>, id: web::Path<String>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Order>("orders");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => match collection.find_one(doc! { "_id": object_id }, None).await {
            Ok(Some(order)) => HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Order retrieved successfully".to_string(),
                data: Some(order),
            }),
            Ok(None) => HttpResponse::NotFound().json(ApiResponse::<Order> {
                success: false,
                message: "Order not found".to_string(),
                data: None,
            }),
            Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Order> {
                success: false,
                message: format!("Error retrieving order: {}", e),
                data: None,
            }),
        },
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<Order> {
            success: false,
            message: "Invalid order ID".to_string(),
            data: None,
        }),
    }
}

async fn create_order(
    data: web::Data<AppState>,
    req: web::Json<CreateOrderRequest>,
) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Order>("orders");

    let order = Order {
        id: None,
        user_id: req.user_id.clone(),
        products: req.products.clone(),
        total_price: req.total_price,
        status: "pending".to_string(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    match collection.insert_one(&order, None).await {
        Ok(result) => {
            let mut created_order = order;
            created_order.id = result.inserted_id.as_object_id();
            HttpResponse::Created().json(ApiResponse {
                success: true,
                message: "Order created successfully".to_string(),
                data: Some(created_order),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Order> {
            success: false,
            message: format!("Error creating order: {}", e),
            data: None,
        }),
    }
}

async fn delete_order(data: web::Data<AppState>, id: web::Path<String>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Order>("orders");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => match collection.delete_one(doc! { "_id": object_id }, None).await {
            Ok(result) => {
                if result.deleted_count == 0 {
                    HttpResponse::NotFound().json(ApiResponse::<String> {
                        success: false,
                        message: "Order not found".to_string(),
                        data: None,
                    })
                } else {
                    HttpResponse::Ok().json(ApiResponse {
                        success: true,
                        message: "Order deleted successfully".to_string(),
                        data: Some("Order deleted".to_string()),
                    })
                }
            }
            Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                success: false,
                message: format!("Error deleting order: {}", e),
                data: None,
            }),
        },
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "Invalid order ID".to_string(),
            data: None,
        }),
    }
}

// ============================================================
// RATING HANDLERS
// ============================================================

async fn get_all_ratings(data: web::Data<AppState>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Rating>("ratings");

    match collection.find(None, None).await {
        Ok(mut cursor) => {
            let mut ratings = Vec::new();
            while let Ok(Some(rating)) = cursor.try_next().await {
                ratings.push(rating);
            }
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Ratings retrieved successfully".to_string(),
                data: Some(ratings),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Vec<Rating>> {
            success: false,
            message: format!("Error retrieving ratings: {}", e),
            data: None,
        }),
    }
}

async fn get_ratings_by_product(
    data: web::Data<AppState>,
    product_id: web::Path<String>,
) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Rating>("ratings");

    match collection
        .find(doc! { "product_id": product_id.into_inner() }, None)
        .await
    {
        Ok(mut cursor) => {
            let mut ratings = Vec::new();
            while let Ok(Some(rating)) = cursor.try_next().await {
                ratings.push(rating);
            }
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Ratings retrieved successfully".to_string(),
                data: Some(ratings),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Vec<Rating>> {
            success: false,
            message: format!("Error retrieving ratings: {}", e),
            data: None,
        }),
    }
}

async fn create_rating(
    data: web::Data<AppState>,
    req: web::Json<CreateRatingRequest>,
) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Rating>("ratings");

    if req.rating < 1 || req.rating > 5 {
        return HttpResponse::BadRequest().json(ApiResponse::<Rating> {
            success: false,
            message: "Rating must be between 1 and 5".to_string(),
            data: None,
        });
    }

    let rating = Rating {
        id: None,
        product_id: req.product_id.clone(),
        user_id: req.user_id.clone(),
        rating: req.rating,
        review: req.review.clone(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    match collection.insert_one(&rating, None).await {
        Ok(result) => {
            let mut created_rating = rating;
            created_rating.id = result.inserted_id.as_object_id();
            HttpResponse::Created().json(ApiResponse {
                success: true,
                message: "Rating created successfully".to_string(),
                data: Some(created_rating),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Rating> {
            success: false,
            message: format!("Error creating rating: {}", e),
            data: None,
        }),
    }
}

async fn delete_rating(data: web::Data<AppState>, id: web::Path<String>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Rating>("ratings");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => match collection.delete_one(doc! { "_id": object_id }, None).await {
            Ok(result) => {
                if result.deleted_count == 0 {
                    HttpResponse::NotFound().json(ApiResponse::<String> {
                        success: false,
                        message: "Rating not found".to_string(),
                        data: None,
                    })
                } else {
                    HttpResponse::Ok().json(ApiResponse {
                        success: true,
                        message: "Rating deleted successfully".to_string(),
                        data: Some("Rating deleted".to_string()),
                    })
                }
            }
            Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                success: false,
                message: format!("Error deleting rating: {}", e),
                data: None,
            }),
        },
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "Invalid rating ID".to_string(),
            data: None,
        }),
    }
}

// ============================================================
// MAIN APPLICATION
// ============================================================

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    dotenv::dotenv().ok();

    let mongo_uri = std::env::var("MONGODB_URI")
        .unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
    let database_name = std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string());
    let server_address = std::env::var("SERVER_ADDRESS").unwrap_or_else(|_| "127.0.0.1".to_string());
    let server_port = std::env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .unwrap_or(8080);

    let client_options = match ClientOptions::parse(&mongo_uri).await {
        Ok(opts) => opts,
        Err(e) => {
            eprintln!("Failed to parse MongoDB connection string: {}", e);
            std::process::exit(1);
        }
    };

    let client = match Client::with_options(client_options) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Failed to create MongoDB client: {}", e);
            std::process::exit(1);
        }
    };

    match client
        .database(&database_name)
        .run_command(doc! { "ping": 1 }, None)
        .await
    {
        Ok(_) => info!("Successfully connected to MongoDB"),
        Err(e) => {
            eprintln!("Failed to connect to MongoDB: {}", e);
            std::process::exit(1);
        }
    }

    let app_state = web::Data::new(AppState { client });
    let bind_address = format!("{}:{}", server_address, server_port);

    info!("Starting server at http://{}", bind_address);

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .wrap(middleware::Logger::default())
            .route("/health", web::get().to(health))
            .route("/api/products", web::get().to(get_all_products))
            .route("/api/products/{id}", web::get().to(get_product_by_id))
            .route("/api/products", web::post().to(create_product))
            .route("/api/products/{id}", web::put().to(update_product))
            .route("/api/products/{id}", web::delete().to(delete_product))
            .route("/api/users", web::get().to(get_all_users))
            .route("/api/users/{id}", web::get().to(get_user_by_id))
            .route("/api/users", web::post().to(create_user))
            .route("/api/users/{id}", web::delete().to(delete_user))
            .route("/api/orders", web::get().to(get_all_orders))
            .route("/api/orders/{id}", web::get().to(get_order_by_id))
            .route("/api/orders", web::post().to(create_order))
            .route("/api/orders/{id}", web::delete().to(delete_order))
            .route("/api/ratings", web::get().to(get_all_ratings))
            .route(
                "/api/ratings/product/{product_id}",
                web::get().to(get_ratings_by_product),
            )
            .route("/api/ratings", web::post().to(create_rating))
            .route("/api/ratings/{id}", web::delete().to(delete_rating))
    })
    .bind(&bind_address)?
    .run()
    .await
}
```

.env
```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=comic_store
SERVER_ADDRESS=127.0.0.1
SERVER_PORT=8080
LOG_LEVEL=info
```

cargo.toml
```toml
[package]
name = "comic-store-backend"
version = "0.1.0"
edition = "2021"

[dependencies]
actix-web = "4"
actix-rt = "2"
tokio = { version = "1", features = ["full"] }
mongodb = { version = "2", default-features = false, features = ["tokio-runtime"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
bson = { version = "2.4", features = ["serde_with"] }
serde_bytes = "0.11"
chrono = { version = "0.4", features = ["serde"] }
uuid = { version = "1.0", features = ["v4", "serde"] }
dotenv = "0.15"
log = "0.4"
env_logger = "0.10"
futures = "0.3"
```