<template>
  <div class="flex flex-col justify-between items-center h-screen text-white">
    <Navbar />
    <div class="h-full w-full">
      <slot />
    </div>
    <div class="flex flex-col items-center">
      <Piano />
      <BottomBar />
    </div>
  </div>
</template>
