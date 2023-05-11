import {createApp} from 'vue'
import './style.css'
import App from './App.vue'

// Web Workerの作成と起動
const worker = new Worker(new URL('/worker.js', import.meta.url), {type: 'module'})

// Workerからメッセージを受け取る
worker.onmessage = (event) => {
    console.log('Message received from worker', event.data)
}

// Workerにメッセージを送信
worker.postMessage({type: 'hello', message: 'Hello, worker!'})

createApp(App).mount('#app')
