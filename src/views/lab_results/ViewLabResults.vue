<template>
  <div>
    <div v-if="auth_user.roles[0].name !== 'patient'" class="flex space-x-10 justify-center text-xl font-semibold p-3 bg-fuchsia-800 text-white">
      <p>First name: {{user.first_name}}</p>
      <p>Last name: {{user.last_name}}</p>
      <p>Email: {{user.email}}</p>
      <p>Date of birth: {{getAge(user.date_of_birth)}}</p>
      <p>Gender: {{user.gender}}</p>
    </div>
    <div class="w-full p-12">
      <p class="text-3xl text-fuchsia-800 font-semibold">Laboratory Results</p>
      <div class="flex justify-end mr-1">
        <RouterLink :to="'/patient/' + patient_id + '/laboratory-results/add'" v-if="auth_user.roles[0].name === 'doctor' || auth_user.roles[0].name === 'administrator'" class="bg-fuchsia-800 text-white font-semibold px-3 py-2 rounded-md">Add laboratory result</RouterLink>
        <button v-else disabled class="bg-gray-500 text-white font-semibold px-3 py-2 rounded-md cursor-not-allowed">Add medical record</button>
      </div>
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-16">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3">
              Nr.
            </th>
            <th scope="col" class="px-6 py-3">
              Test type
            </th>
            <th scope="col" class="px-6 py-3">
              Results
            </th>
            <th scope="col" class="px-6 py-3">
              Notes
            </th>
            <th scope="col" class="px-6 py-3">
              Actions
            </th>
          </tr>
          </thead>
          <tbody>
          <template v-for="(lab_result, lab_result_index) in lab_results">
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td>
                <div class="px-6">
                  <div class="text-base font-semibold">{{ lab_result_index + 1 }}</div>
                </div>
              </td>
              <th scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                <div>
                  <p class="text-base font-semibold">{{ lab_result.test_type }}</p>
                </div>
              </th>
              <td>
                <div class="px-6">
                  <div class="text-base font-semibold" v-for="(result, result_index) in JSON.parse(lab_result.results)"><span class="text-fuchsia-800 font-semibold">{{transformText(result_index)}}</span>: {{result}}</div>
                </div>
              </td>
              <td>
                <div class="px-6 w-[500px]">
                  <div class="text-base font-semibold">{{ lab_result.notes }}</div>
                </div>
              </td>

              <td class="px-6">
                <div class="flex space-x-3">
                  <RouterLink v-if="auth_user.roles[0].name === 'doctor' || auth_user.roles[0].name === 'administrator'" :to="'/patient/' + patient_id + '/laboratory-results/' + lab_result.id" class="font-semibold bg-orange-500 px-2 py-1 rounded-md text-white">Edit result</RouterLink>
                  <button v-else disabled class="font-semibold bg-orange-500 px-2 py-1 rounded-md text-white cursor-not-allowed">Edit result</button>
                  <button v-if="auth_user.roles[0].name === 'administrator'" @click="deleteResult(lab_result.id)" class="font-semibold bg-red-500 px-2 py-1 rounded-md text-white">Delete result</button>
                  <button v-else disabled class="font-semibold bg-red-500 px-2 py-1 rounded-md text-white cursor-not-allowed">Delete result</button>
                </div>
              </td>
            </tr>
          </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {useAuthUserStore} from "@/store/AuthUser";
import axios from "axios";
import {useRoute} from "vue-router";
import Swal from "sweetalert2";

const route = useRoute();
const patient_id = route.params.patient_id;
const user = ref({});
const authUserStore = useAuthUserStore();
const auth_user = authUserStore.getUser();
const lab_results = ref([])

const key = ref('14e3927e8e3253b9b8a46581ef959f09fa3c8fb06f85f49dbf2e0ee05a03b9cd');
const iv = ref('edfc99088cfa3fbb5da7eb1af5f15af3');

const deleteResult = (id) => {
  Swal.fire({
    title: "Are you sure you want to delete this result?",
    showCancelButton: true,
    confirmButtonText: "Yes",
  }).then(async(result) => {
    if (result.isConfirmed) {
      await axios.delete('http://api.infomed.develop.eiddew.com/api/lab-results/' + id)
          .then((response) => {
            if(response.data.status === true) {
              let i = lab_results.value.map(item => item.id).indexOf(id);
              if(i >= 0) {
                lab_results.value.splice(i, 1);
              }
            }
            else {
              Swal.fire({
                title: "Something went wrong",
                text: "Please try again later",
                confirmButtonText: "Ok",
              })
            }
          })
    }
  });
}

function transformText(text) {
  return text.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
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


const getUser = async() => {
  await axios.get('http://api.infomed.develop.eiddew.com/api/users/' + patient_id)
      .then(async (response) => {
        const keyArray = hexStringToUint8Array(key.value);
        const ivArray = hexStringToUint8Array(iv.value);

        const encryptedArray = base64ToUint8Array(response.data.encrypted_data);
        const decryptedText = await decryptAES(encryptedArray, keyArray, ivArray);

        user.value =  JSON.parse(decryptedText);
      })
}

const getLabResults = async () => {
  axios.get('http://api.infomed.develop.eiddew.com/api/lab-results',
      {
        params: {
          patient_id: patient_id
        }
      })
      .then(async (response) => {
        const keyArray = hexStringToUint8Array(key.value);
        const ivArray = hexStringToUint8Array(iv.value);

        const encryptedArray = base64ToUint8Array(response.data.encrypted_data);
        const decryptedText = await decryptAES(encryptedArray, keyArray, ivArray);

        const decryptedData = JSON.parse(decryptedText);

        decryptedData.forEach((lab_result) => {
          lab_results.value.push(lab_result);
        })
      })
}

onMounted(async() => {
  await getUser();
  await getLabResults();
})

</script>