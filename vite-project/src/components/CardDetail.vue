<script setup lang="ts">
import type {CardDataClient} from '../../../ex/types/card.js';
import {computed} from "vue";
import useGradientBg from "../composable/multi_color_gradient_bg";

const props = defineProps<{
    card: {
        slug: string;
        img: string;
        card_type: string;
        skills: string,
        color: string
        type: CardDataClient, required: true
    },
    is_owner: boolean
}>();

const img_path = computed(() => {
    try {
        return `/c/${props.card.img.replace(/@/, props.card.slug)}`;
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

</script>

<template lang="pug">
table.card_detail(style="width: 502px;")
    colgroup
        col(style="width: 250px;")
        col(style="width: 250px;")
    tr.card_name(:style="bg_gradient_style(props.card)" :data-color="props.card.color")
        td.no_right_border {{ props.card.slug }}
        td.no_left_border {{ props.card.name }}
    tr(v-if="is_owner")
        td.image_wrapper(colspan="2")
            img.illustration(:data-type="props.card.card_type" :src="img_path")
    tr(v-if="skills.length > 0")
        td(colspan="2")
            .skill(v-for="skill in skills" v-text="skill")
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

    &[data-type="ピース"], &[data-type="キー"] {
        outline: 2px solid white;
        width: 480px;
    }
}

.skill {
    text-align: left;
    margin-bottom: 5px;
    line-height: 1.5rem;
    background-color: #d5d5d5;
    border-radius: 10px;
    padding: 10px;

    &:last-child {
        margin-bottom: 0;
    }
}
</style>