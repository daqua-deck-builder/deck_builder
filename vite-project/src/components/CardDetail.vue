<script setup lang="ts">
import type {CardDataClient} from '../../../ex/types/card.js';
import {computed, ref} from "vue";
import useGradientBg from "../composable/multi_color_gradient_bg";
import SkillBox from "./SkillBox.vue";
import {useAuthStore} from "../stores/auth";

const auth_store = useAuthStore();

const props = defineProps<{
    card: {
        slug: string;
        name: string;
        pronounce: string;
        img: string;
        card_type: string;
        skills: string;
        color: string;
        coin: string;
        type: CardDataClient, required: true
    }
}>();

const img_path = computed(() => {
    try {
        return `/image/${props.card.img.replace(/@/, props.card.slug)}`;
    } catch {
        return '';
    }
});

const skills = computed(() => {
    return props.card.skills.split('@@').filter((text: string) => {
        return !!text
    });
});

const {bg_gradient_style} = useGradientBg();

const show_name = ref<boolean>(true);
const label = computed(() => {
    return show_name.value ? props.card.name : props.card.pronounce;
});

const open_admin = (slug: string) => {
    if (auth_store.is_admin) {
        window.open(`/admin/?slug=${slug}`, '_blank');
    }
}

</script>

<template lang="pug">
table.card_detail(style="width: 502px;")
    colgroup
        col(style="width: 250px;")
        col(style="width: 250px;")
    tr.card_name(:style="bg_gradient_style(props.card.color)" :data-color="props.card.color")
        td.no_right_border.center(@click="open_admin(props.card.slug)") {{ props.card.slug }}
        td.no_left_border.label.center(@click="show_name = !show_name") {{ label }}
    tr(v-if="auth_store.is_admin")
        td.center.image_wrapper(colspan="2")
            img.illustration(:data-type="props.card.card_type" :src="img_path")
    tr.coin(v-if="props.card.coin")
        th コイン
        td {{ props.card.coin }}
    tbody
        tr(v-if="skills.length > 0")
            td(colspan="2")
                skill-box(v-for="skill in skills" :skill="skill")
        tr(v-else)
            td(colspan="2")
                .skill (効果を持っていません)
</template>

<style scoped lang="less">
@import "../composable/colored_table_row.less";

table.card_detail {
    table-layout: fixed;
    border-collapse: collapse;
}

th, td {
    padding: 3px;
    background-color: white;
    color: black;
    border: 1px solid #494949;
}

tr {
    .colored_table_row();
}

tr.card_name td {
    background-color: transparent;

    &.no_right_border {
        border-right-width: 0;
    }

    &.no_left_border {
        border-left-width: 0;
    }

    &.label {
        text-decoration: underline;
        cursor: pointer;
    }
}

tr.coin {
    background-color: orange;

    th, td {
        background-color: transparent;
    }
}

td.image_wrapper {
    background-color: #ccb6b6;
    padding: 10px;
}

img.illustration {
    outline: 2px solid black;
    width: 360px;

    &[data-type="ルリグ"], &[data-type="アーツ"], &[data-type="レゾナ"], &[data-type="レゾナ（クラフト）"], &[data-type="アーツ（クラフト）"] {
        outline-color: white;
    }

    &[data-type*="ピース"], &[data-type="キー"] {
        outline: 2px solid white;
        width: 480px;
    }
}

</style>