<script setup lang="ts">
const show = ref(false);
</script>

<template>
  <div
    class="flex flex-col transition-all duration-500 text-white h-screen overflow-hidden"
  >
    <div
      class="absolute top-2 right-2 z-10 cursor-pointer"
      @click="show = !show"
    >
      <span v-if="!show">Show</span> <span v-else>Hide</span> bottom bar
    </div>

    <Navbar />
    <div class="grow w-full">
      <slot />
    </div>
    <Piano />
    <BottomBar class="transition-all duration-500" :class="{ 'h-0': !show }" />
  </div>
</template>
