<script setup lang="ts">
import UserInfo from "./components/UserInfo.vue";
</script>

<template lang="pug">

#top-fixed
    UserInfo
#main-pain
    router-view
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
    height: calc(100vh - 3rem);
    width: 100vw;
    overflow-y: auto;
    z-index: 1;
    margin-left: 10px;
    padding-top: 60px;
    position: fixed;
    top: 0;
}
</style>
