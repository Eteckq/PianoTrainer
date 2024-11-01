<script setup lang="ts">
const opened = defineModel({ default: false });
</script>

<template>
  <!-- Open Button -->
  <div
    class="py-2 px-4 bg-pallet-secondary rounded cursor-pointer relative"
    :class="{ 'bg-opacity-85': opened }"
    @click="opened = !opened"
  >
    <slot name="title" />
  </div>
  <!-- Modal -->
  <ParamModal v-model="opened">
    <template #title>
      <slot name="title" />
    </template>
    <template #content>
      <slot name="content" />
    </template>
  </ParamModal>
</template>
