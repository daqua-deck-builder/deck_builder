<script setup lang="ts">
import CardList from "./components/CardList.vue";
import UserInfo from "./components/UserInfo.vue";

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
