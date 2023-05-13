import {createApp, provide} from 'vue'
import './style.less'
import App from './App.vue'

// Web Workerの作成と起動
const worker = new Worker(new URL('/worker.js', import.meta.url), {type: 'module'})

const app = createApp(App);
app.provide('worker', worker);
app.mount('#app');
