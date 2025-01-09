<template>
  <div>
    <div class="flex space-x-10 justify-center text-xl font-semibold p-3 bg-fuchsia-800 text-white" v-if="auth_user.roles[0].name !== 'patient'">
      <p>First name: {{user.first_name}}</p>
      <p>Last name: {{user.last_name}}</p>
      <p>Email: {{user.email}}</p>
      <p>Date of birth: {{getAge(user.date_of_birth)}}</p>
      <p>Gender: {{user.gender}}</p>
    </div>

    <div class="flex space-x-7 mx-5 mt-28 justify-center">
      <div class="font-bold text-4xl p-2 text-center flex items-center justify-center">
        <RouterLink :to="'/patient/' + patient_id + '/medical-records'">
          <div class="cursor-pointer p-2">
            <img class="h-72 px-3 bg-white" src="@/assets/img/medical-records.jpg">
            <p>Medical record</p>
          </div>
        </RouterLink>
      </div>
      <div v-if="auth_user.roles[0].name !== 'nurse'" class="font-bold text-4xl p-2 text-center flex items-center justify-center">
        <div class="cursor-pointer p-2">
          <RouterLink :to="'/patient/' + patient_id + '/laboratory-results'">
            <img class="h-72 bg-white pb-5" src="@/assets/img/image.png">
            <p>Laboratory results</p>
          </RouterLink>
        </div>
      </div>
      <div v-if="auth_user.roles[0].name !== 'nurse'" class="font-bold text-4xl p-2 text-center flex items-center justify-center">
        <div class="cursor-pointer p-2">
          <RouterLink :to="'/patient/' + patient_id + '/recipes'">
            <div class="cursor-pointer p-2">
              <img class="h-72 bg-white" src="@/assets/img/recipe.jpg">
              <p>Recipes</p>
            </div>
          </RouterLink>
        </div>
      </div>
      <div v-if="auth_user.roles[0].name === 'administrator' || auth_user.roles[0].name === 'patient' || auth_user.roles[0].name === 'doctor'" class="font-bold text-4xl p-2 text-center flex items-center justify-center">
        <div class="cursor-pointer p-2">
          <RouterLink :to="'/patient/' + patient_id + '/billing-informations'">
            <div class="cursor-pointer p-2">
              <img class="h-72 bg-white" src="@/assets/img/billing.jpg">
              <p>Billing info</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";
import {useAuthUserStore} from "@/store/AuthUser";

const route = useRoute();
const patient_id = route.params.patient_id;
const user = ref({});

const key = ref('14e3927e8e3253b9b8a46581ef959f09fa3c8fb06f85f49dbf2e0ee05a03b9cd');
const iv = ref('edfc99088cfa3fbb5da7eb1af5f15af3');
const authUserStore = useAuthUserStore();
const auth_user = authUserStore.getUser();

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

onMounted(async() => {
  await getUser()
})
</script>
