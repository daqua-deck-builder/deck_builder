import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                admin: path.resolve(__dirname, 'admin.html'),
                products: path.resolve(__dirname, 'products.html')
            }
        }
    },
    server: {
        host: '192.168.33.10',
        port: 3001,

        proxy: {
            '/api': {
                target: 'http://192.168.33.10:3000',
                changeOrigin: true,
            },
            '/generated': { // generated file
                target: 'http://192.168.33.10:3000',
                changeOrigin: true,
            },
            '/image': { // image proxy
                target: 'http://192.168.33.10:3000',
                changeOrigin: true,
            },
        }
    }
})
