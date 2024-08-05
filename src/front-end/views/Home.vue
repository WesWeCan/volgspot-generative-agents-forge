<script setup lang="ts">

import Agents from '../components/Agents.vue';


import { ref, onMounted } from 'vue';

import { ComfyClient } from '../assets/ComfyClient';
import Articles from '../components/Articles.vue';

</script>

<template>
  
  <Agents></Agents> 


  <Articles></Articles>
</template>

