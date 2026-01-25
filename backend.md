use actix_web::{web, App, HttpResponse, HttpServer, middleware, HttpRequest};
use actix_cors::Cors;
use chrono::{DateTime, Utc, Duration};
use futures::stream::TryStreamExt;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
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
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub discount: Option<f64>,
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
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub image_url: Option<String>,
    #[serde(default = "default_role")]
    pub role: String, // "admin" or "customer", defaults to "customer"
    #[serde(default = "default_country")]
    pub country: String,
    #[serde(default = "default_gender")]
    pub gender: String,
    #[serde(default = "default_status")]
    pub status: String, // "active" or "blocked"
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
    pub order_type: String,
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

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Category {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub group_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Group {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: String,
    pub data: Option<T>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CartItem {
    pub product_id: String,
    pub quantity: i32,
    pub price: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Cart {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: String,
    pub items: Vec<CartItem>,
    pub total_price: f64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
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
    #[serde(default)]
    pub discount: Option<f64>,
}

#[derive(Deserialize)]
pub struct CreateUserRequest {
    pub username: String,
    pub email: String,
    pub password: String,
    pub full_name: String,
    pub address: String,
    pub phone: String,
    #[serde(default)]
    pub image_url: Option<String>,
    #[serde(default = "default_role")]
    pub role: String, // "admin" or "customer", defaults to "customer"
    #[serde(default = "default_country")]
    pub country: String,
    #[serde(default = "default_gender")]
    pub gender: String,
    #[serde(default = "default_status")]
    pub status: String,
}

#[derive(Deserialize)]
pub struct UpdateUserRequest {
    pub username: Option<String>,
    pub email: Option<String>,
    pub password: Option<String>,
    pub full_name: Option<String>,
    pub address: Option<String>,
    pub phone: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub image_url: Option<String>,
    pub role: Option<String>,
    pub country: Option<String>,
    pub gender: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
    // Accept `active` as an alias for `status` (e.g. { "active": "blocked" } or { "active": true })
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub active: Option<serde_json::Value>,
}

fn default_role() -> String {
    "customer".to_string()
}

fn default_country() -> String {
    "Unknown".to_string()
}

fn default_gender() -> String {
    "other".to_string()
}

fn default_status() -> String {
    "active".to_string()
}

#[derive(Deserialize)]
pub struct CreateOrderRequest {
    pub user_id: String,
    pub products: Vec<OrderItem>,
    pub total_price: f64,
    pub order_type: String,
}

#[derive(Deserialize)]
pub struct UpdateOrderRequest {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub order_type: Option<String>,
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
    pub discount: Option<f64>,
}

#[derive(Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub group_id: Option<String>,
    pub description: Option<String>,
}

#[derive(Deserialize)]
pub struct CreateGroupRequest {
    pub name: String,
    pub description: Option<String>,
}

#[derive(Deserialize)]
pub struct CreateCartItemRequest {
    pub product_id: String,
    pub quantity: i32,
}

#[derive(Deserialize)]
pub struct UpdateCartItemRequest {
    pub quantity: i32,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct RegisterRequest {
    pub username: String,
    pub email: String,
    pub password: String,
    pub full_name: String,
    pub address: String,
    pub phone: String,
    #[serde(default)]
    pub image_url: Option<String>,
    #[serde(default = "default_country")]
    pub country: String,
    #[serde(default = "default_gender")]
    pub gender: String,
}

#[derive(Deserialize)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Claims {
    pub sub: String,      // user_id
    pub email: String,
    pub role: String,
    pub exp: i64,         // expiration time
    pub iat: i64,         // issued at
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserResponse,
}

#[derive(Serialize, Clone)]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub email: String,
    pub full_name: String,
    pub role: String,
}

// ============================================================
// APP STATE
// ============================================================

pub struct AppState {
    pub client: Client,
    pub jwt_secret: String,
}

// ============================================================
// JWT HELPER FUNCTIONS
// ============================================================

fn generate_jwt(user_id: &str, email: &str, role: &str, secret: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now();
    let exp = now + Duration::hours(24);

    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        role: role.to_string(),
        exp: exp.timestamp(),
        iat: now.timestamp(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

fn verify_jwt(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map(|data| data.claims)
}

// Helper function to extract token from request
fn extract_token(req: &HttpRequest) -> Option<String> {
    req.headers()
        .get("Authorization")
        .and_then(|h| h.to_str().ok())
        .and_then(|h| h.strip_prefix("Bearer "))
        .map(|s| s.to_string())
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
// AUTHENTICATION HANDLERS
// ============================================================

async fn register(
    data: web::Data<AppState>,
    req: web::Json<RegisterRequest>,
) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<User>("users");

    // Check if email already exists
    if let Ok(Some(_)) = collection.find_one(doc! { "email": &req.email }, None).await {
        return HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "Email already registered".to_string(),
            data: None,
        });
    }

    // Check if username already exists
    if let Ok(Some(_)) = collection.find_one(doc! { "username": &req.username }, None).await {
        return HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "Username already taken".to_string(),
            data: None,
        });
    }

    let user = User {
        id: None,
        username: req.username.clone(),
        email: req.email.clone(),
        password: req.password.clone(),
        full_name: req.full_name.clone(),
        address: req.address.clone(),
        phone: req.phone.clone(),
        image_url: req.image_url.clone(),
        role: "customer".to_string(),
        country: req.country.clone(),
        gender: req.gender.clone(),
        status: "active".to_string(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    match collection.insert_one(&user, None).await {
        Ok(result) => {
            let user_id = result.inserted_id.as_object_id().unwrap().to_hex();
            
            let token = match generate_jwt(&user_id, &user.email, &user.role, &data.jwt_secret) {
                Ok(t) => t,
                Err(e) => {
                    return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                        success: false,
                        message: format!("Error generating token: {}", e),
                        data: None,
                    });
                }
            };

            let response = LoginResponse {
                token,
                user: UserResponse {
                    id: user_id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                },
            };

            HttpResponse::Created().json(ApiResponse {
                success: true,
                message: "User registered successfully".to_string(),
                data: Some(response),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
            success: false,
            message: format!("Error creating user: {}", e),
            data: None,
        }),
    }
}

