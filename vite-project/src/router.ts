import {createRouter, createWebHistory} from "vue-router";

import Main from "./Main.vue";
import Admin from "./Admin.vue";

const routes = [
    {path: '/', component: Main},
    {path: '/admin', component: Admin},
]

const router = createRouter({
    routes,
    history: createWebHistory()
});

export {router}
