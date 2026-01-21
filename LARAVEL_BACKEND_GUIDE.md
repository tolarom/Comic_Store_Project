# Laravel Backend Guide - Comic Store

A comprehensive guide to building a Laravel backend API for the Comic Store Vue.js frontend.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Database Configuration](#database-configuration)
4. [Database Schema & Migrations](#database-schema--migrations)
5. [Models & Relationships](#models--relationships)
6. [API Routes & Controllers](#api-routes--controllers)
7. [Authentication & Authorization](#authentication--authorization)
8. [Middleware](#middleware)
9. [Request Validation](#request-validation)
10. [API Resources & Transformers](#api-resources--transformers)
11. [Testing](#testing)
12. [Deployment](#deployment)

---

## Prerequisites

- PHP >= 8.1
- Composer
- MySQL/PostgreSQL/SQLite
- Node.js & npm (for asset compilation if needed)
- Laravel Installer (optional but recommended)

```bash
# Install Laravel globally
composer global require laravel/installer

# Or use Composer
composer create-project laravel/laravel comic-store-api
```

---

## Project Setup

### 1. Create New Laravel Project

```bash
# Using Laravel Installer
laravel new comic-store-api

# OR using Composer
composer create-project laravel/laravel comic-store-api

cd comic-store-api
```

### 2. Install Essential Packages

```bash
# Laravel Sanctum for API authentication
composer require laravel/sanctum

# Spatie Laravel Permission for role management
composer require spatie/laravel-permission

# Laravel Telescope for debugging (dev only)
composer require laravel/telescope --dev
php artisan telescope:install

# Laravel IDE Helper (dev only)
composer require --dev barryvdh/laravel-ide-helper
```

### 3. Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

Update `.env`:

```env
APP_NAME="Comic Store API"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=comic_store
DB_USERNAME=root
DB_PASSWORD=

# For CORS (frontend URL)
FRONTEND_URL=http://localhost:5173

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
SESSION_DOMAIN=localhost
```

---

## Database Configuration

### 1. Create Database

```sql
CREATE DATABASE comic_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure CORS

Install Laravel CORS (already included in Laravel 9+):

**config/cors.php**:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### 3. Publish Sanctum Configuration

```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

---

## Database Schema & Migrations

### 1. Create Migrations

```bash
# Users migration (comes with Laravel, we'll modify it)
# php artisan make:migration create_users_table (already exists)

php artisan make:migration create_categories_table
php artisan make:migration create_products_table
php artisan make:migration create_carts_table
php artisan make:migration create_cart_items_table
php artisan make:migration create_orders_table
php artisan make:migration create_order_items_table
php artisan make:migration create_reviews_table
```

### 2. Define Migrations

**database/migrations/xxxx_xx_xx_create_users_table.php**:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('email', 150)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['Customer', 'Admin'])->default('Customer');
            $table->enum('status', ['Active', 'Blocked'])->default('Active');
            $table->string('phone', 50)->nullable();
            $table->text('address')->nullable();
            $table->date('joined_date')->nullable();
            $table->timestamp('last_login')->nullable();
            $table->integer('total_orders')->default(0);
            $table->decimal('total_spent', 12, 2)->default(0);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

**database/migrations/xxxx_xx_xx_create_categories_table.php**:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);
            $table->string('slug', 120)->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
```

**database/migrations/xxxx_xx_xx_create_products_table.php**:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title', 200);
            $table->string('subtitle', 200)->nullable();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('discount')->default(0); // percentage
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('review_count')->default(0);
            $table->string('image', 300)->nullable();
            $table->integer('stock')->default(0);
            $table->integer('sales')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
```

**database/migrations/xxxx_xx_xx_create_carts_table.php**:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['Active', 'Converted', 'Abandoned'])->default('Active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
```

**database/migrations/xxxx_xx_xx_create_cart_items_table.php**:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->boolean('selected')->default(true);
            $table->decimal('unit_price', 10, 2); // snapshot at add time
            $table->integer('discount')->default(0); // percentage
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
```

**database/migrations/xxxx_xx_xx_create_orders_table.php**:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'])->default('Pending');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('shipping_fee', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->timestamp('placed_at')->useCurrent();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
```

**database/migrations/xxxx_xx_xx_create_order_items_table.php**:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->integer('discount')->default(0); // percentage
            $table->decimal('line_total', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
```

**database/migrations/xxxx_xx_xx_create_reviews_table.php**:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('rating'); // 1-5 stars
            $table->text('comment')->nullable();
            $table->timestamps();

            // Prevent duplicate reviews per user per product
            $table->unique(['user_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
```

### 3. Run Migrations

```bash
php artisan migrate
```

---

## Models & Relationships

### 1. Create Models

```bash
php artisan make:model Category
php artisan make:model Product
php artisan make:model Cart
php artisan make:model CartItem
php artisan make:model Order
php artisan make:model OrderItem
php artisan make:model Review
```

### 2. Define Model Relationships

**app/Models/User.php**:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'phone',
        'address',
        'joined_date',
        'last_login',
        'total_orders',
        'total_spent',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'joined_date' => 'date',
        'last_login' => 'datetime',
        'total_spent' => 'decimal:2',
    ];

    // Relationships
    public function carts()
    {
        return $this->hasMany(Cart::class);
    }

    public function activeCart()
    {
        return $this->hasOne(Cart::class)->where('status', 'Active');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // Helper methods
    public function isAdmin(): bool
    {
        return $this->role === 'Admin';
    }

    public function isActive(): bool
    {
        return $this->status === 'Active';
    }
}
```

**app/Models/Category.php**:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
```

**app/Models/Product.php**:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'subtitle',
        'description',
        'price',
        'discount',
        'rating',
        'review_count',
        'image',
        'stock',
        'sales',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'rating' => 'decimal:2',
    ];

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // Accessors
    public function getFinalPriceAttribute()
    {
        return $this->price * (1 - $this->discount / 100);
    }

    public function getInStockAttribute(): bool
    {
        return $this->stock > 0;
    }
}
```

**app/Models/Cart.php**:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    // Calculate cart total
    public function calculateTotal()
    {
        return $this->items->sum(function ($item) {
            return $item->unit_price * (1 - $item->discount / 100) * $item->quantity;
        });
    }
}
```

**app/Models/CartItem.php**:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'product_id',
        'quantity',
        'selected',
        'unit_price',
        'discount',
    ];

    protected $casts = [
        'selected' => 'boolean',
        'unit_price' => 'decimal:2',
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getSubtotalAttribute()
    {
        return $this->unit_price * (1 - $this->discount / 100) * $this->quantity;
    }
}
```

**app/Models/Order.php**:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'subtotal',
        'discount_total',
        'shipping_fee',
        'total',
        'placed_at',
        'paid_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'total' => 'decimal:2',
        'placed_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
```

**app/Models/OrderItem.php**:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'unit_price',
        'discount',
        'line_total',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'line_total' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
```

**app/Models/Review.php**:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'comment',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
```

---

## API Routes & Controllers

### 1. Define API Routes

**routes/api.php**:

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'addItem']);
    Route::put('/cart/{itemId}', [CartController::class, 'updateItem']);
    Route::delete('/cart/{itemId}', [CartController::class, 'removeItem']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'create']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
});

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Products
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Categories
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Orders
    Route::put('/orders/{id}', [OrderController::class, 'updateStatus']);
    Route::get('/orders', [OrderController::class, 'adminIndex']);
});
```

### 2. Create Controllers

```bash
php artisan make:controller Api/AuthController
php artisan make:controller Api/ProductController
php artisan make:controller Api/CategoryController
php artisan make:controller Api/CartController
php artisan make:controller Api/OrderController
php artisan make:controller Api/ReviewController
php artisan make:controller Api/UserController
```

### 3. Implement Controllers

**app/Http/Controllers/Api/AuthController.php**:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|string|email|max:150|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'joined_date' => now(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status !== 'Active') {
            return response()->json([
                'message' => 'Your account has been blocked. Please contact support.',
            ], 403);
        }

        // Update last login
        $user->update(['last_login' => now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:150',
            'phone' => 'sometimes|string|max:50',
            'address' => 'sometimes|string',
        ]);

        $user->update($request->only(['name', 'phone', 'address']));

        return response()->json($user);
    }
}
```

**app/Http/Controllers/Api/ProductController.php**:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 12);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'reviews.user'])->findOrFail($id);
        return response()->json($product);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'required|string|max:200',
            'subtitle' => 'nullable|string|max:200',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount' => 'nullable|integer|min:0|max:100',
            'image' => 'nullable|string|max:300',
            'stock' => 'required|integer|min:0',
        ]);

        $product = Product::create($request->all());

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'sometimes|string|max:200',
            'price' => 'sometimes|numeric|min:0',
            'discount' => 'sometimes|integer|min:0|max:100',
            'stock' => 'sometimes|integer|min:0',
        ]);

        $product->update($request->all());

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
```

**app/Http/Controllers/Api/CartController.php**:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cart = $request->user()->activeCart()->with('items.product')->first();

        if (!$cart) {
            $cart = Cart::create([
                'user_id' => $request->user()->id,
                'status' => 'Active',
            ]);
        }

        return response()->json($cart);
    }

    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);
        $cart = $request->user()->activeCart()->firstOrCreate([
            'user_id' => $request->user()->id,
            'status' => 'Active',
        ]);

        // Check if item already exists
        $cartItem = $cart->items()->where('product_id', $product->id)->first();

        if ($cartItem) {
            $cartItem->quantity += $request->quantity;
            $cartItem->save();
        } else {
            $cartItem = $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'unit_price' => $product->price,
                'discount' => $product->discount,
            ]);
        }

        return response()->json($cartItem->load('product'), 201);
    }

    public function updateItem(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'sometimes|integer|min:1',
            'selected' => 'sometimes|boolean',
        ]);

        $cartItem = CartItem::findOrFail($itemId);

        // Verify ownership
        if ($cartItem->cart->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cartItem->update($request->only(['quantity', 'selected']));

        return response()->json($cartItem->load('product'));
    }

    public function removeItem(Request $request, $itemId)
    {
        $cartItem = CartItem::findOrFail($itemId);

        // Verify ownership
        if ($cartItem->cart->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart']);
    }

    public function clear(Request $request)
    {
        $cart = $request->user()->activeCart()->first();

        if ($cart) {
            $cart->items()->delete();
        }

        return response()->json(['message' => 'Cart cleared']);
    }
}
```

**app/Http/Controllers/Api/OrderController.php**:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with('items.product')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with('items.product')->findOrFail($id);

        // Verify ownership
        if ($order->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($order);
    }

    public function create(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_fee' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $subtotal = 0;
            $discountTotal = 0;

            // Calculate totals
            foreach ($request->items as $item) {
                $product = \App\Models\Product::findOrFail($item['product_id']);
                $itemSubtotal = $product->price * $item['quantity'];
                $itemDiscount = $itemSubtotal * ($product->discount / 100);

                $subtotal += $itemSubtotal;
                $discountTotal += $itemDiscount;
            }

            $shippingFee = $request->get('shipping_fee', 0);
            $total = $subtotal - $discountTotal + $shippingFee;

            // Create order
            $order = Order::create([
                'user_id' => $request->user()->id,
                'status' => 'Pending',
                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'shipping_fee' => $shippingFee,
                'total' => $total,
            ]);

            // Create order items
            foreach ($request->items as $item) {
                $product = \App\Models\Product::findOrFail($item['product_id']);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'discount' => $product->discount,
                    'line_total' => $product->price * $item['quantity'] * (1 - $product->discount / 100),
                ]);

                // Update product stock and sales
                $product->decrement('stock', $item['quantity']);
                $product->increment('sales', $item['quantity']);
            }

            // Update user stats
            $user = $request->user();
            $user->increment('total_orders');
            $user->increment('total_spent', $total);

            // Clear cart (optional)
            $cart = $user->activeCart()->first();
            if ($cart) {
                $cart->items()->delete();
                $cart->update(['status' => 'Converted']);
            }

            DB::commit();

            return response()->json($order->load('items.product'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create order', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Pending,Paid,Shipped,Delivered,Cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        if ($request->status === 'Paid' && !$order->paid_at) {
            $order->update(['paid_at' => now()]);
        }

        return response()->json($order);
    }

    public function adminIndex(Request $request)
    {
        $query = Order::with(['user', 'items.product']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($orders);
    }
}
```

---

## Authentication & Authorization

### 1. Admin Middleware

Create middleware for admin access:

```bash
php artisan make:middleware EnsureUserIsAdmin
```

**app/Http/Middleware/EnsureUserIsAdmin.php**:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        return $next($request);
    }
}
```

Register middleware in **app/Http/Kernel.php** (Laravel 10) or **bootstrap/app.php** (Laravel 11):

```php
// For Laravel 10
protected $middlewareAliases = [
    // ...
    'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
];