async fn login(
    data: web::Data<AppState>,
    req: web::Json<LoginRequest>,
) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<User>("users");

    // Find user by email
    let user = match collection.find_one(doc! { "email": &req.email }, None).await {
        Ok(Some(user)) => user,
        Ok(None) => {
            return HttpResponse::Unauthorized().json(ApiResponse::<String> {
                success: false,
                message: "Invalid email or password".to_string(),
                data: None,
            });
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                success: false,
                message: format!("Error finding user: {}", e),
                data: None,
            });
        }
    };

    // Check if user is blocked
    if user.status == "blocked" {
        return HttpResponse::Forbidden().json(ApiResponse::<String> {
            success: false,
            message: "Your account has been blocked".to_string(),
            data: None,
        });
    }

    // Simple password comparison
    if req.password != user.password {
        return HttpResponse::Unauthorized().json(ApiResponse::<String> {
            success: false,
            message: "Invalid email or password".to_string(),
            data: None,
        });
    }

    let user_id = user.id.unwrap().to_hex();
    let token = match generate_jwt(&user_id, &user.email, &user.role, &data.jwt_secret) {
        Ok(t) => t,
        Err(e) => {
            return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                success: false,
                message: format!("Error generating token: {}", e),
                data: None,
            });
        }
    };

    let response = LoginResponse {
        token,
        user: UserResponse {
            id: user_id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
        },
    };

    HttpResponse::Ok().json(ApiResponse {
        success: true,
        message: "Login successful".to_string(),
        data: Some(response),
    })
}

async fn get_current_user(
    data: web::Data<AppState>,
    req: HttpRequest,
) -> HttpResponse {
    let token = match extract_token(&req) {
        Some(t) => t,
        None => {
            return HttpResponse::Unauthorized().json(ApiResponse::<String> {
                success: false,
                message: "Missing authorization token".to_string(),
                data: None,
            });
        }
    };

    let claims = match verify_jwt(&token, &data.jwt_secret) {
        Ok(c) => c,
        Err(_) => {
            return HttpResponse::Unauthorized().json(ApiResponse::<String> {
                success: false,
                message: "Invalid token".to_string(),
                data: None,
            });
        }
    };

    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<User>("users");

    match ObjectId::parse_str(&claims.sub) {
        Ok(object_id) => {
            match collection.find_one(doc! { "_id": object_id }, None).await {
                Ok(Some(user)) => {
                    let user_response = UserResponse {
                        id: user.id.unwrap().to_hex(),
                        username: user.username,
                        email: user.email,
                        full_name: user.full_name,
                        role: user.role,
                    };
                    HttpResponse::Ok().json(ApiResponse {
                        success: true,
                        message: "User retrieved successfully".to_string(),
                        data: Some(user_response),
                    })
                }
                Ok(None) => HttpResponse::NotFound().json(ApiResponse::<String> {
                    success: false,
                    message: "User not found".to_string(),
                    data: None,
                }),
                Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                    success: false,
                    message: format!("Error retrieving user: {}", e),
                    data: None,
                }),
            }
        }
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "Invalid user ID".to_string(),
            data: None,
        }),
    }
}

