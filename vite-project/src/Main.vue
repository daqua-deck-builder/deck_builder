<template lang="pug">
CardList
#keep_list_wrapper
    KeepList
</template>

<script setup lang="ts">
import CardList from "./components/CardList.vue";
import KeepList from "./components/KeepList.vue";

</script>

<style scoped lang="less">

#keep_list_wrapper {
    position: fixed;
    right: 0;
    top: 60px;
    width: 985px;
    float: right;
}
</style>