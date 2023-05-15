<script setup lang="ts">
import {useKeepStore} from "../stores/keep";
import {computed} from "vue";
import useGradientBg from "../composable/multi_color_gradient_bg";

const keep_store = useKeepStore();

const increase = (slug: string, group: 'main_lb' | 'main_no_lb' | 'white' | 'others', delta: 1 | -1): void => {
    keep_store.increase(slug, group, delta);
};

const trim = () => {
    const do_trim = confirm('枚数が"×"になっているカードをリストから除去してもよろしいですか？');
    if (do_trim) {
        keep_store.trim();
    }
};

const amount = computed(() => {
    return (amount: number): string => {
        if (amount === -1) {
            return '×';
        } else if (amount === 0) {
            return '-';
        } else {
            return '' + amount;
        }
    }
});

const {bg_gradient_style} = useGradientBg();
</script>

<template lang="pug">
.title キープリスト
.actions
    a.button(href="#" @click.prevent="trim") トリム
table.keep_list
    colgroup
        col(style="width: 40px;")
        col(style="width: 300px;")
        col(style="width: 100px;")
    thead
        tr
            th 数
            th 名前
            th 操作
    tbody
        tr
            th(colspan="3") ルリグデッキ
        tr(v-if="keep_store" v-for="card of keep_store.white" :key="card.slug" :data-color="card.color" :style="bg_gradient_style(card.color)")
            td.right
                span.amount(v-text="amount(card.amount)")
            td
                span [白枠] {{ card.name }}
            td
                a.button.increase(href="#" @click.prevent="increase(card.pronounce, 'white', 1)") 増
                a.button.decrease(href="#" @click.prevent="increase(card.pronounce, 'white', -1)") 減

    tbody
        tr
            th(colspan="3") メインデッキ(LBあり)
        tr(v-if="keep_store" v-for="card of keep_store.main_lb" :key="card.slug" :data-color="card.color" :style="bg_gradient_style(card.color)")
            td.right
                span.amount(v-text="amount(card.amount)")
            td
                span [LB] {{ card.name }}
            td
                a.button.increase(href="#" @click.prevent="increase(card.pronounce, 'main_lb', 1)") 増
                a.button.decrease(href="#" @click.prevent="increase(card.pronounce, 'main_lb', -1)") 減


    tbody
        tr
            th(colspan="3") メインデッキ(LBなし)
        tr(v-if="keep_store" v-for="card of keep_store.main_no_lb" :key="card.slug" :data-color="card.color" :style="bg_gradient_style(card.color)")
            td.right
                span.amount(v-text="amount(card.amount)")
            td
                span {{ card.name }}
            td
                a.button.increase(href="#" @click.prevent="increase(card.pronounce, 'main_no_lb', 1)") 増
                a.button.decrease(href="#" @click.prevent="increase(card.pronounce, 'main_no_lb', -1)") 減

    tbody(v-if="keep_store.others.length > 0")
        tr
            th(colspan="3") その他
        tr(v-if="keep_store" v-for="card of keep_store.others" :key="card.slug" :data-color="card.color" :style="bg_gradient_style(card.color)")
            td.right
                span.amount(v-text="amount(card.amount)")
            td
                span [他] {{ card.name }}
            td
                a.button.increase(href="#" @click.prevent="increase(card.pronounce, 'others', 1)") 増
                a.button.decrease(href="#" @click.prevent="increase(card.pronounce, 'others', -1)") 減

</template>

<style scoped lang="less">
@import "../composable/colored_table_row.less";

.title {
    font-weight: bolder;
}

table {
    table-layout: fixed;
    border-collapse: collapse;
}

tr {
    color: black;
    .colored_table_row();
}

span.amount {
    margin-right: 0.3rem;
}

</style>