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
      <p class="text-3xl text-fuchsia-800 font-semibold">Recipes</p>
      <div class="flex justify-end mr-1">
        <RouterLink :to="'/patient/' + patient_id + '/recipes/add-recipe'" class="bg-fuchsia-800 text-white font-semibold px-3 py-2 rounded-md">Add recipe</RouterLink>
      </div>
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-16">
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
              Medications
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
          <template v-for="(recipe, recipe_index) in recipes">
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td>
                <div class="px-6">
                  <div class="text-base font-semibold">{{ recipe_index + 1 }}</div>
                </div>
              </td>
              <th scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                <div>
                  <div class="text-base font-semibold">
                    {{ recipe.name }}
                  </div>
                </div>
              </th>
              <td>
                <div class="px-6">
                  <div class="text-base font-semibold">
                    <template v-for="(key) in Object.keys(recipe.medications)">
                      <div>
                        <span class="font-bold text-fuchsia-800">{{key}}:</span> {{recipe.medications[key].dose}}, {{recipe.medications[key].frequency}}, {{recipe.medications[key].administration}}
                      </div>
                    </template>
                  </div>
                </div>
              </td>
              <td>
                <div class="px-6">
                  <div class="text-base font-semibold">{{ recipe.notes }}</div>
                </div>
              </td>
              <td class="px-6">
                <div class="flex space-x-3">
                  <RouterLink :to="'/patient/' + patient_id + '/recipes/' + recipe.id" class="font-semibold bg-orange-500 px-2 py-1 rounded-md text-white">Edit recipe</RouterLink>
                  <button @click="deleteRecipe(recipe.id)" class="font-semibold bg-red-500 px-2 py-1 rounded-md text-white">Delete recipe</button>
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
import router from "@/router";

const route = useRoute();
const patient_id = route.params.patient_id;
const recipes = ref([]);
const user = ref({});

const key = ref('14e3927e8e3253b9b8a46581ef959f09fa3c8fb06f85f49dbf2e0ee05a03b9cd');
const iv = ref('edfc99088cfa3fbb5da7eb1af5f15af3');

const deleteRecipe = (id: number) => {
  Swal.fire({
    title: "Are you sure you want to delete this recipe?",
    showCancelButton: true,
    confirmButtonText: "Yes",
  }).then(async(result) => {
    if (result.isConfirmed) {
      await axios.delete('http://api.infomed.develop.eiddew.com/api/recipes/' + id)
          .then((response) => {
            if(response.data.status === true) {
              let i = recipes.value.map(item => item.id).indexOf(id);
              if(i >= 0) {
                recipes.value.splice(i, 1);
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

const getRecipes = async () => {
  axios.get('http://api.infomed.develop.eiddew.com/api/recipes', {
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
          medical_record.medications = JSON.parse(medical_record.medications);

          recipes.value.push(medical_record);
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
  await getRecipes();
  await getUser();
})

</script>
