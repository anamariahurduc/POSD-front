<template>
  <div>
    <p class="text-3xl font-semibold text-fuchsia-800 text-center mt-10">Edit user</p>
    <div class="w-full flex justify-center">
      <div class="w-[460px] mt-10 p-8 border border-1 border-gray-100 shadow-lg rounded-md space-y-1">
        <div class="w-full flex justify-center">
          <div class="w-80">
            <div class="flex flex-col">
              <label class="text-sm text-fuchsia-800">First name</label>
              <input v-model="user.first_name" type="text" class="border border-1 p-1 rounded-md">
            </div>
            <div class="flex flex-col">
              <label class="text-sm text-fuchsia-800">Last name</label>
              <input v-model="user.last_name" type="text" class="border border-1 p-1 rounded-md">
            </div>
            <div class="flex flex-col">
              <label class="text-sm text-fuchsia-800">Email</label>
              <input v-model="user.email" type="text" class="border border-1 p-1 rounded-md">
            </div>
            <label class="text-sm text-fuchsia-800">Role</label>
            <select v-model="selected_role_name" class="py-3 px-4 pe-9 mb-2 block w-full bg-gray-100 border-gray-200 border rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none">
              <template v-for="role in roles" :key="role.name">
                <option :value="role.name">{{role.name}}</option>
              </template>
            </select>
            <div class="mt-5 ml-20">
              <button @click="updateUser()" class="items-center font-semibold bg-fuchsia-800 px-2 py-1 rounded-md text-white">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {useAuthUserStore} from "@/store/AuthUser";
import Swal from "sweetalert2";

const route = useRoute();
const user_id = route.params.user_id;
const user = ref({});

const selected_role_name = ref('');
const all_roles = ref([]);
const key = ref('14e3927e8e3253b9b8a46581ef959f09fa3c8fb06f85f49dbf2e0ee05a03b9cd');
const iv = ref('edfc99088cfa3fbb5da7eb1af5f15af3');
const authUserStore = useAuthUserStore();
const auth_user = authUserStore.getUser();
const roles = ref([]);
const router = useRouter();

const getAge = (date_of_birth: string) => {
  const birth = new Date(date_of_birth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age
}

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

function uint8ArrayToBase64(array) {
  let binaryString = '';
  for (let i = 0; i < array.length; i++) {
    binaryString += String.fromCharCode(array[i]);
  }
  return btoa(binaryString);
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

async function encryptAES(data, key, iv) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-CBC' },
      false,
      ['encrypt']
  );

  const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        iv: iv
      },
      cryptoKey,
      encodedData
  );

  return new Uint8Array(encryptedData);
}
const getUser = async() => {
  await axios.get('http://api.infomed.develop.eiddew.com/api/users/' + user_id)
      .then(async (response) => {
        const keyArray = hexStringToUint8Array(key.value);
        const ivArray = hexStringToUint8Array(iv.value);

        const encryptedArray = base64ToUint8Array(response.data.encrypted_data);
        const decryptedText = await decryptAES(encryptedArray, keyArray, ivArray);

        user.value =  JSON.parse(decryptedText);

        console.log(user.value);
      })
}

const getRoles = async() => {
  await axios.get('http://api.infomed.develop.eiddew.com/api/getRoles').then((response) => {
    response.data.forEach((role) => {
      all_roles.value.push(role);
      roles.value.push({
        id: role.id,
        name: role.name
      })
    })
  }).catch((error) => {

  })
}

const updateUser = async () => {
  console.log('ssss', selected_role_name.value)
  let role_index  = all_roles.value.findIndex(item => item.name == selected_role_name.value);
  if(role_index >= 0)
  {
    user.value.roles[0] = all_roles.value[role_index];
  }
  console.log(user.value);

  const updatedUser = JSON.stringify(user.value);

  const keyArray = hexStringToUint8Array(key.value);
  const ivArray = hexStringToUint8Array(iv.value);

  const encryptedData = await encryptAES(updatedUser, keyArray, ivArray);

  const encryptedBase64Data = uint8ArrayToBase64(encryptedData);


  axios.put('http://api.infomed.develop.eiddew.com/api/users/' + user_id, {
    encrypted_data: encryptedBase64Data
  })
      .then(response => {
        Swal.fire({
          title: "Success",
          text: 'Recipe updated successfully!',
          icon: "success"
        });

        router.push({ name: 'dashboard'});
      })
      .catch(error => {
        console.error('Error updating the recipe:', error);
      });
}

onMounted(async() => {
  await getUser();
  await getRoles();
})
</script>
