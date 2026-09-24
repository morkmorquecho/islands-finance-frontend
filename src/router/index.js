// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path:'/',
    name:'home',
    component:() => import('@/views/home/HomeView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/auth/email/verify',
    name: 'verify-email',
    component: () => import('@/views/auth/VerifyEmailView.vue'),
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/auth/ResetPasswordRequestView.vue'),
    meta: { guestOnly: true },
  },
{
  path: '/auth/reset/password/confirm/:uidb64/:token/',
  name: 'reset-password-confirm',
  component: () => import('@/views/auth/ResetPasswordConfirmView.vue'),
  meta: { guestOnly: true },
},

  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/expenses',
    name: 'expenses',
    component: () => import('@/views/ExpensesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
  {
    path: '/goals',
    name: 'goals',
    component: () => import('@/views/GoalsView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
