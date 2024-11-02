<script setup lang="ts">
const show = ref(false);
</script>

<template>
  <div
    class="flex flex-col transition-all duration-500 text-white h-screen overflow-hidden"
  >
    <div
      class="absolute bottom-2 right-2 z-10 cursor-pointer"
      @click="show = !show"
    >
      <span :class="{ 'opacity-50': !show }">⚙️</span>
    </div>
    <Navbar />
    <div class="grow w-full">
      <slot />
    </div>
    <Piano />
    <BottomBar
      class="transition-all duration-500"
      :class="[show ? 'h-20' : 'h-0']"
    />
  </div>
</template>
