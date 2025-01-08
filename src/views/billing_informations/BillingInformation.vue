<template>
  <div>
    <div class="flex space-x-10 justify-center text-xl font-semibold p-3 bg-fuchsia-800 text-white">
      <button class="flex justify-start" @click="goToPacientPage()">Go Back</button>
      <p>First name: {{user.first_name}}</p>
      <p>Last name: {{user.last_name}}</p>
      <p>Email: {{user.email}}</p>
      <p>Date of birth: {{getAge(user.date_of_birth)}}</p>
      <p>Gender: {{user.gender}}</p>
    </div>
    <div class="w-full p-12">
      <p class="text-3xl text-fuchsia-800 font-semibold">Billing informations</p>
      <div class="flex justify-end mr-1">
        <RouterLink :to="'/patient/' + patient_id + '/recipes/add-recipe'" class="bg-fuchsia-800 text-white font-semibold px-3 py-2 rounded-md">Add invoice</RouterLink>
      </div>
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-16">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3">
              Nr.
            </th>
            <th scope="col" class="px-6 py-3">
              Invoice number
            </th>
            <th scope="col" class="px-6 py-3">
              Services
            </th>
            <th scope="col" class="px-6 py-3">
              Amount
            </th>
            <th scope="col" class="px-6 py-3">
              Actions
            </th>
          </tr>
          </thead>
          <tbody>
          <template v-for="(billing_info, billing_info_index) in billing_infos">
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td>
                <div class="px-6">
                  <div class="text-base font-semibold">{{ billing_info_index + 1 }}</div>
                </div>
              </td>
              <td>
                <div class="px-6">
                  <div class="text-base font-semibold text-gray-900">{{ billing_info.invoice_number}}</div>
                </div>
              </td>
              <td>
                <div class="px-6">
                  <template v-for="(service_key) in Object.keys(billing_info.services)">
                    <div class="font-bold text-fuchsia-800">
                      {{ billing_info.services[service_key].service_name }}
                    </div> - {{ billing_info.services[service_key].price }} RON
                  </template>
                </div>
              </td>
              <td>
                <div class="px-6">
                  <div class="text-base font-semibold">{{ billing_info.amount }} RON</div>
                </div>
              </td>
              <td class="px-6">
                <div class="flex space-x-3">
                  <RouterLink :to="'/patient/' + patient_id + '/billing-informations/' + billing_info.id" class="font-semibold bg-orange-500 px-2 py-1 rounded-md text-white">Edit invoice</RouterLink>
                  <button @click="deleteInvoice(billing_info.id)" class="font-semibold bg-red-500 px-2 py-1 rounded-md text-white">Delete invoice</button>
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
import axios from "axios";
import {onMounted} from "vue";
import {ref} from "vue";
import {useRoute} from "vue-router";
import router from "@/router";
import Swal from "sweetalert2";

const user = ref({});
const route = useRoute();
const patient_id = route.params.patient_id;
const billing_infos = ref([]);

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

const deleteInvoice = (id: number) => {
  Swal.fire({
    title: "Are you sure you want to delete this recipe?",
    showCancelButton: true,
    confirmButtonText: "Yes",
  }).then(async(result) => {
    if (result.isConfirmed) {
      await axios.delete('http://api.infomed.develop.eiddew.com/api/billing-informations/' + id)
          .then((response) => {
            console.log(response)
            if(response.data.status === true) {
              let i = billing_infos.value.map(item => item.id).indexOf(id);
              if(i >= 0) {
                billing_infos.value.splice(i, 1);
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

const getBillingInfo = async () => {
  axios.get('http://api.infomed.develop.eiddew.com/api/billing-informations', {
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
        decryptedData.forEach((billing_info) => {
          billing_info.services = JSON.parse(billing_info.services);
          billing_infos.value.push(billing_info);
        })

        console.log(billing_infos.value);
      })
}

const goToPacientPage = () => {
  router.push({name: 'patient', params: {patient_id: patient_id}});
}

onMounted(async () => {
  await getUser();
  await getBillingInfo();
})
</script>
