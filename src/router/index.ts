import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '@/views/Auth/LogIn-Page.vue'
import SignUpPage from '@/views/Auth/SignUp-Page.vue'
import ShopCart from '@/views/Client/ShopCart-Page.vue'
import Checkout from '@/views/Client/Checkout-Page.vue'
import Profile from '@/views/Client/profileview-Page.vue'
import Homeview from '@/views/Client/Homeview-Page.vue'
import ProductPage from '@/views/Client/product-page.vue'
import ProductDetail from '@/views/Client/Product-detail.vue'
import RatingPage from '@/views/Client/Rating-Page.vue'
import ClientSettings from '@/views/Client/Settings-Page.vue'
import PurchaseHistory from '@/views/Client/PurchaseHistory.vue'
import AdminDashboard from '@/views/Admin/Dashboard.vue'
import ECommerce from '@/views/Admin/E-Commerce.vue'
import Admin_profile from '@/views/Admin/Admin_profile.vue'
import Setting from '@/views/Admin/Setting.vue'
import UserControl from '@/views/Admin/UserControl.vue'
import OrderHistory from '@/views/Admin/OrderHistory.vue'

const routes = [
  // Root - redirect to login or home based on auth
  {
    path: '/',
    redirect: '/client/shop',
  },

  // Authentication routes (public)
  {
    path: '/loginPage',
    name: 'LoginPage',
    component: LoginPage,
    meta: { requiresAuth: false, title: 'Login' },
  },
  {
    path: '/signUpPage',
    name: 'SignUpPage',
    component: SignUpPage,
    meta: { requiresAuth: false, title: 'Sign Up' },
  },

  // Client routes
  {
    path: '/client/shop',
    name: 'Homeview',
    component: Homeview,
    meta: { requiresAuth: true, title: 'Home' },
  },

  // Product routes
  {
    path: '/client/products',
    name: 'ProductPage',
    component: ProductPage,
    meta: { requiresAuth: true, title: 'Shop' },
  },
  {
    path: '/client/products/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    meta: { requiresAuth: true, title: 'Product Details' },
  },

  {
    path: '/client/cart',
    name: 'ShopCart',
    component: ShopCart,
    meta: { requiresAuth: true, title: 'Shopping Cart' },
  },
  {
    path: '/client/checkout',
    name: 'CheckOut',
    component: Checkout,
    meta: { requiresAuth: true, title: 'Checkout' },
  },
  {
    path: '/client/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true, title: 'My Profile' },
  },
  {
    path: '/client/rating',
    name: 'Rating',
    component: RatingPage,
    meta: { requiresAuth: true, title: 'Leave a Rating' },
  },
  {
    path: '/client/settings',
    name: 'ClientSettings',
    component: ClientSettings,
    meta: { requiresAuth: true, title: 'Account Settings' },
  },
  {
    path: '/client/orders',
    name: 'PurchaseHistory',
    component: PurchaseHistory,
    meta: { requiresAuth: true, title: 'Purchase History' },
  },

  // Admin routes
  {
    path: '/admin',
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/e-commerce',
    name: 'ECommerce',
    component: ECommerce,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/profile',
    name: 'AdminProfile',
    component: Admin_profile,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/setting',
    name: 'Setting',
    component: Setting,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/users',
    name: 'UserControl',
    component: UserControl,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/orders',
    name: 'OrderHistory',
    component: OrderHistory,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  // Catch-all route for 404 - MUST BE LAST
  {
    path: '/:pathMatch(.*)*',
    redirect: '/client/shop',
    meta: { title: 'Not Found' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Route guard for authentication and authorization
router.beforeEach((to, from, next) => {
  const title = to.meta.title ? `${to.meta.title} - Comic Store` : 'Comic Store'
  document.title = title
  next()
})

// Log navigation for debugging
router.afterEach((to) => {
  console.log(`Navigated to: ${to.path}`)
})

export default router
