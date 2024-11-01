<script setup lang="ts">
import { keys } from '~/src/renders/piano';


</script>

<template>
  <div class="w-full h-full">
    <Visualizer v-if="keys.length > 0" />
  </div>
</template>