async fn change_password(
    data: web::Data<AppState>,
    req: HttpRequest,
    body: web::Json<ChangePasswordRequest>,
) -> HttpResponse {
    let token = match extract_token(&req) {
        Some(t) => t,
        None => {
            return HttpResponse::Unauthorized().json(ApiResponse::<String> {
                success: false,
                message: "Missing authorization token".to_string(),
                data: None,
            });
        }
    };

    let claims = match verify_jwt(&token, &data.jwt_secret) {
        Ok(c) => c,
        Err(_) => {
            return HttpResponse::Unauthorized().json(ApiResponse::<String> {
                success: false,
                message: "Invalid token".to_string(),
                data: None,
            });
        }
    };

    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<User>("users");

    match ObjectId::parse_str(&claims.sub) {
        Ok(object_id) => {
            match collection.find_one(doc! { "_id": object_id }, None).await {
                Ok(Some(user)) => {
                    // Verify current password
                    if body.current_password != user.password {
                        return HttpResponse::Unauthorized().json(ApiResponse::<String> {
                            success: false,
                            message: "Current password is incorrect".to_string(),
                            data: None,
                        });
                    }

                    // Update password
                    let update_doc = doc! { 
                        "$set": { 
                            "password": &body.new_password,
                            "updated_at": to_bson(&Utc::now()).unwrap()
                        } 
                    };

                    match collection.update_one(doc! { "_id": object_id }, update_doc, None).await {
                        Ok(_) => {
                            HttpResponse::Ok().json(ApiResponse {
                                success: true,
                                message: "Password changed successfully".to_string(),
                                data: Some("Password updated".to_string()),
                            })
                        }
                        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                            success: false,
                            message: format!("Error updating password: {}", e),
                            data: None,
                        }),
                    }
                }
                Ok(None) => HttpResponse::NotFound().json(ApiResponse::<String> {
                    success: false,
                    message: "User not found".to_string(),
                    data: None,
                }),
                Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                    success: false,
                    message: format!("Error retrieving user: {}", e),
                    data: None,
                }),
            }
        }
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "Invalid user ID".to_string(),
            data: None,
        }),
    }
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

async fn block_user(data: web::Data<AppState>, id: web::Path<String>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<User>("users");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => {
            let update_doc = doc! { "$set": { "status": "blocked", "updated_at": to_bson(&Utc::now()).unwrap() } };
            match collection.update_one(doc! { "_id": object_id }, update_doc, None).await {
                Ok(result) => {
                    if result.matched_count == 0 {
                        HttpResponse::NotFound().json(ApiResponse::<String> {
                            success: false,
                            message: "User not found".to_string(),
                            data: None,
                        })
                    } else {
                        HttpResponse::Ok().json(ApiResponse {
                            success: true,
                            message: "User blocked successfully".to_string(),
                            data: Some("User blocked".to_string()),
                        })
                    }
                }
                Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                    success: false,
                    message: format!("Error blocking user: {}", e),
                    data: None,
                }),
            }
        }
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "Invalid user ID".to_string(),
            data: None,
        }),
    }
}

