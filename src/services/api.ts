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
}

export interface UpdateProductRequest {
  title?: string
  description?: string
  price?: number
  category?: string
  stock?: number
  image_url?: string
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
  role: 'admin' | 'customer'
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
  role?: 'admin' | 'customer'
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
  created_at?: string
  updated_at?: string
}

export interface CreateOrderRequest {
  user_id: string
  products: OrderItem[]
  total_price: number
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
      window.location.href = '/login'
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
    const response = await apiClient.post<any, ApiResponse<User>>('/api/users', userData)
    if (!response.data) {
      throw new Error('Failed to register user')
    }
    return response.data
  } catch (error) {
    console.error('Error registering user:', error)
    throw error
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<any, ApiResponse<LoginResponse>>('/api/auth/login', {
      email,
      password,
    })
    if (!response.data) {
      throw new Error('Login failed')
    }

    // Store token and user
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }

    return response.data
  } catch (error) {
    console.error('Error logging in:', error)
    throw error
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

export async function updateUser(id: string, userData: Partial<User>): Promise<string> {
  try {
    const response = await apiClient.put<any, ApiResponse<User>>(`/api/users/${id}`, userData)
    if (response.data && response.data._id) {
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.message || 'User updated successfully'
  } catch (error) {
    console.error('Error updating user:', error)
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

export async function hasUserRatedProduct(productId: string, userId: string): Promise<boolean> {
  try {
    const ratings = await getRatingsByProduct(productId)
    return ratings.some((rating) => rating.user_id === userId)
  } catch (error) {
    console.error('Error checking rating:', error)
    return false
  }
}

export default apiClient
