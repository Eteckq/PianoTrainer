<template>
  <div class="flex flex-col justify-between items-center h-screen">
    <div class="text-white">
      <slot />
    </div>
    <div class="flex flex-col items-center">
      <Piano />
      <BottomBar />
    </div>
  </div>
</template>