async fn activate_user(data: web::Data<AppState>, id: web::Path<String>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<User>("users");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => {
            let update_doc = doc! { "$set": { "status": "active", "updated_at": to_bson(&Utc::now()).unwrap() } };
            match collection.update_one(doc! { "_id": object_id }, update_doc, None).await {
                Ok(result) => {
                    if result.matched_count == 0 {
                        HttpResponse::NotFound().json(ApiResponse::<String> {
                            success: false,
                            message: "User not found".to_string(),
                            data: None,
                        })
                    } else {
                        HttpResponse::Ok().json(ApiResponse {
                            success: true,
                            message: "User activated successfully".to_string(),
                            data: Some("User activated".to_string()),
                        })
                    }
                }
                Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                    success: false,
                    message: format!("Error activating user: {}", e),
                    data: None,
                }),
            }
        }
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "Invalid user ID".to_string(),
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
        discount: req.discount,
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
            if let Some(discount) = req.discount {
                update_doc.insert("discount", discount);
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
        image_url: req.image_url.clone(),
        role: req.role.clone(),
        country: req.country.clone(),
        gender: req.gender.clone(),
        status: req.status.clone(),
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

async fn update_user(
    data: web::Data<AppState>,
    id: web::Path<String>,
    req: web::Json<UpdateUserRequest>,
) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<User>("users");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => {
            let mut update_doc = doc! {};

            if let Some(username) = &req.username {
                update_doc.insert("username", username.clone());
            }
            if let Some(email) = &req.email {
                update_doc.insert("email", email.clone());
            }
            if let Some(password) = &req.password {
                update_doc.insert("password", password.clone());
            }
            if let Some(full_name) = &req.full_name {
                update_doc.insert("full_name", full_name.clone());
            }
            if let Some(address) = &req.address {
                update_doc.insert("address", address.clone());
            }
            if let Some(phone) = &req.phone {
                update_doc.insert("phone", phone.clone());
            }
            if let Some(image_url) = &req.image_url {
                update_doc.insert("image_url", image_url.clone());
            }
            if let Some(role) = &req.role {
                update_doc.insert("role", role.clone());
            }
            if let Some(country) = &req.country {
                update_doc.insert("country", country.clone());
            }
            if let Some(gender) = &req.gender {
                update_doc.insert("gender", gender.clone());
            }
            if let Some(status) = &req.status {
                update_doc.insert("status", status.clone());
            }
            // support `active` alias: can be string "active"/"blocked" or boolean true/false
            if let Some(active_val) = &req.active {
                // Try to interpret the value
                if active_val.is_string() {
                    if let Some(s) = active_val.as_str() {
                        let mapped = if s.eq_ignore_ascii_case("blocked") { "blocked" } else { "active" };
                        update_doc.insert("status", mapped.to_string());
                    }
                } else if active_val.is_boolean() {
                    let b = active_val.as_bool().unwrap_or(true);
                    let mapped = if b { "active" } else { "blocked" };
                    update_doc.insert("status", mapped.to_string());
                }
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
                            message: "User not found".to_string(),
                            data: None,
                        })
                    } else {
                        HttpResponse::Ok().json(ApiResponse {
                            success: true,
                            message: "User updated successfully".to_string(),
                            data: Some("User updated".to_string()),
                        })
                    }
                }
                Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                    success: false,
                    message: format!("Error updating user: {}", e),
                    data: None,
                }),
            }
        }
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "Invalid user ID".to_string(),
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

    // validate order_type
    let order_type = req.order_type.to_lowercase();
    if order_type != "shipping" && order_type != "pickup" {
        return HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "order_type must be 'shipping' or 'pickup'".to_string(),
            data: None,
        });
    }

    let order = Order {
        id: None,
        user_id: req.user_id.clone(),
        products: req.products.clone(),
        total_price: req.total_price,
        order_type: order_type.clone(),
        status: "pending".to_string(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    match collection.insert_one(&order, None).await {
        Ok(result) => {
            let mut created_order = order;
            created_order.id = result.inserted_id.as_object_id();

            // attempt to clear the user's cart
            let carts = db.collection::<Cart>("carts");
            match carts.delete_one(doc! { "user_id": &created_order.user_id }, None).await {
                Ok(res) => {
                    let msg = if res.deleted_count > 0 {
                        "Order created successfully and cart cleared".to_string()
                    } else {
                        "Order created successfully (no cart to clear)".to_string()
                    };
                    HttpResponse::Created().json(ApiResponse {
                        success: true,
                        message: msg,
                        data: Some(created_order),
                    })
                }
                Err(e) => HttpResponse::Created().json(ApiResponse {
                    success: true,
                    message: format!("Order created but failed to clear cart: {}", e),
                    data: Some(created_order),
                }),
            }
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

async fn update_order(
    data: web::Data<AppState>,
    id: web::Path<String>,
    req: web::Json<UpdateOrderRequest>,
) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Order>("orders");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => {
            // build dynamic $set document
            let mut set_doc = mongodb::bson::Document::new();
            set_doc.insert("updated_at", to_bson(&Utc::now()).unwrap());

            if let Some(ref status) = req.status {
                set_doc.insert("status", status.clone());
            }

            if let Some(ref order_type) = req.order_type {
                let ot = order_type.to_lowercase();
                if ot != "shipping" && ot != "pickup" {
                    return HttpResponse::BadRequest().json(ApiResponse::<String> {
                        success: false,
                        message: "order_type must be 'shipping' or 'pickup'".to_string(),
                        data: None,
                    });
                }
                set_doc.insert("order_type", ot);
            }

            if set_doc.is_empty() {
                return HttpResponse::BadRequest().json(ApiResponse::<String> {
                    success: false,
                    message: "No update fields provided".to_string(),
                    data: None,
                });
            }

            let update_doc = doc! { "$set": set_doc };

            match collection.update_one(doc! { "_id": object_id }, update_doc, None).await {
                Ok(result) => {
                    if result.matched_count == 0 {
                        HttpResponse::NotFound().json(ApiResponse::<String> {
                            success: false,
                            message: "Order not found".to_string(),
                            data: None,
                        })
                    } else {
                        HttpResponse::Ok().json(ApiResponse {
                            success: true,
                            message: "Order updated successfully".to_string(),
                            data: Some("Order updated".to_string()),
                        })
                    }
                }
                Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                    success: false,
                    message: format!("Error updating order: {}", e),
                    data: None,
                }),
            }
        }
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
// CATEGORY HANDLERS
// ============================================================

async fn get_all_categories(data: web::Data<AppState>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Category>("categories");

    match collection.find(None, None).await {
        Ok(mut cursor) => {
            let mut items = Vec::new();
            while let Ok(Some(item)) = cursor.try_next().await {
                items.push(item);
            }
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Categories retrieved successfully".to_string(),
                data: Some(items),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Vec<Category>> {
            success: false,
            message: format!("Error retrieving categories: {}", e),
            data: None,
        }),
    }
}

async fn get_category_by_id(data: web::Data<AppState>, id: web::Path<String>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Category>("categories");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => match collection.find_one(doc! { "_id": object_id }, None).await {
            Ok(Some(item)) => HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Category retrieved successfully".to_string(),
                data: Some(item),
            }),
            Ok(None) => HttpResponse::NotFound().json(ApiResponse::<Category> {
                success: false,
                message: "Category not found".to_string(),
                data: None,
            }),
            Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Category> {
                success: false,
                message: format!("Error retrieving category: {}", e),
                data: None,
            }),
        },
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<Category> {
            success: false,
            message: "Invalid category ID".to_string(),
            data: None,
        }),
    }
}

