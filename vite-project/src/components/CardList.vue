<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import type {CardDataClient, Format} from '../../../ex/types/card.js'
import {FORMAT} from "../../../ex/constants.js";
import axios, {type AxiosResponse} from "axios";
import CardDetail from "./CardDetail.vue";
import useGradientBg from "../composable/multi_color_gradient_bg";

const cards = ref<CardDataClient[]>([]);
const filter_word = ref('');

const card_type = ref<string>('');
const _format = ref<Format>(FORMAT.all);

const format = computed({
    get: () => {
        return _format.value;
    },
    set: (value: Format) => {
        localStorage.setItem('saved.format', '' + value);
        _format.value = value;
    }
})

const color = ref<string>('');

// @ts-ignore
const target = ref<CardData>({slug: '', skills: ''});

const _burst = ref<0 | 1 | 2>(0);
const burst = computed({
    get: () => {
        return !['シグニ', 'スペル', ''].includes(card_type.value) ? 0 : _burst.value;
    },
    set: (value: 0 | 1 | 2) => {
        _burst.value = value;
    }
})

const set_target = (cd: CardDataClient) => {
    target.value = cd;
};

onMounted(() => {
    const _f: number = parseInt(localStorage.getItem('saved.format'), 10);
    if (isNaN(_f)) {
        _format.value = FORMAT.all;
    } else {
        // @ts-ignore
        _format.value = Math.max(Math.min(_f, 3), 1);
    }

    axios.get('/generated/cards.json').then((res: AxiosResponse<{ cards: CardDataClient[] }>) => {
        cards.value = res.data.cards;
    });
});

const filter_single_shortcircuit = (c: CardDataClient): boolean => {
    const fw = filter_word.value;
    const color_matches: boolean = (c.color.indexOf(color.value) > -1);
    const word_matches: boolean = (c.name.indexOf(fw) > -1);
    const slug_matches: boolean = (c.slug.indexOf(fw) > -1);
    const pronounce_matches: boolean = (c.pronounce.indexOf(fw) > -1);
    const burst_matches: boolean = (() => {
        if (burst.value === 0) {
            return true;
        } else if (burst.value === 1) {
            return c.has_lb;
        } else {
            return !c.has_lb;
        }
    })();
    const card_type_matches: boolean = (() => {
        if (card_type.value === 'センター') {
            return c.card_type === 'ルリグ';
        } else {
            return (c.card_type.indexOf(card_type.value) > -1);
        }
    })();
    const format_matches: boolean = c.format >= format.value;

    // const deck_type_matches: boolean = (() => {
    //     if (deck_type.value === 1) {
    //         const is_main_deck_card: boolean = ['シグニ', 'スペル'].includes(c.card_type);
    //
    //         if (is_main_deck_card) {
    //             if (burst.value === 0) {
    //                 return true;
    //             } else if (burst.value === 1) {
    //                 return c.has_lb;
    //             } else {
    //                 return !c.has_lb;
    //             }
    //         } else {
    //             return false;
    //         }
    //     } else if (deck_type.value === 2) {
    //         return !['シグニ', 'スペル'].includes(c.card_type);
    //     } else {
    //         if (burst.value === 0) {
    //             return true;
    //         } else if (burst.value === 1) {
    //             return c.has_lb;
    //         } else {
    //             return !c.has_lb;
    //         }
    //     }
    // })();
    return color_matches
        && (word_matches || slug_matches || pronounce_matches)
        && burst_matches
        && card_type_matches
        && format_matches
        // || deck_type_matches
        ;
};

const filtered_cards = computed(() => {
    const fw = filter_word.value.trim().toUpperCase();
    const skip: boolean = (fw !== '')
        // && (deck_type.value !== 0)
        && (burst.value === 0)
        && (color.value === '')
    ;

    // if (skip) {
    //     return cards.value;
    // } else {
    return cards.value.filter(filter_single_shortcircuit);
    // }
});

const icon = computed(() => {
    return (c: CardDataClient): string => {
        if (c.has_lb) {
            return 'lb';
        } else if (c.team_piece) {
            return 'tp';
        } else {
            return '';
        }
    }
});

const {bg_gradient_style} = useGradientBg();
</script>

