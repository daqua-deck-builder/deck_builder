<script setup lang="ts">
import {onMounted, ref} from "vue";
import axios, {type AxiosResponse} from "axios";
import {useAuthStore} from "../stores/auth";

const auth_store = useAuthStore();

const first_loaded = ref<boolean>(false);

const login_id = ref<string>('');
const password = ref<string>('');

const submit = () => {
    if (login_id.value && password.value) {
        axios.post('/api/auth/login', {
            login_id: login_id.value,
            password: password.value
        }).then((res: AxiosResponse<{ username: string, login_id: string, is_admin: boolean }>) => {
            console.log(
                res.data
            )
            if (res.data.login_id) {
                password.value = '';
            } else {
                alert('ログインに失敗しました。ログインIDまたはパスワードが不正です。')
            }
            login_id.value = res.data.login_id;
            auth_store.username = res.data.username;
            auth_store.login_id = res.data.login_id;
            auth_store.is_admin = res.data.is_admin;
        });
    } else {
        alert('ログインIDとパスワードを入力してください');
    }
};

const dispatch_logout = () => {
    axios.post('/api/auth/logout').then(() => {
        login_id.value = '';
        password.value = '';
        auth_store.username = '';
        auth_store.login_id = '';
        auth_store.is_admin = false;
    });
};

onMounted(() => {
    axios.get('/api/auth/').then((res: AxiosResponse<{ login_id: string, username: string, is_admin: boolean }>) => {
        auth_store.username = res.data.username;
        auth_store.login_id = res.data.login_id;
        auth_store.is_admin = res.data.is_admin;
        first_loaded.value = true;
    });
});

</script>

<template lang="pug">
.bar(v-if="!first_loaded")
    span &nbsp;
.bar.authenticated(v-if="auth_store.login_id && first_loaded")
    span {{ auth_store.username }}
    a(href="#" @click.prevent="dispatch_logout") ログアウト
.bar.not_authenticated(v-if="!auth_store.login_id && first_loaded")
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

    &.authenticated {
        background-color: #313131;
    }

    &.not_authenticated {
        background-color: #797979;
        color: black;
    }

    padding: 10px;
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