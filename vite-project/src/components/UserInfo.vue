<script setup lang="ts">
import {onMounted, ref} from "vue";
import axios, {type AxiosResponse} from "axios";

const first_loaded = ref<boolean>(false);

const username = ref<string>('');
const login_id = ref<string>('');
const password = ref<string>('');

const submit = () => {
    if (login_id.value && password.value) {
        axios.post('/api/auth/login', {
            login_id: login_id.value,
            password: password.value
        }).then((res: AxiosResponse<{ username: string }>) => {
            if (res.data.username) {
                login_id.value = '';
                password.value = '';
            }
            username.value = res.data.username;
        });
    } else {
        alert('ログインIDとパスワードを入力してください');
    }
};

const dispatch_logout = () => {
    axios.post('/api/auth/logout').then(() => {
        login_id.value = '';
        password.value = '';
        username.value = '';
    });
};

onMounted(() => {
    axios.get('/api/auth/').then((res: AxiosResponse<{ username: string }>) => {
        username.value = res.data.username;
        first_loaded.value = true;
    });
});

</script>

<template lang="pug">
.bar(v-if="!first_loaded")
    span &nbsp;
.bar(v-if="username && first_loaded")
    span {{ username }}
    a(href="#" @click.prevent="dispatch_logout") ログアウト
.bar(v-if="!username && first_loaded")
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
    padding: 10px;
    background-color: #313131;
    color: white;

    label {
        span {
            display: inline-block;
            margin-right: 5px;
        }

        display: inline-block;
        margin-right: 2rem;
    }
}
</style>