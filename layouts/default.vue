<script setup lang="ts">
const show = ref(false);
</script>

<template>
  <div
    class="flex flex-col transition-all duration-500 text-white h-screen overflow-hidden"
  >
    <div class="absolute right-0 z-10 cursor-pointer" @click="show = !show"><span v-if="!show">Show</span> <span v-else>Hide</span> bottom bar</div>

    <Navbar />
    <div class="grow w-full">
      <slot />
    </div>
    <Piano />
    <transition name="slide">
      <BottomBar v-if="show" />
    </transition>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from,
.slide-leave-to {
  height: 0;
}
</style>
