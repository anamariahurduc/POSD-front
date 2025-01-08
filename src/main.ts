import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import {createPinia} from "pinia";

const app = createApp(App)
const pinia = createPinia();
// createApp(App).mount('#app')

app.use(router)
app.use(pinia);


app.mount('#app')
