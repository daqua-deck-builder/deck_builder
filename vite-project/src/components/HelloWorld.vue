<script setup lang="ts">
import {ref} from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template lang="pug">
h1 {{ msg }}
.card
    button(type="button" @click="count++") count is {{ count }}
    p
        span Check out
        a(href="https://vuejs.org/guide/quick-start.html#local" target="_blank") create-vue
        span , the official Vue + Vite starter
    p
        span Install
        a(href="https://github.com/vuejs/language-tools" target="_blank") Volar
        span in your IDE for a better DX
    p.read-the-docs Click on the Vite and Vue logos to learn more
</template>

<style scoped>
.read-the-docs {
    color: #888;
}
</style>
