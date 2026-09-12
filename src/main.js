import { createApp } from 'vue'
import { createPinia } from 'pinia'
import "./style.css";
import "@/styles/form.css";

import App from './App.vue'
import router from './router'
import { setupInterceptors } from '@/services/api'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// IMPORTANTE: registrar los interceptors antes de montar la app,
// para que estén activos antes de que cualquier componente (ej. onMounted
// en IslandFinance.vue) dispare su primera petición.
setupInterceptors(pinia)

app.mount('#app')