async fn create_category(
    data: web::Data<AppState>,
    req: web::Json<CreateCategoryRequest>,
) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Category>("categories");

    let category = Category {
        id: None,
        name: req.name.clone(),
        group_id: req.group_id.clone(),
        description: req.description.clone(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    match collection.insert_one(&category, None).await {
        Ok(result) => {
            let mut created = category;
            created.id = result.inserted_id.as_object_id();
            HttpResponse::Created().json(ApiResponse {
                success: true,
                message: "Category created successfully".to_string(),
                data: Some(created),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Category> {
            success: false,
            message: format!("Error creating category: {}", e),
            data: None,
        }),
    }
}

async fn delete_category(data: web::Data<AppState>, id: web::Path<String>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Category>("categories");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => match collection.delete_one(doc! { "_id": object_id }, None).await {
            Ok(result) => {
                if result.deleted_count == 0 {
                    HttpResponse::NotFound().json(ApiResponse::<String> {
                        success: false,
                        message: "Category not found".to_string(),
                        data: None,
                    })
                } else {
                    HttpResponse::Ok().json(ApiResponse {
                        success: true,
                        message: "Category deleted successfully".to_string(),
                        data: Some("Category deleted".to_string()),
                    })
                }
            }
            Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                success: false,
                message: format!("Error deleting category: {}", e),
                data: None,
            }),
        },
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "Invalid category ID".to_string(),
            data: None,
        }),
    }
}

// ============================================================
// GROUP HANDLERS
// ============================================================

async fn get_all_groups(data: web::Data<AppState>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Group>("groups");

    match collection.find(None, None).await {
        Ok(mut cursor) => {
            let mut items = Vec::new();
            while let Ok(Some(item)) = cursor.try_next().await {
                items.push(item);
            }
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Groups retrieved successfully".to_string(),
                data: Some(items),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Vec<Group>> {
            success: false,
            message: format!("Error retrieving groups: {}", e),
            data: None,
        }),
    }
}

async fn get_group_by_id(data: web::Data<AppState>, id: web::Path<String>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Group>("groups");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => match collection.find_one(doc! { "_id": object_id }, None).await {
            Ok(Some(item)) => HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Group retrieved successfully".to_string(),
                data: Some(item),
            }),
            Ok(None) => HttpResponse::NotFound().json(ApiResponse::<Group> {
                success: false,
                message: "Group not found".to_string(),
                data: None,
            }),
            Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Group> {
                success: false,
                message: format!("Error retrieving group: {}", e),
                data: None,
            }),
        },
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<Group> {
            success: false,
            message: "Invalid group ID".to_string(),
            data: None,
        }),
    }
}

