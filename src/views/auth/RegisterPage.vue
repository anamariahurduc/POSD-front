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
                            Register
                        </h1>
                        <div class="w-full flex-1 mt-5">
                            <div class="mx-auto max-w-xs">
                              <label class="text-[#8d2188] font-semibold">Choose role</label>
                              <select v-model="selected_role" class="py-3 px-4 pe-9 mb-2 block w-full bg-gray-100 border-gray-200 border rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none">
                                <template v-for="role in roles" :key="role.name">
                                  <option :value="role.name">{{role.name}}</option>
                                </template>
                              </select>
                              <label class="text-[#8d2188] font-semibold">First Name</label>
                              <input
                                  class="w-full px-8 py-4 mb-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                                  type="first_email" placeholder="First Name" v-model="first_name" />
                              <label class="text-[#8d2188] font-semibold">Last Name</label>
                              <input
                                  class="w-full px-8 py-4 mb-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                                  type="last_email" placeholder="Last Name" v-model="last_name" />
                              <label class="text-[#8d2188] font-semibold">Email</label>
                              <input
                                      class="w-full px-8 py-4 mb-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                                      type="email" placeholder="Email" v-model="username" />
                              <label class="text-[#8d2188] font-semibold">Password</label>
                              <input
                                      class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                                      type="password" placeholder="Password" v-model="password"/>
                              <button @click="register()"
                                      class="mt-5 tracking-wide font-semibold bg-[#ba29b3] text-gray-100 w-full py-4 rounded-lg hover:bg-[#8d2188] transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
                                  <svg class="w-6 h-6 -ml-2" fill="none" stroke="currentColor" stroke-width="2"
                                       stroke-linecap="round" stroke-linejoin="round">
                                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                      <circle cx="8.5" cy="7" r="4" />
                                      <path d="M20 8v6M23 11h-6" />
                                  </svg>
                                  <span class="ml-3 font-semibold">Register</span>
                              </button>
                              <button @click="cancel()"
                                      class="mt-5 tracking-wide font-semibold bg-[#ba29b3] text-gray-100 w-full py-4 rounded-lg hover:bg-[#8d2188] transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
                                  <span class="ml-3 font-semibold">Cancel</span>
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
import axios from "axios";
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import Swal from "sweetalert2";

const router = useRouter();
const first_name = ref('');
const last_name = ref('');
const username = ref('');
const password = ref('');
const selected_role = ref('');
const roles = ref([]);
const register = async() => {
    await axios.post('http://api.infomed.develop.eiddew.com/api/register', {
        first_name: first_name.value,
        last_name: first_name.value,
        email: username.value,
        password: password.value,
        role: selected_role.value
    }).then((response) => {
        console.log(response);
        Swal.fire({
            title: "Success",
            text: response.data.message,
            icon: "success"
        });
    }).catch((error) => {
        console.log(error);
        Swal.fire({
            title: "Error",
            text: error.response.data.message,
            icon: "error"
        })
    })
}

const getRoles = async() => {
  await axios.get('http://api.infomed.develop.eiddew.com/api/getRoles').then((response) => {
    response.data.forEach((role) => {
      roles.value.push({
        id: role.id,
        name: role.name
      })
    })

    console.log(roles.value)
  }).catch((error) => {

  })
}
const cancel = () => {
    router.push('login');
}

onMounted(() => {
  getRoles();
})

</script>