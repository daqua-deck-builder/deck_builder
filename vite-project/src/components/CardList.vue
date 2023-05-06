<script setup lang="ts">
import {onMounted, ref} from "vue";
import type {CardData} from '../../../ex/types/card.js'
import axios, {type AxiosResponse} from "axios";

const cards = ref<CardData[]>([]);

onMounted(() => {
    axios.get('/g/cards.json').then((res: AxiosResponse<{ cards: CardData[] }>) => {
        cards.value = res.data.cards;
    });
});
</script>

<template lang="pug">
span.amount(v-text="`${cards.length} items`")
table
    colgroup
        col(style="width: 140px;")
        col(style="width: 240px;")
        col(style="width: 60px;")
        col(style="width: 100px;")
        col(style="width: 60px;")
        col(style="width: 120px;")
        col(style="width: 60px;")

    thead
        tr
            th No.
            th 名前
            th 色
            th ルリグ
            th レベル
            th 種族
            th パワー
    tbody
        tr(v-for="c in cards" :key="c.slug" :data-color="c.color")
            td {{ c.slug }}
            td {{ c.name }}
            td {{ c.color }}
            td {{ c.lrig }}
            td {{ c.level }}
            td {{ c.klass }}
            td {{ c.power }}
</template>

<style scoped lang="less">
table {
    table-layout: fixed;
    border-collapse: collapse;
    background-color: white;
    color: black;
}

th, td {
    border: 1px solid black;
}

th {
    background-color: #232323;
    color: white;
}

tr {
    &[data-color="白"] {
        background-color: #fff1b4;
    }

    &[data-color="青"] {
        background-color: #ffb4b4;
    }

    &[data-color="黒"] {
        background-color: #9263f9;
    }

    &[data-color="赤"] {
        background-color: #ffb4b4;
    }

    &[data-color="緑"] {
        background-color: #ccffb4;
    }

    &[data-color="無"] {
        background-color: #cfcfcf;
    }
}
</style>