async fn create_group(
    data: web::Data<AppState>,
    req: web::Json<CreateGroupRequest>,
) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Group>("groups");

    let group = Group {
        id: None,
        name: req.name.clone(),
        description: req.description.clone(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    match collection.insert_one(&group, None).await {
        Ok(result) => {
            let mut created = group;
            created.id = result.inserted_id.as_object_id();
            HttpResponse::Created().json(ApiResponse {
                success: true,
                message: "Group created successfully".to_string(),
                data: Some(created),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Group> {
            success: false,
            message: format!("Error creating group: {}", e),
            data: None,
        }),
    }
}

async fn delete_group(data: web::Data<AppState>, id: web::Path<String>) -> HttpResponse {
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Group>("groups");

    match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => match collection.delete_one(doc! { "_id": object_id }, None).await {
            Ok(result) => {
                if result.deleted_count == 0 {
                    HttpResponse::NotFound().json(ApiResponse::<String> {
                        success: false,
                        message: "Group not found".to_string(),
                        data: None,
                    })
                } else {
                    HttpResponse::Ok().json(ApiResponse {
                        success: true,
                        message: "Group deleted successfully".to_string(),
                        data: Some("Group deleted".to_string()),
                    })
                }
            }
            Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                success: false,
                message: format!("Error deleting group: {}", e),
                data: None,
            }),
        },
        Err(_) => HttpResponse::BadRequest().json(ApiResponse::<String> {
            success: false,
            message: "Invalid group ID".to_string(),
            data: None,
        }),
    }
}

// ============================================================
// CART HANDLERS
// ============================================================

async fn get_cart(data: web::Data<AppState>, user_id: web::Path<String>) -> HttpResponse {
    let user = user_id.into_inner();
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let collection = db.collection::<Cart>("carts");

    match collection.find_one(doc! { "user_id": &user }, None).await {
        Ok(Some(cart)) => HttpResponse::Ok().json(ApiResponse {
            success: true,
            message: "Cart retrieved successfully".to_string(),
            data: Some(cart),
        }),
        Ok(None) => {
            let empty = Cart {
                id: None,
                user_id: user,
                items: Vec::new(),
                total_price: 0.0,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            };
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Cart is empty".to_string(),
                data: Some(empty),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Cart> {
            success: false,
            message: format!("Error retrieving cart: {}", e),
            data: None,
        }),
    }
}

async fn add_item_to_cart(
    data: web::Data<AppState>,
    user_id: web::Path<String>,
    req: web::Json<CreateCartItemRequest>,
) -> HttpResponse {
    let user = user_id.into_inner();
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));

    // get product price
    let products = db.collection::<Product>("products");
    let product_oid = match ObjectId::parse_str(&req.product_id) {
        Ok(oid) => oid,
        Err(_) => {
            return HttpResponse::BadRequest().json(ApiResponse::<String> {
                success: false,
                message: "Invalid product ID".to_string(),
                data: None,
            })
        }
    };

    let product = match products.find_one(doc! { "_id": product_oid }, None).await {
        Ok(Some(p)) => p,
        Ok(None) => {
            return HttpResponse::BadRequest().json(ApiResponse::<String> {
                success: false,
                message: "Product not found".to_string(),
                data: None,
            })
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                success: false,
                message: format!("Error fetching product: {}", e),
                data: None,
            })
        }
    };

    let mut price = product.price;
    if let Some(dp) = product.discount {
        price = price * (1.0 - dp / 100.0);
    }

    let carts = db.collection::<Cart>("carts");

    match carts.find_one(doc! { "user_id": &user }, None).await {
        Ok(Some(mut cart)) => {
            let mut found = false;
            for item in cart.items.iter_mut() {
                if item.product_id == req.product_id {
                    item.quantity += req.quantity;
                    found = true;
                    break;
                }
            }
            if !found {
                cart.items.push(CartItem {
                    product_id: req.product_id.clone(),
                    quantity: req.quantity,
                    price,
                });
            }

            let total: f64 = cart
                .items
                .iter()
                .map(|i| i.price * (i.quantity as f64))
                .sum();

            cart.updated_at = Utc::now();
            cart.total_price = total;

            match carts
                .update_one(
                    doc! { "user_id": &cart.user_id },
                    doc! {
                        "$set": {
                            "items": to_bson(&cart.items).unwrap(),
                            "total_price": cart.total_price,
                            "updated_at": to_bson(&cart.updated_at).unwrap()
                        }
                    },
                    None,
                )
                .await
            {
                Ok(_) => HttpResponse::Ok().json(ApiResponse {
                    success: true,
                    message: "Cart updated successfully".to_string(),
                    data: Some(cart),
                }),
                Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Cart> {
                    success: false,
                    message: format!("Error updating cart: {}", e),
                    data: None,
                }),
            }
        }
        Ok(None) => {
            let new_cart = Cart {
                id: None,
                user_id: user.clone(),
                items: vec![CartItem {
                    product_id: req.product_id.clone(),
                    quantity: req.quantity,
                    price,
                }],
                total_price: price * (req.quantity as f64),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            };

            match carts.insert_one(&new_cart, None).await {
                Ok(result) => {
                    let mut created = new_cart;
                    created.id = result.inserted_id.as_object_id();
                    HttpResponse::Created().json(ApiResponse {
                        success: true,
                        message: "Cart created and item added".to_string(),
                        data: Some(created),
                    })
                }
                Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Cart> {
                    success: false,
                    message: format!("Error creating cart: {}", e),
                    data: None,
                }),
            }
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Cart> {
            success: false,
            message: format!("Error accessing cart: {}", e),
            data: None,
        }),
    }
}

