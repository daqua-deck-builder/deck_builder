import {createRouter, createWebHistory} from "vue-router";
import {useCardStore} from "./stores/cards";

import Main from "./Main.vue";
import Admin from "./Admin.vue";
import CardDetail from "./components/CardDetail.vue";

const card_store = useCardStore();

const routes = [
    {path: '/', component: Main},
    {
        path: '/card/:slug',
        component: CardDetail,
        props: route => {
            card_store.target = route.params.slug;
            return {slug: route.params.slug};
        }
    },
    {path: '/admin/eps/:slug', component: Admin, props: true},
];

const router = createRouter({
    routes,
    history: createWebHistory()
});

export {router}
