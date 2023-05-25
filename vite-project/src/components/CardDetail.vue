<script lang="ts">
import type {CardDataClient} from '../../../ex/types/card.js';
import {computed, ref} from "vue";
import useGradientBg from "../composable/multi_color_gradient_bg";
import SkillBox from "./SkillBox.vue";
import {useAuthStore} from "../stores/auth";
import {useCardStore} from "../stores/cards";

const card_store = useCardStore();

const CardDetail = {
    components: {
        SkillBox
    },
    props: {
        slug: {
            type: String,
            default: '',
            required: true
        }
    },
    data() {
        return {
            card: {img: '', skills: '', name: '', pronounce: '', slug: '', color: '', card_type: ''},
            show_name: true,
            card_store,
            auth_store: useAuthStore()
        }
    },
    computed: {
        img_path() {
            if (this.card.img !== '') {
                try {
                    return `/image/${this.card.img.replace(/@/, this.card.slug)}`;
                } catch {
                    return '';
                }
            } else {
                return '';
            }
        },
        skills() {
            return this.card.skills.split('@@').filter((text: string) => {
                return !!text
            });
        },
        label() {
            return this.show_name ? this.card.name : this.card.pronounce;
        },
        bg_gradient_style(colors: string) {
            const {bg_gradient_style} = useGradientBg();
            return bg_gradient_style.value(colors);
        },
        target() {
            return this.card_store.target;
        },
        async card() {
            return await this.card_store.detail_by_slug(this.target);
        }
    },
    async created() {
        this.card = await card_store.detail_by_slug(this.target);
    },
    watch: {
        slug: {
            async handler(newValue: string, oldValue: string) {
                // @ts-ignore
                this.card = await card_store.detail_by_slug(newValue);
            },
            immediate: true
        }
    },
    methods: {
        open_admin(slug: string) {
            if (this.auth_store.is_admin) {
                window.open(`/admin/?slug=${slug}`, '_blank');
            }
        }
    }
}

export default CardDetail;

</script>

<template lang="pug">
table.card_detail(style="width: 502px;" v-if="card")
    colgroup
        col(style="width: 250px;")
        col(style="width: 250px;")
    //tr.card_name(:style="bg_gradient_style(card.color)" :data-color="card.color")
    tr.card_name(:data-color="card.color")
        td.no_right_border.center(@click="open_admin(card.slug)") {{ card.slug }}
        td.no_left_border.label.center(@click="show_name = !show_name") {{ label }}
    tr(v-if="auth_store.is_admin")
        td.center.image_wrapper(colspan="2")
            img.illustration(:data-type="card.card_type" :src="img_path")
    tr.coin(v-if="card.coin")
        th コイン
        td {{ card.coin }}
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