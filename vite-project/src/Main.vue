<template lang="pug">
CardList(@set-target="set_target")
FloatingWindow(id="keep" title="キープリスト")
    KeepList
FloatingWindow(id="detail" title="カード詳細")
    Suspense
        template(#default)
            CardDetail(
                v-if="target !== ''"
                :slug="target"
                @set-target="set_target2"
            )
            div(v-else style="width: 100px; height: 20px;")
        template(#fallback)
            div(style="width: 100px; height: 20px;")
DragLayer
</template>

<script setup lang="ts">
import {ref} from "vue";
import CardList from "./components/CardList.vue";
import KeepList from "./components/KeepList.vue";
import FloatingWindow from "./components/FloatingWindow.vue";
import DragLayer from "./components/DragLayer.vue";
import CardDetail from "./components/CardDetail.vue";
import {useCardStore} from "./stores/cards";
import type {CardDataClient} from '../../ex/types/card.js'

const card_store = useCardStore();

const target = ref('');
const set_target = (slug: string): void => {
    target.value = slug;
};

const set_target2 = (slug: string): void => {
    card_store.detail_by_slug(slug).then((card: CardDataClient) => {
        target.value = card.slug;
    });
};
</script>

<style scoped lang="less">
</style>