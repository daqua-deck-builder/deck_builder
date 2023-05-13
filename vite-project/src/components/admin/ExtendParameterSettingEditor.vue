<template lang="pug">
.eps_editor
    table(v-if="card")
        colgroup
            col(style="width: 200px;")
            col(style="width: 400px;")
        thead
            tr
                th 項目
                th パース値
        tbody
            tr
                th slug
                td {{ card.slug }}
            tr
                th name
                td {{ card.name }}
            tr.skills(v-for="(skill, $index) in skill_list")
                th skill {{ $index + 1 }}
                td {{ skill }}

    .actions
        a.button(href="#" @click.prevent="new_eps") 新規

    table(v-if="epss.length > 0" style="width: 600px;")
        colgroup
            col(style="width: 30px;")
            col(style="width: 500px;")
            col(style="width: 70px;")
        thead
            tr
                th ID
                th Json
                th
        tbody
            tr(v-for="(eps, $index) in epss")
                td.center {{ eps.id }}
                td.center
                    textarea.eps_skill(@blur="update_eps($index, $event)") {{ eps.json }}
                td.center
                    a.button(href="#" @click.prevent="submit_eps($index)") 保存
</template>

<script setup lang="ts">
import axios, {type AxiosResponse} from "axios";
import {onMounted, ref, type Ref} from "vue";
import type {CardDataClient} from '../../../../ex/types/card';
import type {EPS} from "../../../../ex/types/card";

const card!: Ref<CardDataClient | null> = ref(null);
const epss: Ref<EPS[]> = ref([]);
const skill_list: Ref<string[]> = ref([]);

onMounted(() => {
    const searches: string[] = location.search.replace(/^\?/, '').split('&');
    let slug = '';
    for (let i = 0; i < searches.length; i++) {
        const [key, value] = searches[i].split('=');
        if (key === 'slug') {
            slug = value;
            break;
        }
    }

    if (slug) {
        axios.get(`/api/admin/card_detail/${slug}`).then((res: AxiosResponse<{ card: CardDataClient, epss: EPS[] }>) => {
            card.value = res.data.card;
            epss.value = res.data.epss;
            skill_list.value = res.data.card.skills.split('@@');
        });
    } else {
        alert('slug not found');
    }
});

const submit_eps = (index: number): void => {
    const post_data: EPS = epss.value[index];
    axios.post('/api/admin/update_eps', {eps: post_data}).then((res: AxiosResponse<{ epss: EPS[] }>) => {
        epss.value = res.data.epss;
        alert('保存されました');
    });
};

const new_eps = () => {
    epss.value = [...epss.value, {
        id: -1,
        json: "{}",
        slug: card.value!.slug,
        method: 'extend'
    }];
};

const update_eps = ($index: number, event: { target: { value: string } }) => {
    epss.value = epss.value.map((eps: EPS, index: number) => {
        if (index === $index) {
            eps.json = event.target.value;
            return eps;
        } else {
            return eps;
        }
    });
}

</script>

<style scoped lang="less">
.eps_editor {

}

table {
    table-layout: fixed;
    border-collapse: collapse;
}

th, td {
    border: 1px solid black;
    padding: 5px;
}

th {
    background-color: #272727;
    color: white;
}

.skills textarea {
    width: 380px;
    height: 80px;
    line-height: 1.2rem;
}

textarea.eps_skill {
    width: 480px;
    height: 90px;
}
</style>