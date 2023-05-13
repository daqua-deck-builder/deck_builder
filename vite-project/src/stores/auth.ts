import {defineStore} from "pinia";

type State = {
    is_admin: boolean,
    login_id: string,
    username: string
};

const useAuthStore = defineStore('auth', {
    state(): State {
        return {
            is_admin: false,
            login_id: '',
            username: ''
        }
    }
});

export {useAuthStore};