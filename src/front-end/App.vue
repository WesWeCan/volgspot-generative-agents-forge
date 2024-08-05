<script setup lang="ts">
import { onMounted, ref, provide } from 'vue';

// @ts-ignore
import bgVideo from './assets/bg.mp4';

const apiUrl = ref("https://volgspot-de-spark.test/api");

provide("apiUrl", apiUrl);

onMounted(async () => {
    console.log(window.electronAPI, window.sparkAPI);

    video.value.playbackRate = 0.7;
});


const openDataFolder = () => {
    window.sparkAPI.openDataFolderInExplorer();
}

const video = ref<HTMLVideoElement>();




</script>

<template>
    <div class="bg">
        <video :src="bgVideo" autoplay muted loop ref="video"></video>
    </div>


    


    <h1>Volgspot Generative Agents</h1>

    <form @submit.prevent>
        <label for="apiUrl">API URL</label>
        <input v-model="apiUrl" placeholder="API URL">
    </form>

    <button @click="openDataFolder()" >
      Naar data map
    </button>

    <RouterView></RouterView>

</template>