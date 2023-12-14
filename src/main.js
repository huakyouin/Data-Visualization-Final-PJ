import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import TheOverview from './components/TheOverview.vue'

const app = createApp(App)
    .component('TheOverview', TheOverview) // 全局注册 TheOverview 组件
    .use(router)
    .mount('#app')