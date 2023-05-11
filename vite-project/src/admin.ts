import { createApp } from 'vue'
import './style.css'
import App from './Admin.vue'
import axios, {AxiosResponse} from "axios";
            // /api/admin/card_detail/WXDi-P00-036
axios.get('/api/admin/card_detail/WXDi-P00-036').then((res: AxiosResponse<{card: CardDataClient}>) => {
    console.log(res.data.card);

    createApp(App).mount('#app')
});

