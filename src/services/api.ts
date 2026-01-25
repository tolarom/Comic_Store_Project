/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

// Get base URL from environment or use default
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================================
// TYPES
// ============================================================

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

// Product Types
export interface Product {
  _id?: string
  id?: string
  title: string
  description: string
  price: number
  // percentage (0-100)
  discount?: number
  category: string
  stock: number
  image_url: string
  created_at?: string
  updated_at?: string
}

export interface CreateProductRequest {
  title: string
  description: string
  price: number
  category: string
  stock: number
  image_url: string
  // optional percentage 0-100
  discount?: number
}

export interface UpdateProductRequest {
  title?: string
  description?: string
  price?: number
  category?: string
  stock?: number
  image_url?: string
  discount?: number
}

// User Types
export interface User {
  _id?: string
  id?: string
  username: string
  email: string
  full_name: string
  address: string
  phone: string
  image_url?: string
  gender: string
  country: string
  role: 'admin' | 'customer'
  status: 'active' | 'blocked'
  created_at?: string
  updated_at?: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  full_name: string
  address: string
  phone: string
  image_url?: string
  role?: 'admin' | 'customer'
  country?: string
  gender?: string
  status?: 'active' | 'blocked'
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  password?: string
  full_name?: string
  address?: string
  phone?: string
  image_url?: string
  role?: string
  country?: string
  gender?: string
  status?: string
  active?: string | boolean
}

export interface LoginResponse {
  user: User
  token: string
}

// Order Types
export interface OrderItem {
  product_id: string
  quantity: number
  price: number
}

export interface Order {
  _id?: string
  id?: string
  user_id: string
  products: OrderItem[]
  total_price: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  order_type?: 'shipping' | 'pickup'
  created_at?: string
  updated_at?: string
}

export interface CreateOrderRequest {
  user_id: string
  products: OrderItem[]
  total_price: number
}

// Backend expects order_type: 'shipping' | 'pickup'
export interface CreateOrderRequestWithType extends CreateOrderRequest {
  order_type: 'shipping' | 'pickup'
}

// Rating Types
export interface Rating {
  _id?: string
  id?: string
  product_id: string
  user_id: string
  rating: number
  review: string
  created_at?: string
  updated_at?: string
}

export interface CreateRatingRequest {
  product_id: string
  user_id: string
  rating: number
  review: string
}

// ============================================================
// INTERCEPTORS
// ============================================================

// Request interceptor - add token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/loginPage'
    }
    return Promise.reject(error)
  },
)

// ============================================================
// HEALTH CHECK
// ============================================================

export async function checkHealth(): Promise<ApiResponse<string>> {
  return apiClient.get('/health')
}

// ============================================================
// PRODUCT API
// ============================================================