async fn update_cart_item(
    data: web::Data<AppState>,
    path: web::Path<(String, String)>,
    req: web::Json<UpdateCartItemRequest>,
) -> HttpResponse {
    let (user, product_id) = path.into_inner();
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let carts = db.collection::<Cart>("carts");

    match carts.find_one(doc! { "user_id": &user }, None).await {
        Ok(Some(mut cart)) => {
            let mut found = false;
            cart.items.retain(|item| {
                if item.product_id == product_id {
                    found = true;
                    // will be removed if quantity <= 0
                    if req.quantity <= 0 {
                        return false;
                    }
                }
                true
            });

            if found {
                // update or push
                let mut exists = false;
                for item in cart.items.iter_mut() {
                    if item.product_id == product_id {
                        item.quantity = req.quantity;
                        exists = true;
                        break;
                    }
                }

                if !exists && req.quantity > 0 {
                    // need price; try to look up product price
                    let products = db.collection::<Product>("products");
                    if let Ok(Some(p)) = products
                        .find_one(doc! { "_id": ObjectId::parse_str(&product_id).unwrap_or(ObjectId::new()) }, None)
                        .await
                    {
                        let mut item_price = p.price;
                        if let Some(dp) = p.discount {
                            item_price = item_price * (1.0 - dp / 100.0);
                        }
                        cart.items.push(CartItem {
                            product_id: product_id.clone(),
                            quantity: req.quantity,
                            price: item_price,
                        });
                    }
                }

                let total: f64 = cart
                    .items
                    .iter()
                    .map(|i| i.price * (i.quantity as f64))
                    .sum();

                cart.total_price = total;
                cart.updated_at = Utc::now();

                match carts
                    .update_one(
                        doc! { "user_id": &cart.user_id },
                        doc! {
                            "$set": {
                                "items": to_bson(&cart.items).unwrap(),
                                "total_price": cart.total_price,
                                "updated_at": to_bson(&cart.updated_at).unwrap()
                            }
                        },
                        None,
                    )
                    .await
                {
                    Ok(_) => HttpResponse::Ok().json(ApiResponse {
                        success: true,
                        message: "Cart item updated".to_string(),
                        data: Some(cart),
                    }),
                    Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Cart> {
                        success: false,
                        message: format!("Error updating cart: {}", e),
                        data: None,
                    }),
                }
            } else {
                HttpResponse::NotFound().json(ApiResponse::<String> {
                    success: false,
                    message: "Cart item not found".to_string(),
                    data: None,
                })
            }
        }
        Ok(None) => HttpResponse::NotFound().json(ApiResponse::<String> {
            success: false,
            message: "Cart not found".to_string(),
            data: None,
        }),
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Cart> {
            success: false,
            message: format!("Error accessing cart: {}", e),
            data: None,
        }),
    }
}

async fn remove_cart_item(
    data: web::Data<AppState>,
    path: web::Path<(String, String)>,
) -> HttpResponse {
    let (user, product_id) = path.into_inner();
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let carts = db.collection::<Cart>("carts");

    match carts.find_one(doc! { "user_id": &user }, None).await {
        Ok(Some(mut cart)) => {
            let before = cart.items.len();
            cart.items.retain(|item| item.product_id != product_id);
            if cart.items.len() == before {
                return HttpResponse::NotFound().json(ApiResponse::<String> {
                    success: false,
                    message: "Item not found in cart".to_string(),
                    data: None,
                });
            }

            cart.total_price = cart.items.iter().map(|i| i.price * (i.quantity as f64)).sum();
            cart.updated_at = Utc::now();

            match carts
                .update_one(
                    doc! { "user_id": &cart.user_id },
                    doc! {
                        "$set": {
                            "items": to_bson(&cart.items).unwrap(),
                            "total_price": cart.total_price,
                            "updated_at": to_bson(&cart.updated_at).unwrap()
                        }
                    },
                    None,
                )
                .await
            {
                Ok(_) => HttpResponse::Ok().json(ApiResponse {
                    success: true,
                    message: "Item removed from cart".to_string(),
                    data: Some(cart),
                }),
                Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Cart> {
                    success: false,
                    message: format!("Error updating cart: {}", e),
                    data: None,
                }),
            }
        }
        Ok(None) => HttpResponse::NotFound().json(ApiResponse::<String> {
            success: false,
            message: "Cart not found".to_string(),
            data: None,
        }),
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<Cart> {
            success: false,
            message: format!("Error accessing cart: {}", e),
            data: None,
        }),
    }
}

