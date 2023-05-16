import {createApp} from 'vue';
import './style.less';
import App from './Products.vue';
import axios, {type AxiosResponse} from "axios";

axios.get('/api/auth/').then((res: AxiosResponse<{ username: string, login_id: string, is_admin: boolean }>): void => {
    if (res.data.is_admin) {
        const app = createApp(App);
        app.mount('#app');
    } else {
        alert('閲覧権限がありません');
    }
});
