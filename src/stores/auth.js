// src/stores/auth.js
import { defineStore } from 'pinia'
import authService from '@/services/auth.service'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },

  actions: {
    setSession({ access, refresh, user }) {
      this.accessToken = access
      this.refreshToken = refresh
      if (user) this.user = user

      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      if (user) localStorage.setItem('user', JSON.stringify(user))
    },

    async login(credentials) {
      const data = await authService.login(credentials)
      this.setSession(data)
      return data
    },

    async logout() {
      try {
        if (this.refreshToken) await authService.logout(this.refreshToken)
      } finally {
        this.clearSession()
      }
    },

    clearSession() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    },
  },
})
