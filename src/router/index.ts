import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '@/components/client/HomePage.vue'
import LoginPage from '@/components/client/LogIn-Page.vue'
import SignUpPage from '@/components/client/SignUp-Page.vue'

const routes = [
  { path: '/',
   name: 'Home',
   component: HomePage },
  { path: '/LoginPage',
   name: 'LoginPage',
   component: LoginPage },
  { path: '/SignUp',
   name: 'SignUp',
   component: SignUpPage },
  { path: '/:pathMatch(.*)*',
    redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