// For Laravel 11 in bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
    ]);
})
```

### 2. Configure Sanctum

**app/Http/Kernel.php** (add to api middleware group):

```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

---

## Request Validation

### Create Form Requests

```bash
php artisan make:request StoreProductRequest
php artisan make:request UpdateProductRequest
php artisan make:request StoreOrderRequest
```

Example **app/Http/Requests/StoreProductRequest.php**:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'required|string|max:200',
            'subtitle' => 'nullable|string|max:200',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount' => 'nullable|integer|min:0|max:100',
            'image' => 'nullable|string|max:300',
            'stock' => 'required|integer|min:0',
        ];
    }
}
```

---

## API Resources & Transformers

Create resources for clean API responses:

```bash
php artisan make:resource ProductResource
php artisan make:resource UserResource
php artisan make:resource OrderResource
```

**app/Http/Resources/ProductResource.php**:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => $this->category?->name,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'description' => $this->description,
            'price' => $this->price,
            'discount' => $this->discount,
            'final_price' => $this->final_price,
            'rating' => $this->rating,
            'review_count' => $this->review_count,
            'image' => $this->image,
            'stock' => $this->stock,
            'in_stock' => $this->in_stock,
            'sales' => $this->sales,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

---

## Testing

### 1. Setup Testing Database

**.env.testing**:

```env
DB_CONNECTION=sqlite
DB_DATABASE=:memory:
```

### 2. Create Tests

```bash
php artisan make:test AuthTest
php artisan make:test ProductTest
php artisan make:test OrderTest
```

**tests/Feature/AuthTest.php**:

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    }
}
```

