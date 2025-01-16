<template>
  <div class="w-full p-12">
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">
            Nr.
          </th>
          <th scope="col" class="px-6 py-3">
            Name
          </th>
          <th scope="col" class="px-6 py-3">
            Date of birth
          </th>
          <th scope="col" class="px-6 py-3">
            Gender
          </th>
          <th scope="col" class="px-6 py-3">
            Action
          </th>
        </tr>
        </thead>
        <tbody>
        <template v-for="(patient, patient_index) in patients">
          <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            <td>
              <div class="px-6">
                <div class="text-base font-semibold">{{patient_index + 1}}</div>
              </div>
            </td>
            <th scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
              <div>
                <div class="text-base font-semibold">{{patient.first_name}} {{patient.last_name}}</div>
              </div>
            </th>
            <td>
              <div class="px-6">
                <div class="text-base font-semibold">{{getAge(patient.date_of_birth)}}</div>
              </div>
            </td>
            <td>
              <div class="px-6">
                <div class="text-base font-semibold">{{patient.gender}}</div>
              </div>
            </td>
            <td class="px-6">
              <RouterLink class="font-medium text-blue-600 dark:text-blue-500 hover:underline" :to="'/patient/' + patient.id">View patient</RouterLink>
            </td>
          </tr>
        </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import axios from "axios";

const patients = ref([]);
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

const getPatients = (async () => {
  await axios.get('http://api.infomed.develop.eiddew.com/api/get-patients').then(async (response) => {
    const keyArray = hexStringToUint8Array(key.value);
    const ivArray = hexStringToUint8Array(iv.value);

    const encryptedArray = base64ToUint8Array(response.data.encrypted_data);
    const decryptedText = await decryptAES(encryptedArray, keyArray, ivArray);

    const decryptedData = JSON.parse(decryptedText);

    decryptedData.forEach((patient) => {
      patients.value.push(patient);
    })
  }).catch((error) => {
  })
})

onMounted(() => {
  getPatients();
})
</script>