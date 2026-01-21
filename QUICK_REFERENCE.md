# Comic Store - Quick Reference Guide

## 🚀 Getting Started

### Initial Setup
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

---

## 📦 Project Structure

```
src/
├── components/
│   ├── Admin/          # Admin-specific components
│   ├── client/         # Client-specific components
│   └── common/         # NEW: Reusable components (LoadingSpinner, ErrorMessage, EmptyState)
├── composables/        # NEW: Vue composables (useAsync, useDebounce, useToast, etc.)
├── config/            # NEW: Centralized configuration
├── data/              # Mock data and stores
├── router/            # Vue Router configuration
├── services/          # NEW: API service layer
├── stores/            # Pinia stores
├── types/             # NEW: TypeScript type definitions
├── utils/             # NEW: Utility functions (validators, formatters, storage)
└── views/             # Page components
```

---

## 💡 Common Tasks

### 1. Validate User Input
```typescript
import { validators } from '@/utils/validators'

// Email validation
if (!validators.email(email)) {
  errors.value.email = 'Invalid email'
}

// Password validation
const { valid, message } = validators.password(password)
if (!valid) {
  errors.value.password = message
}

// Required field
if (!validators.required(username)) {
  errors.value.username = 'Username is required'
}
```

### 2. Format Data
```typescript
import { formatters } from '@/utils/formatters'

// Currency
const price = formatters.currency(29.99) // "$29.99"

// Date
const date = formatters.date(new Date()) // "January 21, 2026"

// Time ago
const time = formatters.timeAgo('2026-01-21T10:00:00') // "2h ago"

// Truncate text
const short = formatters.truncate(longText, 100) // "Text..."
```

### 3. Use Safe Storage
```typescript
import { storage } from '@/utils/storage'

// Save data
storage.set('user', userData)

// Load data with default
const user = storage.get<User>('user', null)

// Check existence
if (storage.has('authToken')) {
  // User is logged in
}

// Remove item
storage.remove('tempData')
```

### 4. Make API Calls
```typescript
import { api } from '@/services/api'

// Get products
try {
  const { products, total } = await api.getProducts({
    category: 'manga',
    page: 1,
    limit: 12
  })
} catch (error) {
  console.error('Failed to load products:', error)
}

// Create order
const order = await api.createOrder({
  user_name: 'John Doe',
  user_email: 'john@example.com',
  product_name: 'Batman Comic',
  quantity: 1,
  total_price: 19.99,
  status: 'pending',
  order_date: new Date().toISOString()
})
```

### 5. Handle Async Operations
```typescript
import { useAsync } from '@/composables/useAsync'
import { api } from '@/services/api'

const { data: products, loading, error, execute } = useAsync(
  () => api.getProducts(),
  {
    immediate: true,
    onSuccess: (data) => {
      console.log('Products loaded:', data)
    },
    onError: (err) => {
      console.error('Error loading products:', err)
    }
  }
)

// In template:
// <LoadingSpinner v-if="loading" />
// <ErrorMessage v-else-if="error" :message="error.message" />
// <ProductList v-else :products="products" />
```

### 6. Debounce Search Input
```typescript
import { ref } from 'vue'
import { useDebounce } from '@/composables/useDebounce'

const searchQuery = ref('')
const debouncedQuery = useDebounce(searchQuery, 500)

// Watch debouncedQuery for API calls
watch(debouncedQuery, (query) => {
  if (query) {
    searchProducts(query)
  }
})
```

### 7. Show Toast Notifications
```typescript
import { useToast } from '@/composables/useToast'

const toast = useToast()

// Success
toast.success('Product added to cart!')

// Error (longer duration)
toast.error('Failed to save changes')

// Warning
toast.warning('Low stock available')

// Info
toast.info('New version available')
```

### 8. Use Products Store
```typescript
import { useProductsStore } from '@/data/products'

const productsStore = useProductsStore()

// Get all products
const allProducts = productsStore.products

// Get by ID
const product = productsStore.getById(1)

// Get by category
const mangas = productsStore.getByCategory('manga')

// Search
const results = productsStore.searchProducts('batman')

// Get all categories
const categories = productsStore.categories

// Check stock
if (productsStore.isInStock(productId)) {
  // Add to cart
}

// Get discounted price
const price = productsStore.discountedPriceById(1)
```

