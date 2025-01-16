<template>
    <div class="w-full p-12">
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
            <div class="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900">
                <div>
                    <div id="dropdownAction" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
                        <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownActionButton">
                            <li>
                                <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Reward</a>
                            </li>
                            <li>
                                <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Promote</a>
                            </li>
                            <li>
                                <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Activate account</a>
                            </li>
                        </ul>
                        <div class="py-1">
                            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete User</a>
                        </div>
                    </div>
                </div>
                <label for="table-search" class="sr-only">Search</label>
                <div class="relative">
                    <div class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input type="text" id="table-search-users" class="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search for users">
                </div>
            </div>
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
<!--                    <th scope="col" class="p-4">-->
<!--                        <div class="flex items-center">-->
<!--                            <input id="checkbox-all-search" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">-->
<!--                            <label for="checkbox-all-search" class="sr-only">checkbox</label>-->
<!--                        </div>-->
<!--                    </th>-->
                    <th scope="col" class="px-6 py-3">
                        Name
                    </th>
                    <th scope="col" class="px-6 py-3">
                        Position
                    </th>
<!--                    <th scope="col" class="px-6 py-3">-->
<!--                        Status-->
<!--                    </th>-->
                    <th scope="col" class="px-6 py-3">
                        Action
                    </th>
                </tr>
                </thead>
                <tbody>
                <template v-for="user in users">
                  <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
<!--                    <td class="w-4 p-4">-->
<!--                        <div class="flex items-center">-->
<!--                            <input id="checkbox-table-search-1" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">-->
<!--                            <label for="checkbox-table-search-1" class="sr-only">checkbox</label>-->
<!--                        </div>-->
<!--                    </td>-->
                    <th scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                        <!--            <img class="w-10 h-10 rounded-full" src="/docs/images/people/profile-picture-1.jpg" alt="Jese image">-->
                      <div class="ps-3">
                            <div class="text-base font-semibold">{{user.first_name}} {{user.last_name}}</div>
                            <div class="font-normal text-gray-500">{{user.email}}</div>
                        </div>
                    </th>
                    <td class="px-6 py-4 uppercase">
                        {{user.roles[0].name}}
                    </td>
<!--                    <td class="px-6 py-4">-->
<!--                        <div class="flex items-center">-->
<!--                            <div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> Online-->
<!--                        </div>-->
<!--                    </td>-->
                    <td class="px-6 py-4">
<!--                        <a href="#" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit user</a>-->
                      <RouterLink :to="'/dashboard/' + user.id + '/edit-user'" class="font-semibold bg-orange-500 px-2 py-1 rounded-md text-white">Edit user</RouterLink>

                    </td>
                </tr>
                </template>
                </tbody>
            </table>
        </div>
    </div>

</template>

<script setup>

import Navbar from "@/components/Navbar.vue";
import axios from "axios";
import {onMounted, ref} from "vue";
import {useCookies} from "vue3-cookies";
import {useRoute} from "vue-router";

const users = ref([]);
const key = ref('14e3927e8e3253b9b8a46581ef959f09fa3c8fb06f85f49dbf2e0ee05a03b9cd');
const iv = ref('edfc99088cfa3fbb5da7eb1af5f15af3');

function hexStringToUint8Array(hexString) {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return bytes;
}

function base64ToUint8Array(base64String) {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decryptAES(encryptedData, key, iv) {
  const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: iv
      },
      cryptoKey,
      encryptedData
  );

  return new TextDecoder().decode(decrypted);
}

const getUsers = (async () => {
    await axios.get('http://api.infomed.develop.eiddew.com/api/users').then(async (response) => {
      const keyArray = hexStringToUint8Array(key.value);
      const ivArray = hexStringToUint8Array(iv.value);

      const encryptedArray = base64ToUint8Array(response.data.encrypted_data);
      const decryptedText = await decryptAES(encryptedArray, keyArray, ivArray);

      const decryptedData = JSON.parse(decryptedText);

      decryptedData.forEach((user) => {
        users.value.push(user);
      })

    }).catch((error) => {
    })
})

onMounted(() => {
  getUsers();
})

</script>