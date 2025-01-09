<template>
  <div>
    <div class="flex space-x-10 justify-center text-xl font-semibold p-3 bg-fuchsia-800 text-white">
      <p>First name: {{user.first_name}}</p>
      <p>Last name: {{user.last_name}}</p>
      <p>Email: {{user.email}}</p>
      <p>Date of birth: {{getAge(user.date_of_birth)}}</p>
      <p>Gender: {{user.gender}}</p>
    </div>
    <template v-if="isLoading">
      Is loading...
    </template>
    <template v-else>
      <p class="text-3xl font-semibold text-fuchsia-800 text-center mt-10">Add invoice</p>
      <div class="w-full flex justify-center">
        <div class="w-80 mt-10">
          <div class="flex flex-col">
            <label class="text-sm text-fuchsia-800" for="doctor">Invoice number</label>
            <input v-model="billing_information.invoice_number" type="text" class="border border-1 p-1 rounded-md">
          </div>
          <div class="flex flex-col">
            <label class="text-sm text-fuchsia-800 mt-5" for="doctor">Services</label>
            <template v-for="key in Object.keys(billing_information.services)">
              <div>
                <span class="font-bold text-fuchsia-800">{{billing_information.services[key].service_name}}:</span>
                <div>
                  - {{billing_information.services[key].price}} RON
                </div>
              </div>
            </template>
          </div>
          <template v-if="button_open == false">
            <button @click="openServicesInputs()" class="items-center font-semibold bg-fuchsia-800 px-2 py-1 rounded-md text-white">Add service</button>
          </template>
          <template v-if="add_service">
            <div class="flex flex-col">
              <label class="text-sm text-fuchsia-800 mt-4" for="doctor">Type</label>
              <select v-model="service.type" id="doctor" class="border border-1 rounded-md p-1">
                <option>lab tests</option>
                <option>consultations</option>
              </select>
            </div>
            <div class="flex flex-col">
              <label class="text-sm text-fuchsia-800" for="doctor">Name</label>
              <input v-model="service.service_name" type="text" class="border border-1 p-1 rounded-md">
            </div>
            <div class="flex flex-col">
              <label class="text-sm text-fuchsia-800" for="doctor">Price</label>
              <input v-model="service.price" type="text" class="border border-1 p-1 rounded-md">
            </div>
            <button @click="addService()" class="items-center font-semibold bg-fuchsia-800 px-2 py-1 mt-4 rounded-md text-white">Add</button>
          </template>
          <div class="mt-5 ml-20">
            <button @click="addInvoice()" class="items-center font-semibold bg-fuchsia-800 px-2 py-1 rounded-md text-white">Save</button>
            <RouterLink :to="'/patient/' + patient_id + '/billing-informations'" class="items-center font-semibold bg-red-500 px-2 py-1 ml-5 rounded-md text-white">Cancel</RouterLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import Swal from "sweetalert2";

const router = useRouter();
const key = ref('14e3927e8e3253b9b8a46581ef959f09fa3c8fb06f85f49dbf2e0ee05a03b9cd');
const iv = ref('edfc99088cfa3fbb5da7eb1af5f15af3');
const route = useRoute();
const patient_id = route.params.patient_id;
const billing_information_id = route.params.billing_information_id;
const billing_information = ref({
  services: {}
});
const user = ref({});
const isLoading = ref(true);
const add_service = ref(false);
const button_open = ref(false);
const service = ref({
  price: '',
  service_name: ''
});
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

const openServicesInputs = async () => {
  button_open.value = true;
  add_service.value = true;
}

const addService = async () => {
  billing_information.value.services[service.value.type] = {
    price: service.value.price,
    service_name: service.value.service_name
  }

  add_service.value = false;
  button_open.value = false;
  service.value = {};
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

const addInvoice = async () => {
  let price = 0;
  Object.keys(billing_information.value.services).forEach((service_key) => {
    price += Number(billing_information.value.services[service_key].price);
  })

  billing_information.value.amount = price.toString();

  const updatedRecipe = JSON.stringify(billing_information.value);

  const keyArray = hexStringToUint8Array(key.value);
  const ivArray = hexStringToUint8Array(iv.value);

  const encryptedData = await encryptAES(updatedRecipe, keyArray, ivArray);

  const encryptedBase64Data = uint8ArrayToBase64(encryptedData);

  axios.post('http://api.infomed.develop.eiddew.com/api/billing-informations', {
    encrypted_data: encryptedBase64Data,
    patient_id: patient_id
  })
      .then(response => {
        Swal.fire({
          title: "Success",
          text: 'Recipe created successfully!',
          icon: "success"
        });

        router.push({ name: 'billing-informations'});
      })
      .catch(error => {
        console.error('Error updating the recipe:', error);
      });
}
onMounted(async() => {
  await getUser();
  isLoading.value = false;
})
</script>
