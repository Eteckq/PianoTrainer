<script setup lang="ts">
const pages = [{
    to: '/',
    name: 'Visualizer'
},{
    to: '/analyzer',
    name: 'Identifier'
},{
    to: '/bank',
    name: 'Bank'
},{
    to: '/train',
    name: 'Training'
}]
</script>

<template>
  <div class="flex justify-center text-pallet-text items-center gap-4 h-12">
    <NuxtLink v-for="page in pages" :to="page.to" active-class="font-medium text-pallet-white">{{ page.name }}</NuxtLink>
  </div>
</template>
