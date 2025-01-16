<script setup lang="ts">
import {RouterLink, RouterView, useRoute} from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import Navbar from "@/components/Navbar.vue";
import "vue-multiselect/dist/vue-multiselect.css";


const route = useRoute();

</script>

<template>
  <Navbar v-if="route.name !== 'login' && route.name !== 'register'"></Navbar>
  <RouterView />
</template>