### 9. Use Cart Store
```typescript
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

// Add item
cart.addToCart({
  id: product.id,
  name: product.title,
  price: product.price,
  image: product.image
})

// Update quantity
cart.updateQuantity(productId, 3)

// Remove item
cart.removeFromCart(productId)

// Get totals
console.log('Subtotal:', cart.subtotal)
console.log('Shipping:', cart.shipping)
console.log('Total:', cart.total)
console.log('Items:', cart.totalItems)

// Select/unselect
cart.selectItem(productId, true)
cart.selectAllItems(true)

// Remove selected
cart.removeSelectedItems()

// Clear cart
cart.clearCart()
```

### 10. Protected Routes
```typescript
// In router/index.ts, routes are automatically protected
// Public routes: /, /client/shop, /loginPage, /signUpPage, /client/products/*
// All other routes require authentication

// Check auth in components:
const isAuthenticated = !!localStorage.getItem('authToken')

// Redirect to login:
router.push('/loginPage')
```

---

## 🎨 Using Common Components

### LoadingSpinner
```vue
<template>
  <LoadingSpinner size="large" message="Loading products..." />
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
</script>
```

### ErrorMessage
```vue
<template>
  <ErrorMessage
    type="error"
    title="Failed to Load"
    message="Could not fetch products. Please try again."
    :show-retry="true"
    @retry="loadProducts"
  />
</template>

<script setup lang="ts">
import ErrorMessage from '@/components/common/ErrorMessage.vue'
</script>
```

### EmptyState
```vue
<template>
  <EmptyState
    icon="pi pi-shopping-cart"
    title="Your cart is empty"
    message="Add some products to get started"
  >
    <template #action>
      <router-link to="/client/products">
        <button>Browse Products</button>
      </router-link>
    </template>
  </EmptyState>
</template>

<script setup lang="ts">
import EmptyState from '@/components/common/EmptyState.vue'
</script>
```

---

## ⚙️ Configuration

### Update Config Values
Edit `src/config/index.ts`:

```typescript
export const config = {
  cart: {
    freeShippingThreshold: 50,  // Change this
    defaultShippingCost: 5,     // Change this
  },
  pagination: {
    defaultPageSize: 12,         // Change this
  }
}
```

### Environment Variables
Edit `.env`:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_DEV_TOOLS=false
```

Access in code:
```typescript
import config from '@/config'
const apiUrl = config.api.baseUrl
```

---

## 🧪 Type Definitions

### Using Types
```typescript
import type { Product, CartItem, User, Order } from '@/types'

const product: Product = {
  id: 1,
  title: 'Batman',
  subtitle: 'Comic',
  price: 19.99,
  discount: 10,
  rating: 4.5,
  image: 'url',
  // ...
}

const cartItem: CartItem = {
  id: 1,
  name: 'Batman',
  price: 19.99,
  quantity: 1,
  image: 'url',
  selected: true
}
```

---

## 🔒 Security Best Practices

1. **Always validate user input** using `validators`
2. **Sanitize HTML** using `sanitize.html()` from validators
3. **Use the API service** for all HTTP requests (includes token management)
4. **Store sensitive data** only in httpOnly cookies (not localStorage)
5. **Check authentication** before accessing protected routes

---

## 🐛 Debugging

### Check Errors
```typescript
import { get_errors } from '@/utils/errors' // if implemented

// Or use console
console.error('Error:', error)
console.log('Debug:', data)
```

### Enable Dev Tools
In `.env`:
```env
VITE_ENABLE_DEV_TOOLS=true
```

---

## 📚 Further Reading

- [PROJECT_IMPROVEMENTS.md](./PROJECT_IMPROVEMENTS.md) - Detailed documentation of all improvements
- [Vue 3 Docs](https://vuejs.org/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Vite Docs](https://vitejs.dev/)

---

## ❓ Common Issues

### Issue: Cart not persisting
**Solution**: Cart now auto-saves to localStorage. Check browser storage quota.

### Issue: TypeScript errors on .vue imports
**Solution**: Fixed in `env.d.ts`. Restart TypeScript server if needed.

### Issue: API calls failing
**Solution**: Check `.env` for correct `VITE_API_BASE_URL`. Ensure backend is running.

### Issue: Route not protected
**Solution**: Remove route from public routes list in `router/index.ts`.

---

**Need help? Check the detailed documentation in [PROJECT_IMPROVEMENTS.md](./PROJECT_IMPROVEMENTS.md)**
