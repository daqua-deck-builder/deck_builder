<script setup lang="ts">
import {onMounted, ref} from "vue";
import axios, {type AxiosResponse} from "axios";

const username = ref<string>('');
const login_id = ref<string>('');
const password = ref<string>('');

const submit = () => {
    if (login_id.value && password.value) {
        axios.post('/api/auth/login', {
            login_id: login_id.value,
            password: password.value
        }).then((res: AxiosResponse<{ username: string }>) => {
            console.log(res.data.username)
            if (res.data.username) {
                login_id.value = '';
                password.value = '';
            }
            username.value = res.data.username
        });
    } else {
        alert('ログインIDとパスワードを入力してください');
    }
}

const dispatch_logout = () => {
    axios.post('/api/auth/logout').then(() => {
        login_id.value = '';
        password.value = '';
        username.value = '';
    })
}

onMounted(() => {
    axios.get('/api/auth/').then((res: AxiosResponse<{ username: string }>) => {
        username.value = res.data.username;
    });
});

</script>

<template lang="pug">
.bar(v-if="username")
    span {{ username }}
    a(href="#" @click.prevent="dispatch_logout") ログアウト
.bar(v-else)
    form(action="/api/login" method="POST" @submit.prevent="submit")
        label
            span ID:
            input(type="text" v-model.lazy="login_id")
        label
            span Password:
            input(type="password" v-model.lazy="password")
        input(type="submit" value="Login")
</template>

<style scoped lang="less">
.bar {
    background-color: #313131;
    color: white;
}
</style>