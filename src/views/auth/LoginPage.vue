<template>
    <div class="min-h-screen text-gray-900 flex justify-center">
    <div class="max-w-[60%] sm:m-10 sm:rounded-lg flex justify-center flex-1">
      <div class="lg:w-1/2 xl:w-5/12">
        <div class="flex flex-col items-center mt-10">
            <div class="w-auto bg-contain bg-center bg-no-repeat p-5">
                <img src="@/assets/Infomed.png" class="w-80 h-auto mt-5"/>
            </div>
          <div class="border p-7 mb-10 sm:rounded-lg">
            <h1 class="text-xl font-extrabold text-[#8d2188]">
              Sign up
            </h1>
            <div class="w-full flex-1 mt-10">
            <div class="mx-auto max-w-xs">
              <input
                  class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email" placeholder="Email" v-model="username" />
              <input
                  class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                  type="password" placeholder="Password" v-model="password"/>
              <button @click="login()"
                      class="mt-5 tracking-wide font-semibold bg-[#ba29b3] text-gray-100 w-full py-4 rounded-lg hover:bg-[#8d2188] transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
                <svg class="w-6 h-6 -ml-2" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <path d="M20 8v6M23 11h-6" />
                </svg>
                <span class="ml-3 font-semibold">Sign Up</span>
              </button>
            </div>

            <div class="mx-auto max-w-xs">
              <div class="border-b text-center">
                <div
                    class="leading-none px-2 inline-block text-sm text-[#8d2188] tracking-wide font-medium bg-white transform translate-y-1/2">
                  Do you have not account yet?
                </div>
              </div>
              <button
                  class="mt-5 tracking-wide font-semibold bg-[#ba29b3] text-gray-100 w-full py-4 rounded-lg hover:bg-[#8d2188] transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                  @click="register()">
                <span class="ml-3">Register now</span>
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useRouter} from "vue-router";
import {ref} from 'vue';
import axios from "axios";
import Swal from "sweetalert2";
import {useCookies} from "vue3-cookies";
import Navbar from "@/components/Navbar.vue";

const router = useRouter();
const username = ref('');
const password = ref('');
const { cookies } = useCookies();
const login = async() => {
    await axios.post('http://api.infomed.develop.eiddew.com/api/login', {
        email: username.value,
        password: password.value
    }).then((response) => {
      Swal.fire({
          title: "Success",
          text: response.data.message,
          icon: "success"
      });

      cookies.set("token", response.data.token, '', '/', `${import.meta.env.VITE_DOMAIN_COOKIE}`);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      getUser();

      router.push('dashboard');
    }).catch((error) => {
        Swal.fire({
            title: "Error",
            text: error.response.data.message,
            icon: "error"
        })
    })
}

const getUser = async () => {
  try {
    const response = await axios.get('http://api.infomed.develop.eiddew.com/api/user');
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }
};

const register = () => {
  router.push('register');
}

</script>