<template lang="pug">
.left_side(style="width: 781px;")
    .conditions
        select.format.filter_select(v-model.number="format")
            option(value="1") オールスター
            option(value="2") キー
            option(value="3") ディーヴァ
        select.card_type.filter_select(v-model="card_type")
            option(value="") カードタイプ
            option(value="シグニ") シグニ
            option(value="ルリグ") ルリグ
            option(value="センター") センタールリグ
            option(value="アシスト") アシストルリグ
            option(value="ピース") ピース
            option(value="キー") キー
            option(value="アーツ") アーツ
            option(value="レゾナ") レゾナ
            option(value="リレー") ピース（リレー）
            option(value="クラフト") レゾナ（クラフト）/アーツ（クラフト）
        select.burst_type.filter_select(v-model.number="burst")
            option(value="0") LB有無
            option(value="1") バーストあり
            option(value="2") バーストなし
        select.color_type.filter_select(v-model="color")
            option(value="") 色
            option(value="白") 白
            option(value="青") 青
            option(value="黒") 黒
            option(value="赤") 赤
            option(value="緑") 緑
            option(value="無") 無
            option(value=",") 多色
        input.filter_word(type="text" name="filter_word" v-model.lazy="filter_word")
        span.amount(v-text="`${filtered_cards.length} items`")
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
            tr.card(v-for="c in filtered_cards" :key="c.slug" :data-color="c.color" :style="bg_gradient_style(c.color)")
                td {{ c.slug }}
                td.card_name(@click="set_target(c)")
                    span(:data-icon="icon(c)" :data-rarity="c.rarity" v-html="c.name.replace(/（/, '<br />（')")
                td.center {{ c.color }}
                td.center {{ c.lrig }}
                td.center {{ c.level }}
                td.center(v-html=" c.klass.replace(/,/, '<br>') ")
                td.right
                    span(style="margin-right: 0.2rem;" v-text=" c.power.replace(/k/, '000')")
        tbody.not_found(v-if="filtered_cards.length === 0")
            tr
                td(colspan="7") 検索条件に合致するカードはありません。
.right_side.margin_left
    CardDetail(
        v-if="target.slug !== ''"
        :card="target"
        :is_owner="true"
    )
</template>

<style scoped lang="less">
@import "../composable/colored_table_row.less";

table {
    table-layout: fixed;
    border-collapse: collapse;
    background-color: white;
    color: black;
}

.card_name {
    cursor: pointer;

    &:hover {
        span {
            text-decoration: underline;
            //color: blue;
        }
    }

    span {
        &:before {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            position: relative;
            top: 2px;
            margin-left: 2px;
            margin-right: 4px;
        }

        &[data-icon] {
            &:before {
                content: '　';
            }
        }

        &[data-icon="lb"] {
            &:before {
                content: url('/lb.svg');
            }
        }

        &[data-icon="tp"] {
            &:before {
                content: url('/team_piece.svg');
            }
        }

    }

}

th, td {
    border: 1px solid black;
}

th {
    background-color: #232323;
    color: white;
}

tr {
    .colored_table_row();
}

.left_side, .right_side {
    float: left;
}

.left_side {
    width: 1000px;
}

.right_side {
    width: 500px;

    // ad hoc
    position: fixed;
    left: 820px;
}

.conditions {
    margin-bottom: 12px;
}

span.amount {
    display: inline-block;
    line-height: 1rem;
    font-size: 1rem;
    width: 100px;
}

select.filter_select, input[type="text"].filter_word {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin: 0 10px 0 0;
    padding: 0.5em 1em;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}

select.card_type {
    width: 8rem;
}

select {
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='none' stroke='black' stroke-linecap='round' d='M2 1L1 3h2zm0 0L3 3H1z'/></svg>");
    background-repeat: no-repeat;
    background-position: right 0.5em center;
    background-size: 0.65em auto;

    &.deck_type {
        padding-right: 2rem;
    }
}

span[data-rarity="SR"] {
    color: gold;
    pointer-events: none;
    text-shadow: 1px 1px 0 rgba(0, 0, 0, 1),
        -1px -1px 0 rgba(0, 0, 0, 1),
        1px -1px 0 rgba(0, 0, 0, 1),
    -1px 1px 0 rgba(0, 0, 0, 1);

    &:hover {
        color: black;
    }
}
</style>