export async function getAllProducts(): Promise<Product[]> {
  try {
    const response = await apiClient.get<any, ApiResponse<Product[]>>('/api/products')
    return response.data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await apiClient.get<any, ApiResponse<Product>>(`/api/products/${id}`)
    if (!response.data) {
      throw new Error('Product not found')
    }
    return response.data
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

export async function createProduct(product: CreateProductRequest): Promise<Product> {
  try {
    const response = await apiClient.post<any, ApiResponse<Product>>('/api/products', product)
    if (!response.data) {
      throw new Error('Failed to create product')
    }
    return response.data
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

export async function updateProduct(
  id: string,
  product: UpdateProductRequest,
): Promise<string> {
  try {
    const response = await apiClient.put<any, ApiResponse<string>>(`/api/products/${id}`, product)
    return response.message || 'Product updated successfully'
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

export async function deleteProduct(id: string): Promise<string> {
  try {
    const response = await apiClient.delete<any, ApiResponse<string>>(`/api/products/${id}`)
    return response.message || 'Product deleted successfully'
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const allProducts = await getAllProducts()
    return allProducts.filter((p) => p.category.toLowerCase() === category.toLowerCase())
  } catch (error) {
    console.error('Error fetching products by category:', error)
    throw error
  }
}

// ============================================================
// USER/AUTH API
// ============================================================

export async function register(userData: CreateUserRequest): Promise<User> {
  try {
    const response = await apiClient.post<any, any>('/api/auth/register', userData)
    
    if (!response.data) {
      throw new Error('Failed to register user')
    }

    // If registration returns a token (auto-login), store it
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
    }
    
    return response.data.user || response.data
  } catch (error: any) {
    console.error('Error registering user:', error)
    throw new Error(error?.response?.data?.message || 'Registration failed')
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<any, any>('/api/auth/login', {
      email,
      password,
    })

    if (!response.data || !response.data.token) {
      throw new Error('Login failed - no token received')
    }

    // Store token and user
    localStorage.setItem('authToken', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    return {
      token: response.data.token,
      user: response.data.user,
    }
  } catch (error: any) {
    console.error('Error logging in:', error)
    const errorMsg = error?.response?.data?.message || error?.message || 'Login failed'
    throw new Error(errorMsg)
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<string> {
  try {
    const response = await apiClient.put<any, ApiResponse<string>>('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return response.message || 'Password changed successfully'
  } catch (error: any) {
    console.error('Error changing password:', error)
    const errorMsg = error?.response?.data?.message || error?.message || 'Failed to change password'
    throw new Error(errorMsg)
  }
}

export function logout(): void {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  localStorage.removeItem('cartItems')
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('authToken')
}

export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === 'admin'
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const response = await apiClient.get<any, ApiResponse<User[]>>('/api/users')
    return response.data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export async function getUserById(id: string): Promise<User> {
  try {
    const response = await apiClient.get<any, ApiResponse<User>>(`/api/users/${id}`)
    if (!response.data) {
      throw new Error('User not found')
    }
    return response.data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export async function updateUser(id: string, userData: UpdateUserRequest): Promise<string> {
  try {
    // Remove password field if it's empty or undefined (don't update password)
    const cleanedData = { ...userData } as any
    if (!cleanedData.password) {
      delete cleanedData.password
    }
    
    const response = await apiClient.put<any, ApiResponse<User>>(`/api/users/${id}`, cleanedData)
    
    // Update stored user data with the response
    const currentUser = getCurrentUser()
    if (currentUser) {
      // Merge the updated fields with current user
      const updatedUser = {
        ...currentUser,
        ...cleanedData,
        _id: currentUser._id,
        id: currentUser.id
      }
      
      // If backend returned updated user data, use that
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
      } else {
        // Otherwise use our merged data
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    }
    
    return response.message || 'User updated successfully'
  } catch (error: any) {
    console.error('Error updating user:', error)
    const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update user'
    throw new Error(errorMsg)
  }
}

// Convenience helpers for user status actions
export async function blockUser(id: string): Promise<string> {
  try {
    const response = await apiClient.post<any, ApiResponse<string>>(`/api/users/${id}/block`)
    return response.message || 'User blocked successfully'
  } catch (error) {
    console.error('Error blocking user:', error)
    throw error
  }
}

export async function activateUser(id: string): Promise<string> {
  try {
    const response = await apiClient.post<any, ApiResponse<string>>(`/api/users/${id}/activate`)
    return response.message || 'User activated successfully'
  } catch (error) {
    console.error('Error activating user:', error)
    throw error
  }
}

export async function updateUserActive(id: string, active: string | boolean): Promise<string> {
  try {
    const payload = typeof active === 'boolean' ? { active } : { active: String(active) }
    const response = await apiClient.put<any, ApiResponse<User>>(`/api/users/${id}`, payload)
    if (response.data && response.data._id) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.message || 'User updated successfully'
  } catch (error) {
    console.error('Error updating user active status:', error)
    throw error
  }
}

export async function deleteUser(id: string): Promise<string> {
  try {
    const response = await apiClient.delete<any, ApiResponse<string>>(`/api/users/${id}`)
    return response.message || 'User deleted successfully'
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// ============================================================
// ORDER API
// ============================================================

export async function getAllOrders(): Promise<Order[]> {
  try {
    const response = await apiClient.get<any, ApiResponse<Order[]>>('/api/orders')
    return response.data || []
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

export async function getOrderById(id: string): Promise<Order> {
  try {
    const response = await apiClient.get<any, ApiResponse<Order>>(`/api/orders/${id}`)
    if (!response.data) {
      throw new Error('Order not found')
    }
    return response.data
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
}

export async function createOrder(orderData: CreateOrderRequest): Promise<Order> {
  try {
    const response = await apiClient.post<any, ApiResponse<Order>>('/api/orders', orderData)
    if (!response.data) {
      throw new Error('Failed to create order')
    }
    return response.data
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

export async function updateOrderStatus(
  id: string,
  status: Order['status'],
): Promise<string> {
  try {
    const response = await apiClient.put<any, ApiResponse<string>>(`/api/orders/${id}`, {
      status,
    })
    return response.message || 'Order updated successfully'
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

export async function deleteOrder(id: string): Promise<string> {
  try {
    const response = await apiClient.delete<any, ApiResponse<string>>(`/api/orders/${id}`)
    return response.message || 'Order deleted successfully'
  } catch (error) {
    console.error('Error deleting order:', error)
    throw error
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const allOrders = await getAllOrders()
    return allOrders.filter((order) => order.user_id === userId)
  } catch (error) {
    console.error('Error fetching user orders:', error)
    throw error
  }
}

// ============================================================
// RATING API
// ============================================================

export async function getAllRatings(): Promise<Rating[]> {
  try {
    const response = await apiClient.get<any, ApiResponse<Rating[]>>('/api/ratings')
    return response.data || []
  } catch (error) {
    console.error('Error fetching ratings:', error)
    throw error
  }
}

export async function getRatingsByProduct(productId: string): Promise<Rating[]> {
  try {
    const response = await apiClient.get<any, ApiResponse<Rating[]>>(
      `/api/ratings/product/${productId}`,
    )
    return response.data || []
  } catch (error) {
    console.error('Error fetching product ratings:', error)
    throw error
  }
}

export async function getAverageRating(productId: string): Promise<number> {
  try {
    const ratings = await getRatingsByProduct(productId)
    if (ratings.length === 0) return 0
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0)
    return sum / ratings.length
  } catch (error) {
    console.error('Error calculating average rating:', error)
    return 0
  }
}

export async function createRating(ratingData: CreateRatingRequest): Promise<Rating> {
  try {
    const response = await apiClient.post<any, ApiResponse<Rating>>('/api/ratings', ratingData)
    if (!response.data) {
      throw new Error('Failed to create rating')
    }
    return response.data
  } catch (error) {
    console.error('Error creating rating:', error)
    throw error
  }
}

export async function deleteRating(id: string): Promise<string> {
  try {
    const response = await apiClient.delete<any, ApiResponse<string>>(`/api/ratings/${id}`)
    return response.message || 'Rating deleted successfully'
  } catch (error) {
    console.error('Error deleting rating:', error)
    throw error
  }
}

export async function getUserRatings(userId: string): Promise<Rating[]> {
  try {
    const allRatings = await getAllRatings()
    return allRatings.filter((rating) => rating.user_id === userId)
  } catch (error) {
    console.error('Error fetching user ratings:', error)
    throw error
  }
}

// ============================================================
// CART API
// ============================================================

export interface CartItem {
  product_id: string
  quantity: number
  price: number
}

export interface Cart {
  _id?: string
  id?: string
  user_id: string
  items: CartItem[]
  total_price: number
  created_at?: string
  updated_at?: string
}

export async function getCart(userId: string): Promise<Cart> {
  try {
    const response = await apiClient.get<any, ApiResponse<Cart>>(`/api/carts/${userId}`)
    if (!response.data) {
      throw new Error('Failed to fetch cart')
    }
    return response.data
  } catch (error) {
    console.error('Error fetching cart:', error)
    throw error
  }
}

export async function addItemToCart(userId: string, productId: string, quantity = 1): Promise<Cart> {
  try {
    const response = await apiClient.post<any, ApiResponse<Cart>>(`/api/carts/${userId}/items`, {
      product_id: productId,
      quantity,
    })
    if (!response.data) {
      throw new Error('Failed to add item to cart')
    }
    return response.data
  } catch (error) {
    console.error('Error adding item to cart:', error)
    throw error
  }
}

export async function updateCartItem(userId: string, productId: string, quantity: number): Promise<Cart> {
  try {
    const response = await apiClient.put<any, ApiResponse<Cart>>(
      `/api/carts/${userId}/items/${productId}`,
      { quantity },
    )
    if (!response.data) {
      throw new Error('Failed to update cart item')
    }
    return response.data
  } catch (error) {
    console.error('Error updating cart item:', error)
    throw error
  }
}

export async function removeCartItem(userId: string, productId: string): Promise<Cart> {
  try {
    const response = await apiClient.delete<any, ApiResponse<Cart>>(
      `/api/carts/${userId}/items/${productId}`,
    )
    if (!response.data) {
      throw new Error('Failed to remove cart item')
    }
    return response.data
  } catch (error) {
    console.error('Error removing cart item:', error)
    throw error
  }
}

export async function clearCart(userId: string): Promise<{ message: string } | ApiResponse<string>> {
  try {
    const response = await apiClient.delete<any, ApiResponse<string>>(`/api/carts/${userId}`)
    return response
  } catch (error) {
    // Treat 404 (cart not found) as a successful clear — cart is already empty on backend
    const status = (error as any)?.response?.status
    if (status === 404) {
      console.warn('Cart not found on backend, treating as cleared')
      return { message: 'Cart not found' }
    }

    console.error('Error clearing cart:', error)
    throw error
  }
}

export async function hasUserRatedProduct(productId: string, userId: string): Promise<boolean> {
  try {
    const ratings = await getRatingsByProduct(productId)
    return ratings.some((rating) => rating.user_id === userId)
  } catch (error) {
    console.error('Error checking rating:', error)
    return false
  }
}

// ============================================================
// GROUP / CATEGORY API
// ============================================================

export interface Category {
  _id?: string
  name: string
  slug?: string
  group_id?: string
}

export interface Group {
  _id?: string
  name: string
  slug?: string
}

export async function getAllGroups(): Promise<Group[]> {
  try {
    const response = await apiClient.get<any>('/api/groups')
    // response may be ApiResponse<Group[]> or Group[] depending on backend
    if (Array.isArray(response)) return response as Group[]
    if (response && Array.isArray((response as unknown as ApiResponse<Group[]>).data)) {
      return (response as unknown as ApiResponse<Group[]>).data || []
    }
    return []
  } catch (error) {
    console.error('Error fetching groups:', error)
    throw error
  }
}

export async function getCategoriesByGroup(groupId: string): Promise<Category[]> {
  try {
    // Backend doesn't provide group-specific endpoint; fetch all categories and filter
    const resp = await apiClient.get<any>('/api/categories')
    let categories: Category[] = []
    if (Array.isArray(resp)) {
      categories = resp as Category[]
    } else if (resp && Array.isArray((resp as unknown as ApiResponse<Category[]>).data)) {
      categories = (resp as unknown as ApiResponse<Category[]>).data || []
    }

    // Filter by groupId - handle different possible representations
    const filtered = categories.filter((c: any) => {
      if (!c) return false
      if (!c.group_id) return false
      // group_id may be stored as a string, or as an object like { "$oid": "..." }
      if (typeof c.group_id === 'string') return c.group_id === groupId
      if (c.group_id && typeof c.group_id === 'object') {
        return c.group_id.$oid === groupId || String(c.group_id) === groupId
      }
      return false
    })
    return filtered
  } catch (error) {
    console.error('Error fetching categories for group:', error)
    throw error
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const resp = await apiClient.get<any>('/api/categories')
    if (Array.isArray(resp)) return resp as Category[]
    if (resp && Array.isArray((resp as unknown as ApiResponse<Category[]>).data)) {
      return (resp as unknown as ApiResponse<Category[]>).data || []
    }
    return []
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

export default apiClient