async fn clear_cart(data: web::Data<AppState>, user_id: web::Path<String>) -> HttpResponse {
    let user = user_id.into_inner();
    let db = data
        .client
        .database(&std::env::var("DATABASE_NAME").unwrap_or_else(|_| "comic_store".to_string()));
    let carts = db.collection::<Cart>("carts");

    match carts.delete_one(doc! { "user_id": &user }, None).await {
        Ok(res) => {
            if res.deleted_count == 0 {
                HttpResponse::NotFound().json(ApiResponse::<String> {
                    success: false,
                    message: "Cart not found".to_string(),
                    data: None,
                })
            } else {
                HttpResponse::Ok().json(ApiResponse::<String> {
                    success: true,
                    message: "Cart cleared".to_string(),
                    data: None,
                })
            }
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
            success: false,
            message: format!("Error clearing cart: {}", e),
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
    let jwt_secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "your-secret-key-change-this-in-production".to_string());
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

    let app_state = web::Data::new(AppState { 
        client,
        jwt_secret: jwt_secret.clone(),
    });
    let bind_address = format!("{}:{}", server_address, server_port);

    info!("Starting server at http://{}", bind_address);

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header()
            )
            .wrap(middleware::Logger::default())
            .route("/health", web::get().to(health))
            // Auth routes
            .route("/api/auth/register", web::post().to(register))
            .route("/api/auth/login", web::post().to(login))
            .route("/api/auth/me", web::get().to(get_current_user))
            .route("/api/auth/change-password", web::put().to(change_password))
            // Product routes
            .route("/api/products", web::get().to(get_all_products))
            .route("/api/products/{id}", web::get().to(get_product_by_id))
            .route("/api/products", web::post().to(create_product))
            .route("/api/products/{id}", web::put().to(update_product))
            .route("/api/products/{id}", web::delete().to(delete_product))
            // User routes
            .route("/api/users", web::get().to(get_all_users))
            .route("/api/users/{id}", web::get().to(get_user_by_id))
            .route("/api/users/{id}", web::put().to(update_user))
            .route("/api/users/{id}/block", web::post().to(block_user))
            .route("/api/users/{id}/activate", web::post().to(activate_user))
            .route("/api/users", web::post().to(create_user))
            .route("/api/users/{id}", web::delete().to(delete_user))
            // Order routes
            .route("/api/orders", web::get().to(get_all_orders))
            .route("/api/orders/{id}", web::get().to(get_order_by_id))
            .route("/api/orders", web::post().to(create_order))
            .route("/api/orders/{id}", web::put().to(update_order))
            .route("/api/orders/{id}", web::delete().to(delete_order))
            // Rating routes
            .route("/api/ratings", web::get().to(get_all_ratings))
            .route("/api/ratings/product/{product_id}", web::get().to(get_ratings_by_product))
            .route("/api/ratings", web::post().to(create_rating))
            .route("/api/ratings/{id}", web::delete().to(delete_rating))
            // Category routes
            .route("/api/categories", web::get().to(get_all_categories))
            .route("/api/categories/{id}", web::get().to(get_category_by_id))
            .route("/api/categories", web::post().to(create_category))
            .route("/api/categories/{id}", web::delete().to(delete_category))
            // Group routes
            .route("/api/groups", web::get().to(get_all_groups))
            .route("/api/groups/{id}", web::get().to(get_group_by_id))
            .route("/api/groups", web::post().to(create_group))
            .route("/api/groups/{id}", web::delete().to(delete_group))
            // Cart routes
            .route("/api/carts/{user_id}", web::get().to(get_cart))
            .route("/api/carts/{user_id}/items", web::post().to(add_item_to_cart))
            .route("/api/carts/{user_id}/items/{product_id}", web::put().to(update_cart_item))
            .route("/api/carts/{user_id}/items/{product_id}", web::delete().to(remove_cart_item))
            .route("/api/carts/{user_id}", web::delete().to(clear_cart))
    })
    .bind(&bind_address)?
    .run()
    .await
}