### 3. Run Tests

```bash
php artisan test
```

---

## Deployment

### 1. Production Checklist

- Set `APP_ENV=production` and `APP_DEBUG=false`
- Configure database credentials
- Run migrations: `php artisan migrate --force`
- Cache configuration: `php artisan config:cache`
- Cache routes: `php artisan route:cache`
- Optimize autoloader: `composer install --optimize-autoloader --no-dev`
- Setup queue worker for jobs
- Configure CORS for production frontend URL

### 2. Sample Deployment Script

```bash
#!/bin/bash

git pull origin main
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart
```

---

## Running the Application

```bash
# Start Laravel development server
php artisan serve

# Or use Laravel Sail (Docker)
./vendor/bin/sail up

# Run queue worker
php artisan queue:work

# Run scheduler (in cron or background)
php artisan schedule:work
```

---

## Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Laravel API Resources](https://laravel.com/docs/eloquent-resources)
- [Laravel Testing](https://laravel.com/docs/testing)

---

## Database Seeding

### Create Seeders

```bash
php artisan make:seeder CategorySeeder
php artisan make:seeder ProductSeeder
php artisan make:seeder UserSeeder
```

**database/seeders/DatabaseSeeder.php**:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
        ]);
    }
}
```

Run seeders:

```bash
php artisan db:seed
```

---

## Integration with Vue Frontend

### Axios Configuration (Vue Frontend)

**src/services/api.ts**:

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

---

**Your Laravel backend is now ready to integrate with your Vue.js frontend!** 🚀
