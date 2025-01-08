<template>
  <div>
    <div class="flex space-x-10 justify-center text-xl font-semibold p-3 bg-fuchsia-800 text-white">
      <p>First name: {{user.first_name}}</p>
      <p>Last name: {{user.last_name}}</p>
      <p>Email: {{user.email}}</p>
      <p>Date of birth: {{getAge(user.date_of_birth)}}</p>
      <p>Gender: {{user.gender}}</p>
    </div>
    <p class="text-3xl font-semibold text-fuchsia-800 text-center mt-10">Edit medical record</p>
    <div class="w-full flex justify-center">
      <div class="w-[450px] mt-10 p-8 border border-1 border-gray-100 shadow-lg rounded-md space-y-1">
        <div class="flex flex-col">
          <label class="text-sm text-fuchsia-800" for="doctor">Doctor</label>
          <select v-model="medical_record.doctor_id" id="doctor" class="border border-1 rounded-md p-1">
            <option :value="doctor.id" v-for="doctor in doctors">{{doctor.first_name}} {{doctor.last_name}}</option>
          </select>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-fuchsia-800" for="doctor">Diagnosis</label>
          <input v-model="medical_record.diagnosis" type="text" class="border border-1 p-1 rounded-md">
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-fuchsia-800" for="doctor">Procedures</label>
          <textarea v-model="medical_record.procedures" type="text" class="border border-1 p-1 rounded-md"/>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-fuchsia-800" for="doctor">Notes</label>
          <textarea v-model="medical_record.notes" type="text" class="border border-1 p-1 rounded-md"/>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-fuchsia-800" for="doctor">Recipe</label>
          <select v-model="medical_record.recipe_id" id="doctor" class="border border-1 rounded-md p-1">
            <option :value="recipe.id" v-for="recipe in recipes">{{recipe.name}}</option>
          </select>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-fuchsia-800" for="doctor">Laboratory Results</label>
          <VueMultiselect
              v-model="selected_lab_results"
              :options="lab_results"
              track-by="id"
              label="test_type"
              multiple>
          </VueMultiselect>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import {useRoute} from "vue-router";
import {onMounted, ref, watch} from "vue";
import VueMultiselect from 'vue-multiselect'

const key = ref('14e3927e8e3253b9b8a46581ef959f09fa3c8fb06f85f49dbf2e0ee05a03b9cd');
const iv = ref('edfc99088cfa3fbb5da7eb1af5f15af3');
const route = useRoute();
const patient_id = route.params.patient_id;
const record_id = route.params.record_id;
const medical_record = ref({});
const user = ref({});
const doctors = ref([]);
const recipes = ref([]);
const lab_results = ref([]);
const selected_lab_results = ref([]);

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
const getMedicalRecord = async () => {
  axios.get('http://api.infomed.develop.eiddew.com/api/medical-records/' + record_id)
      .then(async (response) => {
        const keyArray = hexStringToUint8Array(key.value);
        const ivArray = hexStringToUint8Array(iv.value);

        const encryptedArray = base64ToUint8Array(response.data.encrypted_data);
        const decryptedText = await decryptAES(encryptedArray, keyArray, ivArray);

        medical_record.value = JSON.parse(decryptedText);

        medical_record.value.lab_result_ids = JSON.parse(medical_record.value.lab_result_ids);
        medical_record.value.lab_result_ids.forEach(id => {
          let lab_result = lab_results.value.find(el => el.id === id);
          if(lab_result !== undefined) {
            selected_lab_results.value.push(lab_result);
          }
        })
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

        lab_results.value = JSON.parse(decryptedText);
      })
}

watch(selected_lab_results, (newVal, oldVal) => {
  selected_lab_results.value.forEach(lab_result => {
    if(!medical_record.value.lab_result_ids.some(item => item.id === lab_result.id)) {
      medical_record.value.lab_result_ids.push(lab_result.id);
    }
  })
});

onMounted(async() => {
  await getUser();
  await getDoctors();
  await getRecipes();
  await getLabResults();
  await getMedicalRecord();
})
</script>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
