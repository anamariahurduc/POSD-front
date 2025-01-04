<template>
  <div>
    hello medical records
  </div>
</template>

<script setup lang="ts">

import {useRoute} from "vue-router";
import axios from "axios";
import {onMounted} from "vue";

const route = useRoute();
const patient_id = route.params.patient_id;

const getMedicalRecords = async() => {
  axios.get('http://api.infomed.develop.eiddew.com/api/medical-records', {
    params: {
      patient_id: patient_id
    }
  })
      .then((response) => {

      })
}

onMounted(async() => {
  await getMedicalRecords();
})

</script>
