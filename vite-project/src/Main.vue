<template lang="pug">
CardList(@set-target="set_target")
FloatingWindow(id="keep" title="キープリスト")
    KeepList
FloatingWindow(id="detail" title="カード詳細")
    Suspense
        template(#default)
            CardDetail(
                v-if="card_store.target !== ''"
                :slug="card_store.target"
                :single="true"
                @set-target="set_target2"
            )
            div(v-else style="width: 100px; height: 20px;")
        template(#fallback)
            div(style="width: 100px; height: 20px;")
DragLayer
</template>

<script setup lang="ts">
import CardList from "./components/CardList.vue";
import KeepList from "./components/KeepList.vue";
import FloatingWindow from "./components/FloatingWindow.vue";
import DragLayer from "./components/DragLayer.vue";
import CardDetail from "./components/CardDetail.vue";
import {useCardStore} from "./stores/cards";
import useDetectCard from "./composable/detect_card";

const card_store = useCardStore();

const set_target = (slug: string): void => {
    card_store.target = slug;
};

const {by_local_index} = useDetectCard();

const set_target2 = (delta: 1 | -1): void => {
    by_local_index(delta);
};
</script>

<style scoped lang="less">
</style>