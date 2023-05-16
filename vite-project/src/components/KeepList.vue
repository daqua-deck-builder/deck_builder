<script setup lang="ts">
import {useKeepStore, type KeptCard} from "../stores/keep";
import {computed} from "vue";
import useGradientBg from "../composable/multi_color_gradient_bg";

const keep_store = useKeepStore();

const increase = (pronounce: string, group: 'main_lb' | 'main_no_lb' | 'white' | 'others', delta: 1 | -1): void => {
    keep_store.increase(pronounce, group, delta);
};

const remove = (pronounce: string, group: 'main_lb' | 'main_no_lb' | 'white' | 'others'): void => {
    keep_store.remove(pronounce, group);
};

const trim = () => {
    const do_trim = confirm('枚数に応じてカードリストを整理してもよろしいですか？');
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

const total = computed(() => {
    return (cards: KeptCard[]): number => {
        return (cards || []).reduce((t: number, c: KeptCard) => {
            return Math.max(0, c.amount) + t;
        }, 0);
    };
});

const lrig_deck_over = computed((): 'over' | '' => {
    let lv0_amount = 0;
    const _total = (keep_store.white || []).reduce((t: number, c: KeptCard) => {
        if (c.level === '0') {
            lv0_amount = lv0_amount + 1;
        }
        return Math.max(0, c.amount) + t;
    }, 0);
    if (lv0_amount === 3) {
        return _total > 12 ? 'over' : '';
    } else {
        return _total > 10 ? 'over' : '';
    }
})

const {bg_gradient_style} = useGradientBg();
</script>

<template lang="pug">
.keep_list(v-if="keep_store")
    .title キープリスト
    .actions
        a.button(href="#" @click.prevent="trim") トリム
    .top
        table.keep_list
            colgroup
                col(style="width: 40px;")
                col(style="width: 300px;")
                col(style="width: 100px;")
            tbody
                tr
                    th.center
                        span.amount(:data-over="total(keep_store.main_lb) > 20 ? 'over': ''" v-text="total(keep_store.main_lb)")
                    th(colspan="2") メインデッキ(LBあり)
                tr(v-if="keep_store" v-for="card of keep_store.main_lb" :key="card.slug" :data-color="card.color" :style="bg_gradient_style(card.color)")
                    td.right
                        span.amount(v-text="amount(card.amount)")
                    td
                        span [LB] {{ card.name }}
                    td.center
                        a.button.increase(href="#" @click.prevent="increase(card.pronounce, 'main_lb', 1)")
                        a.button.decrease(href="#" @click.prevent="increase(card.pronounce, 'main_lb', -1)")
                        a.button.remove(href="#" @click.prevent="remove(card.pronounce, 'main_lb')")
        table.keep_list
            colgroup
                col(style="width: 40px;")
                col(style="width: 300px;")
                col(style="width: 100px;")
            tbody
                tr
                    th.center
                        span.amount(v-text="total(keep_store.main_no_lb)")
                    th(colspan="2") メインデッキ(LBなし)
                tr(v-if="keep_store" v-for="card of keep_store.main_no_lb" :key="card.slug" :data-color="card.color" :style="bg_gradient_style(card.color)")
                    td.right
                        span.amount(v-text="amount(card.amount)")
                    td
                        span {{ card.name }}
                    td.center
                        a.button.increase(href="#" @click.prevent="increase(card.pronounce, 'main_no_lb', 1)")
                        a.button.decrease(href="#" @click.prevent="increase(card.pronounce, 'main_no_lb', -1)")
                        a.button.remove(href="#" @click.prevent="remove(card.pronounce, 'main_no_lb')")
        br.clearfix
    .bottom
        table.keep_list
            colgroup
                col(style="width: 40px;")
                col(style="width: 300px;")
                col(style="width: 100px;")
            tbody
                tr
                    th.center
                        span.amount(:data-over="lrig_deck_over" v-text="total(keep_store.white)")
                    th(colspan="2") ルリグデッキ
                tr(v-if="keep_store" v-for="card of keep_store.white" :key="card.slug" :data-color="card.color" :style="bg_gradient_style(card.color)")
                    td.right
                        span.amount(v-text="amount(card.amount)")
                    td
                        span [白枠] {{ card.name }}
                    td.center
                        a.button.increase(href="#" @click.prevent="increase(card.pronounce, 'white', 1)")
                        a.button.decrease(href="#" @click.prevent="increase(card.pronounce, 'white', -1)")
                        a.button.remove(href="#" @click.prevent="remove(card.pronounce, 'white')")
        table.keep_list
            colgroup
                col(style="width: 40px;")
                col(style="width: 300px;")
                col(style="width: 100px;")
            tbody(v-if="keep_store.others.length > 0")
                tr
                    th(colspan="3") その他
                tr(v-if="keep_store" v-for="card of keep_store.others" :key="card.slug" :data-color="card.color" :style="bg_gradient_style(card.color)")
                    td.right
                        span.amount(v-text="amount(card.amount)")
                    td
                        span [他] {{ card.name }}
                    td.center
                        a.button.increase(href="#" @click.prevent="increase(card.pronounce, 'others', 1)")
                        a.button.decrease(href="#" @click.prevent="increase(card.pronounce, 'others', -1)")
                        a.button.remove(href="#" @click.prevent="remove(card.pronounce, 'others')")
        br.clearfix
</template>

<style scoped lang="less">
@import "../composable/colored_table_row.less";

.keep_list {
    //zoom: 0.7;
    width: 985px;
    background-color: white;
    border: 1px solid black;
    border-radius: 5px;
    padding: 5px;

    table {
        width: 488px;
        float: left;
    }
}

.top {
    margin-bottom: 5px;
    min-height: 30px;
}

.actions {
    margin-bottom: 4px;
}

.title {
    font-weight: bolder;
}

table {
    table-layout: fixed;
    border-collapse: collapse;
    &:first-child {
        margin-right: 4px;
    }
}

tr {
    color: black;
    .colored_table_row();
}

span.amount {
    margin-right: 0.3rem;

    &[data-over="over"] {
        color: #ff4949;
    }
}

a.button {
    min-width: 24px;
    text-align: center;
    display: inline-block;
    border: 1px solid grey;
    border-radius: 4px;
    background-color: white;
    margin-right: 2px;
    &:last-child {
        margin-right: 0;
    }

    &:active {
        position: relative;
        top: 1px;
    }

    &:before {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        position: relative;
        top: 2px;
    }
    &.increase {
        &:hover {
            background-color: #d6ffd6;
        }
        &:before {
            content: url('/plus.svg');
        }
    }
    &.decrease {
        &:hover {
            background-color: pink;
        }
        &:before {
            content: url('/minus.svg');
        }
    }
    &.remove {
        &:hover {
            background-color: #6d6d6d;
        }
        &:before {
            content: url('/remove.svg');
        }
    }

}

</style>