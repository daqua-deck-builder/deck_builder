<script setup lang="ts">

import axios, {type AxiosResponse} from "axios";
import {ref, type Ref} from "vue";
import {onMounted} from "vue";
import CardList from "./components/CardList.vue";
import UserInfo from "./components/UserInfo.vue";

const message: Ref<string> = ref('');

onMounted(() => {
    axios.get('/api').then((res: AxiosResponse<{ hello: string }>) => {
        console.log(res.data);
        message.value = res.data.hello;
    });
});

</script>

<template lang="pug">

#top-fixed
    UserInfo
#main-pain
    CardList

</template>

<style scoped>
#top-fixed {
    z-index: 2;
    position: fixed;
    top: 0;
    width: 100vw;
    height: 3rem;
}

#main-pain {
    z-index: 1;
    margin-left: 10px;
    padding-top: 60px;
    position: fixed;
    top: 0;

    width: 99vw;
    max-height: 99vh;
    overflow-y: auto;
}
</style>
