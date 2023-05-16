<template lang="pug">
.admin
    table
        colgroup
            col(style="width: 100px;")
            col(style="width: 250px;")
            col(style="width: 100px;")
            col(style="width: 100px;")
            col(style="width: 100px;")
        thead
            tr
                th ID
                th NAME
                th product_no
                th product_type
                th sort
                th
        tbody
            tr(v-for="(p, $index) in products" :key="p.id")
                td.center {{ p.id }}
                td
                    input(type="text" v-model="p.name")
                td
                    input(type="text" v-model="p.product_no")
                td
                    select(v-model="p.product_type")
                        option(value="booster") booster
                        option(value="starter") starter
                td
                    input(type="text" v-model.number="p.sort" )
                td
                    a.button(href="#" @click.prevent="update($index)") Update
                    a.button(href="#" @click.prevent="start_fetch(p.id)") Start fetch
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

const start_fetch = (id: number) => {
    axios.post('/api/admin/fetch_items', {id}).then((res: AxiosResponse<{ success: boolean }>) => {
        console.log(res.data.success);
        alert(`${id} fetch complete`);
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
}
</script>

<style scoped lang="less"></style>