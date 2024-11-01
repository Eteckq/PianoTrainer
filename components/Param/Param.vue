<script setup lang="ts">
const opened = defineModel({ default: false });
</script>

<template>
  <!-- Open Button -->
  <div
    class="py-2 px-4 bg-slate-100 rounded cursor-pointer relative"
    :class="{ 'bg-slate-300': opened }"
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
