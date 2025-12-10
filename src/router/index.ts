import { createRouter, createWebHistory } from 'vue-router'

import footer from '@/components/client/FooterPage.vue'
import navigationBar from '@/components/client/NavigationBar.vue'
import LoginPage from '@/views/Client/LogIn-Page.vue'
import SignUpPage from '@/views/Client/SignUp-Page.vue'
import ProductCard from '@/components/client/product-card.vue'
import ShopCard from '@/views/Client/ShopCard.vue'
import Checkout from '@/views/Client/Checkout.vue'
import Profile from '@/views/Client/profileview.vue'

const routes = [
  { 
    path: '/',
    name: 'Home',
    component: '' 
  },
  { 
    path: '/loginPage',
    name: 'LoginPage',
    component: LoginPage 
  },
  { path: '/signUpPage',
    name: 'SignUpPage',
    component: SignUpPage 
  },
  { 
    path: '/:pathMatch(.*)*',
    redirect: '/' 
  },
  {
    name: 'Footer',
    path: '/footer',
    component: footer
  },
  {
    name: 'NavigationBar',
    path: '/navigationbar',
    component: navigationBar
  },
  {
    name: 'ProductCard',
    path: '/productCard',
    component: ProductCard
    },
  {
    name: 'ShopCard',
    path: '/shopcard',
    component: ShopCard

   },
   {
    name: 'CheckOut',
    path: '/checkout',
    component: Checkout
   },
   {
    name: 'Profile',
    path: '/profile',
    component: Profile
   },
   

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
