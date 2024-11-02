<script setup lang="ts">
const opened = defineModel({ default: false });
</script>

<template>
  <!-- Open Button -->
  <div
    class="cursor-pointer"
    :class="{ 'bg-opacity-85': opened }"
    @click="opened = !opened"
  >
    <slot name="button" />
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
