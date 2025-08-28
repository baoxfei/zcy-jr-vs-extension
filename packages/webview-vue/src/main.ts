import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './routes'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'


window.__APP_CONFIG__ = {
  ENV: typeof acquireVsCodeApi === 'function' ? 'vscode' : 'web',
  RUNNING_IN_VSCODE: typeof acquireVsCodeApi === 'function',
}

const pinia = createPinia()

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(ElementPlus)

app.mount('#app')