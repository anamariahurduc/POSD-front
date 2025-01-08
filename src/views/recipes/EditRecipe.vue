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
    <p class="text-3xl font-semibold text-fuchsia-800 text-center mt-10">Edit recipe</p>
    <div class="w-full flex justify-center">
      <div class="w-80 mt-10">
        <div class="flex flex-col">
          <label class="text-sm text-fuchsia-800" for="doctor">Name</label>
          <input v-model="recipe.name" type="text" class="border border-1 p-1 rounded-md">
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-fuchsia-800 mt-5" for="doctor">Medications</label>
          <template v-for="key in Object.keys(recipe.medications)">
            <div>
              <span class="font-bold text-fuchsia-800">{{key}}:</span> {{ recipe.medications[key].dose }}, {{ recipe.medications[key].frequency }}, {{recipe.medications[key].administration}}
            </div>
          </template>
        </div>
        <template v-if="button_open == false">
          <button @click="openMedicationInputs()" class="items-center font-semibold bg-fuchsia-800 px-2 py-1 rounded-md text-white">Add medication</button>
        </template>
        <template v-if="add_medication">
          <div class="flex flex-col">
            <label class="text-sm text-fuchsia-800 mt-4" for="doctor">Name</label>
            <input v-model="medication.name" type="text" class="border border-1 p-1 rounded-md">
          </div>
          <div class="flex flex-col">
            <label class="text-sm text-fuchsia-800" for="doctor">Dose</label>
            <select v-model="medication.dose" id="doctor" class="border border-1 rounded-md p-1">
              <option>5 mg</option>
              <option>10 mg</option>
              <option>25 mg</option>
              <option>50 mg</option>
              <option>100 mg</option>
            </select>
          </div>
          <div class="flex flex-col">
            <label class="text-sm text-fuchsia-800" for="doctor">Frequency</label>
            <select v-model="medication.frequency" id="doctor" class="border border-1 rounded-md p-1">
              <option>once a day</option>
              <option>twice a day</option>
              <option>three times a day</option>
              <option>once a week</option>
            </select>
          </div>
          <div class="flex flex-col">
            <label class="text-sm text-fuchsia-800" for="doctor">Administration</label>
            <select v-model="medication.administration" id="doctor" class="border border-1 rounded-md p-1">
              <option>subcutaneous injection</option>
              <option>oral</option>
            </select>
          </div>
          <button @click="addMedication()" class="items-center font-semibold bg-fuchsia-800 px-2 py-1 mt-4 rounded-md text-white">Add</button>
        </template>

        <div class="flex flex-col">
          <label class="text-sm text-fuchsia-800 mt-5" for="doctor">Notes</label>
          <textarea v-model="recipe.notes" type="text" class="border border-1 p-1 rounded-md"/>
        </div>
        <div class="mt-5 ml-20">
          <button @click="updateRecipe()" class="items-center font-semibold bg-fuchsia-800 px-2 py-1 rounded-md text-white">Save</button>
          <RouterLink :to="'/patient/' + patient_id + '/recipes'" class="items-center font-semibold bg-red-500 px-2 py-1 ml-5 rounded-md text-white">Cancel</RouterLink>
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
const recipe_id = route.params.recipe_id;
const recipe = ref({});
const user = ref({});
const doctors = ref([]);
const recipes = ref([]);
const isLoading = ref(true);
const add_medication = ref(false);
const button_open = ref(false);
const medication = ref({});
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

const openMedicationInputs = async () => {
  button_open.value = true;
  add_medication.value = true;
}

const addMedication = async () => {
  recipe.value.medications[medication.value.name] = {
    administration: medication.value.administration,
    dose: medication.value.dose,
    frequency: medication.value.frequency
  }

  add_medication.value = false;
  button_open.value = false;
  medication.value = {};
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

const getDoctors = async() => {
  await axios.get('http://api.infomed.develop.eiddew.com/api/get-doctors')
      .then(async (response) => {
        const keyArray = hexStringToUint8Array(key.value);
        const ivArray = hexStringToUint8Array(iv.value);

        const encryptedArray = base64ToUint8Array(response.data.encrypted_data);
        const decryptedText = await decryptAES(encryptedArray, keyArray, ivArray);

        const decryptedData = JSON.parse(decryptedText);

        decryptedData.forEach((doctor) => {
          doctors.value.push(doctor);
        })
      })
}

const getRecipes = async() => {
  await axios.get('http://api.infomed.develop.eiddew.com/api/recipes',
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

        decryptedData.forEach((recipe) => {
          recipes.value.push(recipe);
        })
      })
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
const getRecipe = async () => {
  axios.get('http://api.infomed.develop.eiddew.com/api/recipes/' + recipe_id)
      .then(async (response) => {
        const keyArray = hexStringToUint8Array(key.value);
        const ivArray = hexStringToUint8Array(iv.value);

        const encryptedArray = base64ToUint8Array(response.data.encrypted_data);
        const decryptedText = await decryptAES(encryptedArray, keyArray, ivArray);

        recipe.value = JSON.parse(decryptedText);
        recipe.value.medications = JSON.parse(recipe.value.medications);
      })
}

const updateRecipe = async () => {
  const updatedRecipe = JSON.stringify(recipe.value);

  const keyArray = hexStringToUint8Array(key.value);
  const ivArray = hexStringToUint8Array(iv.value);

  const encryptedData = await encryptAES(updatedRecipe, keyArray, ivArray);

  const encryptedBase64Data = uint8ArrayToBase64(encryptedData);

  axios.put('http://api.infomed.develop.eiddew.com/api/recipes/' + recipe_id, {
    encrypted_data: encryptedBase64Data
  })
      .then(response => {
        Swal.fire({
          title: "Success",
          text: 'Recipe updated successfully!',
          icon: "success"
        });

        router.push({ name: 'recipes'});
      })
      .catch(error => {
        console.error('Error updating the recipe:', error);
      });
}

onMounted(async() => {
  await getRecipe();
  await getUser();
  await getDoctors();
  await getRecipes();
  isLoading.value = false;
})
</script>
