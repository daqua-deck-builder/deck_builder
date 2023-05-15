<script setup lang="ts">
import CardList from "./components/CardList.vue";
import UserInfo from "./components/UserInfo.vue";
import KeepList from "./components/KeepList.vue";

</script>

<template lang="pug">

#top-fixed
    UserInfo
#main-pain
    CardList
    #keep_list_wrapper
        KeepList

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

#keep_list_wrapper {
    position: fixed;
    right: 0;
    top: 60px;
    width: 490px;
    float: right;
}
</style>
