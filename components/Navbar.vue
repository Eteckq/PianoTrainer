<script setup lang="ts">
const pages = [{
    to: '/',
    name: 'Index'
},{
    to: '/bank',
    name: 'Bank'
}]
</script>

<template>
  <div class="flex justify-center items-center gap-4">
    <NuxtLink v-for="page in pages" :to="page.to" active-class="font-medium">{{ page.name }}</NuxtLink>
  </div>
</template>
