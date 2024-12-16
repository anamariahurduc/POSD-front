import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginPage.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterPage.vue')
    },
    {
      path:'/home',
      name:'home',
      component: () => import('../views/HomePage.vue')
    },
    {
      path:'/dashboard',
      name:'dashboard',
      component: () => import('../views/dashboard/ViewPatients.vue')
    },

  ]
})

export default router
