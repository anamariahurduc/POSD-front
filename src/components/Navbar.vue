<template>
    <nav class="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <div class="flex flex-wrap items-center justify-between p-4">
            <a href="#" class="flex items-center">
                <img src="@/assets/Infomed_no_bg.png" class="w-80 h-auto ml-5"/>
            </a>
            <button data-collapse-toggle="navbar-solid-bg" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-solid-bg" aria-expanded="false">
                <span class="sr-only">Open main menu</span>
                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
                </svg>
            </button>
            <div class="hidden w-full md:block md:w-auto ml-20" id="navbar-solid-bg">
                <ul class="flex flex-col font-medium mt-4 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-800 md:dark:bg-transparent dark:border-gray-700">

                    <template v-if="auth_user.roles[0].name == 'administrator' || auth_user.roles[0].name == 'doctor'">
                      <li>
                        <RouterLink
                            class="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                            :to="'/patients'">Patients</RouterLink>
                      </li>
                    </template>
                    <li>
                        <a href="#" @click="logout()" class="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Logout</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script setup>

import axios from "axios";
import Swal from "sweetalert2";
import {useCookies} from "vue3-cookies";
import {useRouter} from "vue-router";
import {useAuthUserStore} from "@/store/AuthUser.ts";

const { cookies } = useCookies();
const router = useRouter();
const authUserStore = useAuthUserStore();
const auth_user = authUserStore.getUser();
const logout = async () => {
    await axios.post('http://api.infomed.develop.eiddew.com/api/logout').then((response) => {
      cookies.remove("token");
      router.push('/login');
    }).catch((error) => {

    });
};
</script>