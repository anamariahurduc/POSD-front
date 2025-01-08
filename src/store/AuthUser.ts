import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthUserStore = defineStore('authUser', () => {
    const auth_user = ref();

    function setUser(user) {
        auth_user.value = user;
        sessionStorage.setItem('auth_user', JSON.stringify(user));
    }

    function getUser() {
        return JSON.parse(sessionStorage.getItem('auth_user'));
    }

    return { auth_user, setUser, getUser}
})
