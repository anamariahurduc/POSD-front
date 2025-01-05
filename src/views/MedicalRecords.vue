<template>
  <div>
    <div class="flex space-x-10 justify-center text-xl font-semibold p-3 bg-fuchsia-800 text-white">
      <p>First name: {{user.first_name}}</p>
      <p>Last name: {{user.last_name}}</p>
      <p>Email: {{user.email}}</p>
      <p>Date of birth: {{getAge(user.date_of_birth)}}</p>
      <p>Gender: {{user.gender}}</p>
    </div>
    <div class="w-full p-12">
      <p class="text-3xl text-fuchsia-800 font-semibold">Medical records</p>
      <div class="flex justify-end mr-1">
        <button class="bg-fuchsia-800 text-white font-semibold px-3 py-2 rounded-md">Add medical record</button>
      </div>
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-16">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3">
              Nr.
            </th>
            <th scope="col" class="px-6 py-3">
              Doctor
            </th>
            <th scope="col" class="px-6 py-3">
              Diagnosis
            </th>
            <th scope="col" class="px-6 py-3">
              Procedures
            </th>
            <th scope="col" class="px-6 py-3">
              Notes
            </th>
            <th scope="col" class="px-6 py-3">
              Lab results
            </th>
            <th scope="col" class="px-6 py-3">
              Recipes
            </th>
            <th scope="col" class="px-6 py-3">
              Actions
            </th>
          </tr>
          </thead>
          <tbody>
          <template v-for="(medical_record, medical_record_index) in medical_records">
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td>
                <div class="px-6">
                  <div class="text-base font-semibold">{{ medical_record_index + 1 }}</div>
                </div>
              </td>
              <th scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                <div>
                  <div class="text-base font-semibold">{{ medical_record.doctor.first_name }}
                    {{ medical_record.doctor.last_name }}
                  </div>
                </div>
              </th>
              <td>
                <div class="px-6">
                  <div class="text-base font-semibold">{{ medical_record.diagnosis }}</div>
                </div>
              </td>
              <td>
                <div class="px-6">
                  <div class="text-base font-semibold">{{ medical_record.procedures }}</div>
                </div>
              </td>
              <td>
                <div class="px-6">
                  <div class="text-base font-semibold">{{ medical_record.notes }}</div>
                </div>
              </td>
              <td>
                <div class="px-6">
                  <div class="text-base font-semibold" v-for="id in JSON.parse(medical_record.lab_result_ids)">
                    <RouterLink :to="'/patient/' + patient_id + '/lab-results/' + id" class="text-blue-500 cursor-pointer font-semibold underline">{{ id }}</RouterLink>
                  </div>
                </div>
              </td>
              <td>
                <div class="px-6">
                  <RouterLink :to="'/patient/' + patient_id + '/recipes/' + medical_record.recipe_id" class="text-blue-500 cursor-pointer font-semibold underline">{{ medical_record.recipe_id }}</RouterLink>
                </div>
              </td>
              <td class="px-6">
                <div class="flex space-x-3">
                  <RouterLink :to="'/patient/' + patient_id + '/medical-records/' + medical_record.id" class="font-semibold bg-orange-500 px-2 py-1 rounded-md text-white">Edit record</RouterLink>
                  <button @click="deleteRecord(medical_record.id)" class="font-semibold bg-red-500 px-2 py-1 rounded-md text-white">Delete record</button>
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

import {useRoute} from "vue-router";
import axios from "axios";
import {onMounted, ref} from "vue";
import Swal from "sweetalert2";

const route = useRoute();
const patient_id = route.params.patient_id;
const medical_records = ref([]);
const user = ref({});

const key = ref('14e3927e8e3253b9b8a46581ef959f09fa3c8fb06f85f49dbf2e0ee05a03b9cd');
const iv = ref('edfc99088cfa3fbb5da7eb1af5f15af3');

const deleteRecord = (id: number) => {
  Swal.fire({
    title: "Are you sure you want to delete this record?",
    showCancelButton: true,
    confirmButtonText: "Yes",
  }).then(async(result) => {
    if (result.isConfirmed) {
      await axios.delete('http://api.infomed.develop.eiddew.com/api/medical-records/' + id)
          .then((response) => {
            if(response.data.status === true) {
              let i = medical_records.value.map(item => item.id).indexOf(id);
              if(i >= 0) {
                medical_records.value.splice(i, 1);
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

const getMedicalRecords = async () => {
  axios.get('http://api.infomed.develop.eiddew.com/api/medical-records', {
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

        decryptedData.forEach((medical_record) => {
          medical_records.value.push(medical_record);
        })
      })
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

onMounted(async () => {
  await getMedicalRecords();
  await getUser();
})

</script>
