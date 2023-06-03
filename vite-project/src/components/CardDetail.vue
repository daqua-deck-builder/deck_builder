<script lang="ts">
import type {CardDataClient} from '../../../ex/types/card.js';
import {defineComponent, PropType, onMounted, ref, watch, computed} from "vue";
import useGradientBg from "../composable/multi_color_gradient_bg";
import SkillBox from "./SkillBox.vue";
import {useAuthStore} from "../stores/auth";
import {useCardStore} from "../stores/cards";
import {create_default_card_data_client} from "../../../shared/functions";

type Props = {
    slug: { type: string, required: true, default: '' }
}

export default defineComponent({
    props: {
        slug: String as PropType<Props['slug']>
    },
    components: {
        SkillBox
    },
    setup(props: Props) {
        const card_store = useCardStore();
        const auth_store = useAuthStore();

        const card = ref<CardDataClient>(create_default_card_data_client());
        const show_name = ref<boolean>(true);

        const img_path = computed(() => {
            if (card.value.img !== '') {
                try {
                    return `/image/${card.value.img.replace(/@/, card.value.slug)}`;
                } catch {
                    return '';
                }
            } else {
                return '';
            }
        });

        const skills = computed(() => card.value.skills.split('@@').filter((text: string) => !!text));
        const label = computed(() => show_name.value ? card.value.name : card.value.pronounce);
        const {bg_gradient_style} = useGradientBg();
        const target = computed(() => card_store.target);

        const fetchCardData = async () => {
            card.value = await card_store.detail_by_slug(target.value);
        };

        onMounted(fetchCardData);
        watch(() => props.slug, fetchCardData);

        const open_admin = (slug: string) => {
            if (auth_store.is_admin) {
                window.open(`/admin/eps/${slug}`, '_blank');
            }
        };

        return {
            card,
            show_name,
            img_path,
            skills,
            label,
            bg_gradient_style,
            target,
            auth_store,
            open_admin
        };
    }
});
</script>

<template lang="pug">
table.card_detail(style="width: 502px;")
    colgroup
        col(style="width: 250px;")
        col(style="width: 250px;")
    tr.card_name(:style="bg_gradient_style(card.color)" :data-color="card.color")
        td.no_right_border.center(@click="open_admin(card.slug)") {{ card.slug }}
        td.no_left_border.label.center(@click="show_name = !show_name" v-html="label")
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