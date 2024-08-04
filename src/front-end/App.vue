<script setup lang="ts">
import { onMounted, ref, provide } from 'vue';


const apiUrl = ref("https://volgspot-de-spark.test/api");

provide("apiUrl", apiUrl);

onMounted(async () => {
    console.log(window.electronAPI, window.sparkAPI);
});





</script>

<template>


    <h1>Volgspot Generative Agents</h1>
    <input v-model="apiUrl" placeholder="API URL">

    <RouterView></RouterView>

</template>