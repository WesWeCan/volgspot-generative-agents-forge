<script setup lang="ts">
import { injectStrict, ExampleKey } from '../assets/Manager';

let example = injectStrict(ExampleKey);



</script>


<template>

    <button @click="example.count++">Button pressed {{ example.count }} times</button>

</template>