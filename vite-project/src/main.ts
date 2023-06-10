import {createApp} from 'vue';
import './style.less';
import './card_list.less';
import App from './App.vue';
import {createPinia, Pinia} from "pinia";
import {useCardStore} from "./stores/cards";
import {useWindowStore} from "./stores/window";

const pinia: Pinia = createPinia();

// Web Workerの作成と起動
const worker: Worker = new Worker(new URL('/worker.ts', import.meta.url), {type: 'module'})

const app = createApp(App);
app.use(pinia);
import("./router").then(({router}) => {
    app.provide('worker', worker);
    const card_store = useCardStore();
    card_store.worker = worker;

    const window_store = useWindowStore();
    window_store.initialize();

    app.use(router);

    app.mount('#app');
})
