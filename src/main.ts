import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
// createApp(App).mount('#app')

app.use(router)

app.mount('#app')
