import {createApp, provide} from 'vue';
import './style.less';
import App from './App.vue';
import {createPinia} from "pinia";
import {useCardStore} from "./stores/cards";

const pinia = createPinia();

// Web Workerの作成と起動
const worker = new Worker(new URL('/worker.js', import.meta.url), {type: 'module'})


const app = createApp(App);

app.provide('worker', worker);

app.use(pinia);
const card_store = useCardStore();
card_store.worker = worker;

app.mount('#app');
