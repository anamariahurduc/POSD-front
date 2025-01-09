<template>
  <div>
    <div class="flex space-x-10 justify-center text-xl font-semibold p-3 bg-fuchsia-800 text-white">
      <p>First name: {{ user.first_name }}</p>
      <p>Last name: {{ user.last_name }}</p>
      <p>Email: {{ user.email }}</p>
      <p>Date of birth: {{ getAge(user.date_of_birth) }}</p>
      <p>Gender: {{ user.gender }}</p>
    </div>
    <p class="text-3xl font-semibold text-fuchsia-800 text-center mt-10">Edit laboratory result</p>
    <div class="w-full flex justify-center">
      <div class="w-[460px] mt-10 p-8 border border-1 border-gray-100 shadow-lg rounded-md space-y-1">
        <div class="flex flex-col">
          <label class="text-sm text-fuchsia-800" for="doctor">Test type</label>
          <input v-model="lab_result.test_type" type="text" class="border border-1 p-1 rounded-md">
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-fuchsia-800" for="doctor">Results</label>
          <div class="grid grid-cols-2">
            <p class="text-fuchsia-800 text-sm font-semibold">Property name</p>
            <p class="text-fuchsia-800 text-sm font-semibold">Property value</p>
          </div>
          <div v-for="(result, result_index) in lab_result.results" class="grid grid-cols-2">
            <p>{{ result_index }}</p>
            <p>{{ result }}</p>
          </div>

          <div class="flex space-x-2 items-center">
            <input class="border border-1 p-1 rounded-md" type="text" v-model="info">
            <input class="border border-1 p-1 rounded-md" type="text" v-model="value">
            <p class="text-fuchsia-800 rounded-md text-2xl text-center cursor-pointer"
               @click="lab_result.results[info] = value; info = ''; value= ''">+</p>
          </div>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-fuchsia-800" for="doctor">Notes</label>
          <textarea v-model="lab_result.notes" type="text" class="border border-1 p-1 rounded-md"/>
        </div>

        <div class="flex space-x-2 pt-5 justify-center">
          <button @click="saveChanges()" class="bg-fuchsia-900 text-white px-3 py-2 font-semibold rounded-md">Save
            changes
          </button>
          <RouterLink :to="'/patient/' + patient_id + '/laboratory-results'"
                      class="border border-fuchsia-900 rounded-md px-3 py-2 text-fuchsia-900">Cancel
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import Swal from "sweetalert2";

const key = ref('14e3927e8e3253b9b8a46581ef959f09fa3c8fb06f85f49dbf2e0ee05a03b9cd');
const iv = ref('edfc99088cfa3fbb5da7eb1af5f15af3');
const route = useRoute();
const patient_id = route.params.patient_id;
const lab_result_id = route.params.lab_result_id;
const lab_result = ref({});
const user = ref({});
const router = useRouter();
const info = ref("");
const value = ref("");

const saveChanges = async () => {
  const payload = {
    lab_result: lab_result.value
  }
  await axios.put('http://api.infomed.develop.eiddew.com/api/lab-results/' + lab_result_id, payload)
      .then(async (response) => {
        if (response.data.status === true) {
          Swal.fire({
            title: "Success",
            text: "Laboratory result updated successfully!",
            icon: "success"
          })
          router.push('/patient/' + patient_id + '/laboratory-results');
        }
      })
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

async function decryptAES(encryptedData, key, iv) {
  const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      {name: 'AES-CBC'},
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

const getUser = async () => {
  await axios.get('http://api.infomed.develop.eiddew.com/api/users/' + patient_id)
      .then(async (response) => {
        const keyArray = hexStringToUint8Array(key.value);
        const ivArray = hexStringToUint8Array(iv.value);

        const encryptedArray = base64ToUint8Array(response.data.encrypted_data);
        const decryptedText = await decryptAES(encryptedArray, keyArray, ivArray);

        user.value = JSON.parse(decryptedText);
      })
}

const getLabResult = async () => {
  await axios.get('http://api.infomed.develop.eiddew.com/api/lab-results/' + lab_result_id)
      .then(async (response) => {
        const keyArray = hexStringToUint8Array(key.value);
        const ivArray = hexStringToUint8Array(iv.value);

        const encryptedArray = base64ToUint8Array(response.data.encrypted_data);
        const decryptedText = await decryptAES(encryptedArray, keyArray, ivArray);

        lab_result.value = JSON.parse(decryptedText);
        lab_result.value.results = JSON.parse(lab_result.value.results)
      })
}


onMounted(async () => {
  await getUser();
  await getLabResult();
})
</script>
