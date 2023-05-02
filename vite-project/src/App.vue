<script setup lang="ts">

import axios, {type AxiosResponse} from "axios";
import {ref, type Ref} from "vue";
import {onMounted} from "vue";

const message: Ref<string> = ref('');


onMounted(() => {
    axios.get('/api').then((res: AxiosResponse<{ hello: string }>) => {
        console.log(res.data);
        message.value = res.data.hello;
    });
});

</script>

<template lang="pug">
HelloWorld(:msg="message")
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
