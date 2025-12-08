import { createRouter, createWebHistory } from 'vue-router'

import footer from '@/components/client/FooterPage.vue'
import navigationBar from '@/components/client/NavigationBar.vue'
import LoginPage from '@/views/authorize/LogIn-Page.vue'
import SignUpPage from '@/views/authorize/SignUp-Page.vue'

const routes = [
  { 
    path: '/',
    name: 'Home',
    component: '' 
  },
  { 
    path: '/LoginPage',
    name: 'LoginPage',
    component: LoginPage 
  },
  { path: '/SignUpPage',
    name: 'SignUpPage',
    component: SignUpPage 
  },
  { 
    path: '/:pathMatch(.*)*',
    redirect: '/' 
  },
  {
    name: 'Footer',
    path: '/Footer',
    component: footer
  },
  {
    name: 'NavigationBar',
    path: '/NavigationBar',
    component: navigationBar
  },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
