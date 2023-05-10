import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
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
