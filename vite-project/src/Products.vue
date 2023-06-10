<template lang="pug">
.admin
    .actions
        a.button(href="#" @click.prevent="publish_all") Publish
    table
        colgroup
            col(style="width: 40px;")
            col(style="width: 200px;")
            col(style="width: 250px;")
            col(style="width: 150px;")
            col(style="width: 150px;")
            col(style="width: 200px;")
            col(style="width: 200px;")
        thead
            tr
                th ID
                th
                th NAME
                th product_no
                th product_type
                th sort
                th Last Fetched
        tbody
            tr(v-for="(p, $index) in products" :key="p.id")
                td.center {{ p.id }}
                td
                    a.button(href="#" @click.prevent="update($index)") Update
                    a.button(href="#" @click.prevent="start_fetch(p.id)" v-if="p.id > 0") Start fetch
                td
                    input(type="text" v-model="p.name" style="width: 240px;")
                td
                    input(type="text" v-model="p.product_no" style="width: 140px;")
                td
                    select(v-model="p.product_type" style="width: 140px;")
                        option(value="booster") ブースター
                        option(value="starter") スターター
                td
                    input(type="text" v-model.number="p.sort" style="width: 190px;")
                td {{ (p.last_fetched || '').replace(/T/, ' ') }}

    .actions
        a.button(href="#" @click.prevent="append_new") Append new
</template>

<script setup lang="ts">
import axios, {type AxiosResponse} from "axios";
import type {Product} from '../../ex/types/app';
import {ref} from "vue";

const products = ref<Product[]>([]);
axios.get('/api/admin/products').then((res: AxiosResponse<{ products: Product[] }>) => {
    products.value = res.data.products;
});

const update = (index: number) => {
    console.log(products.value[index]);
    axios.post('/api/admin/update_product', {
        product: products.value[index]
    }).then((res: AxiosResponse<{ success: boolean }>) => {

    });
};

const prevent_double_fetch = ref<boolean>(false);

const start_fetch = (id: number) => {
    if (prevent_double_fetch.value) {
        alert('データ取得が進行中です');
        return;
    }
    prevent_double_fetch.value = true;

    axios.post('/api/admin/fetch_items', {id}).then((res: AxiosResponse<{ success: boolean, product_no?: string, last_fetched?: string }>) => {
        alert(`${id} fetch complete`);
        prevent_double_fetch.value = false;

        if (res.data.success) {
            const items = products.value;
            for (let i = 0; i < items.length; i++) {
                if (items[i].product_no === res.data.product_no) {
                    // @ts-ignore
                    items[i].last_fetched = res.data.last_fetched;
                }
            }
            products.value = items;
        }
    }).catch(() => {
        alert('サーバーエラー');
        prevent_double_fetch.value = false;
    });
};

const append_new = () => {

    let max_sort = 0;
    products.value.forEach(p => {
        max_sort = Math.max(p.sort, max_sort);
    });

    const new_product = {
        id: -1,
        name: '',
        product_no: '',
        product_type: 'booster',
        last_fetched: null,
        last_converted: null,
        sort: max_sort + 1000,
        processing: false
    };
    products.value = [...products.value, new_product];
};

const publish_all = async (): Promise<void> => {
    axios.post('/api/admin/publish_cards').then((res: AxiosResponse<{ success: boolean }>): void => {
        if (res.data.success) {
            alert('書き出しました');
        }
    });
};

</script>

<style scoped lang="less">
@import "./composable/button.less";

table {
    table-layout: fixed;
    width: 1200px;
}

a:active, a:focus {
    color: red;
}

a.button {
    color: blue;

    .small_button();

    &:hover {
        background-color: lightgreen;
    }

    &:focus {
        color: red;
    }
}

tr {
    &:hover {
        background-color: lightgreen;
    }
}

</style>