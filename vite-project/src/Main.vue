<template lang="pug">
CardList
FloatingWindow(id="keep" title="キープリスト")
    KeepList
FloatingWindow(id="detail" title="カード詳細")
    Suspense
        template(#default)
            //CardDetail(
            //    v-if="target !== ''"
            //    :slug="target"
            //)
            div(style="width: 100px; height: 20px;")
        template(#fallback)
            div(style="width: 100px; height: 20px;")
DragLayer
</template>

<script setup lang="ts">
import CardList from "./components/CardList.vue";
import KeepList from "./components/KeepList.vue";
import FloatingWindow from "./components/FloatingWindow.vue";
import DragLayer from "./components/DragLayer.vue";
</script>

<style scoped lang="less">
</style>