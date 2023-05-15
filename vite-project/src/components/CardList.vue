<script setup lang="ts">
import {computed, ref, inject} from "vue";
import type {CardDataClient, Format} from '../../../ex/types/card.js'
import {FORMAT} from "../../../ex/constants.js";
import axios, {type AxiosResponse} from "axios";
import CardDetail from "./CardDetail.vue";
import useGradientBg from "../composable/multi_color_gradient_bg";
import {useCardStore} from "../stores/cards";
import {useKeepStore} from "../stores/keep";

const card_store = useCardStore();
const keep_store = useKeepStore();
let worker = <Worker>inject('worker');

const filter_word = computed({
    get: () => {
        return card_store.filter_word;
    },
    set: (value: string) => {
        card_store.set_filter_word(value);
    },
})

const card_type = computed({
    get: () => {
        return card_store.card_type;
    },
    set: (value: string) => {
        card_store.set_card_type(value);
    }
})

const format = computed({
    get: () => {
        return card_store.format;
    },
    set: (value: Format) => {
        localStorage.setItem('saved.format', '' + value);
        card_store.set_format(value);
    }
});

const color = computed({
    get: () => {
        return card_store.color;
    },
    set: (value: string) => {
        card_store.set_color(value);
    },
})

// @ts-ignore
const target = ref<CardData>({slug: '', skills: ''});

const burst = computed({
    get: () => {
        return card_store.has_lb;
        // return !['シグニ', 'スペル', ''].includes(card_type.value) ? 0 : card_store.has_lb;
    },
    set: (value: 0 | 1 | 2) => {
        card_store.set_has_lb(value);
    }
});

const set_target = (cd: CardDataClient) => {
    if (keep_direct.value) {
        keep_store.append(cd);
    } else if (target.value.slug === cd.slug) {
        keep_store.append(cd);
    }
    target.value = cd;
};

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

const append_to_keep = (index: number): void => {
    keep_store.append(card_store.cards[index]);
};

card_store.install_worker(worker).then(() => {
    const _f: number = parseInt(localStorage.getItem('saved.format'), 10);

    let format = FORMAT.all;
    if (!isNaN(_f)) {
        // @ts-ignore
        format = Math.max(Math.min(_f, 3), 1)
    }

    axios.get('/generated/cards.json').then((res: AxiosResponse<{ cards: CardDataClient[] }>) => {
        card_store.initialize_cards(res.data.cards, format);
    });
});

const keep_direct = ref<boolean>(false);

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
            option(value="スペル") スペル
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
        span.amount(v-if="card_store.cards" v-text="`${card_store.cards.length} items`")
    .actions
        a.check(href="#" @click.prevent="keep_direct = !keep_direct" :data-keep-direct="keep_direct" alt="カード名を1クリックでカードをキープリストに投入する") ダイレクトキープ
    table
        colgroup
            col(style="width: 140px;")
            col(style="width: 240px;")
            col(style="width: 60px;")
            //col(style="width: 100px;")
            col(style="width: 60px;")
            col(style="width: 120px;")
            col(style="width: 60px;")
            col(style="width: 100px;")
        thead
            tr
                th No.
                th 名前
                th 色
                //th ルリグ
                th レベル
                th 種族
                th パワー
                th 操作
        tbody
            tr.card(v-for="(c, $index) in card_store.cards" :key="c.slug" :data-color="c.color" :style="bg_gradient_style(c.color)")
                td {{ c.slug }}
                td.card_name(@click="set_target(c)")
                    span.name
                        span(:data-story="c.story")
                        span(:data-icon="icon(c)" :data-rarity="c.rarity" v-html="c.name.replace(/（/, '<br />（')")
                td.center {{ c.color }}
                //td.center {{ c.lrig }}
                td.center {{ c.level }}
                td.center(v-html=" c.klass.replace(/,/, '<br>') ")
                td.right
                    span(style="margin-right: 0.2rem;" v-text=" c.power.replace(/k/, '000')")
                td.center(style="vertical-align: middle;")
                    button(@click="append_to_keep($index)") +
        tbody.not_found(v-if="card_store.cards.length === 0")
            tr
                td(colspan="7") 検索条件に合致するカードはありません。
.right_side.margin_left
    CardDetail(
        v-if="target.slug !== ''"
        :card="target"
    )
</template>

<style scoped lang="less">
@import "../composable/colored_table_row.less";

table {
    table-layout: fixed;
    //border-collapse: collapse;
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

        &.name {
            display: block;
            float: left;
            user-select: none;
            transition: transform 0.1s ease-in-out;

            &:active {
                transform: translateY(-2px);
            }
        }

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

        &[data-story="d"] {
            &:before {
                content: url('/dissona_black_wrapped.svg');
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

tr {

    &:hover {
        td.card_name {
            outline: 3px solid #000000;
            //outline: 3px solid #202dff;
        }
    }
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

span[data-rarity*="SR"] {
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

.actions {
    margin-bottom: 10px;
}

a.check {
    cursor: pointer;
    padding: 3px 10px 3px 5px;
    border-radius: 3px;
    text-decoration: none;

    &:before {
        display: inline-block;
        width: 1rem;
        font-size: 1rem;
        line-height: 1rem;
    }

    &[data-keep-direct="true"] {
        color: #0c7251;
        background-color: lightgreen;
        border: 1px solid green;
        &:before {
            content: '✓';
        }
    }

    &[data-keep-direct="false"] {
        color: black;
        background-color: grey;
        border: 1px solid #232323;
        &:before {
            content: ' ';
        }
    }
}
</style>