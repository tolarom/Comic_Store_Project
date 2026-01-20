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
import Analytics from '@/views/Admin/Analytics.vue'
import AdminDashboard from '@/views/Admin/Dashboard.vue'
import ECommerce from '@/views/Admin/E-Commerce.vue'
import Admin_profile from '@/views/Admin/Admin_profile.vue'
import Setting from '@/views/Admin/Setting.vue'
import UserControl from '@/views/Admin/UserControl.vue'
import OrderHistory from '@/views/Admin/OrderHistory.vue'

const routes = [
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

  // Home and main routes
  {
    path: '/',
    name: 'Homeview',
    component: Homeview,
  },
  {
    path: '/client/shop',
    name: 'Shop',
    component: Homeview,
  },
// Protected client routes (require authentication)

  // Product routes
  {
    path: '/client/products',
    name: 'ProductPage',
    component: ProductPage,
    meta: { title: 'Shop' },
  },
  {
    path: '/client/products/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    meta: { title: 'Product Details' },
  },

  
  {
    path: '/client/cart',
    name: 'ShopCart',
    component: ShopCart,
    meta: { title: 'Shopping Cart' },
  },
  {
    path: '/client/checkout',
    name: 'CheckOut',
    component: Checkout,
    meta: { title: 'Checkout' },
  },
  {
    path: '/client/profile',
    name: 'Profile',
    component: Profile,
    meta: { title: 'My Profile' },
  },
  {
    path: '/client/rating',
    name: 'Rating',
    component: RatingPage,
    meta: { title: 'Leave a Rating' },
  },
  {
    path: '/client/settings',
    name: 'ClientSettings',
    component: ClientSettings,
    meta: { title: 'Account Settings' },
  },
  {
    path: '/client/orders',
    name: 'PurchaseHistory',
    component: PurchaseHistory,
    meta: { title: 'Purchase History' },
  },

  // Admin routes
  {
    path: '/admin',
    redirect: '/admin/dashboard',
  },
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: AdminDashboard,
  },
  {
    path: '/admin/analytics',
    name: 'Analytics',
    component: Analytics,
  },
  {
    path: '/admin/e-commerce',
    name: 'ECommerce',
    component: ECommerce,
  },
  {
    path: '/admin/profile',
    name: 'AdminProfile',
    component: Admin_profile,
  },
  {
    path: '/admin/setting',
    name: 'Setting',
    component: Setting,
  },
  {
    path: '/admin/users',
    name: 'UserControl',
    component: UserControl,
  },
  {
    path: '/admin/orders',
    name: 'OrderHistory',
    component: OrderHistory,
  },

  // Catch-all route for 404 - MUST BE LAST
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
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

// Route guard for authentication and logging
router.beforeEach((to, from, next) => {
  // Update document title
  const title = to.meta.title ? `${to.meta.title} - Comic Store` : 'Comic Store'
  document.title = title

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('authToken')

  // Redirect to login if trying to access protected routes without auth
  if (
    to.meta.requiresAuth !== false &&
    !isAuthenticated &&
    to.path !== '/' &&
    to.path !== '/client/shop'
  ) {
    // Allow public routes
    if (to.path !== '/loginPage' && to.path !== '/signUpPage') {
      return next('/loginPage')
    }
  }

  // Redirect already logged in users away from login/signup pages
  if (isAuthenticated && (to.path === '/loginPage' || to.path === '/signUpPage')) {
    return next('/')
  }

  next()
})

// Log navigation for debugging
router.afterEach((to) => {
  console.log(`Navigated to: ${to.path}`)
})

export default router
