<template>
  <div class="flex flex-col items-center text-white h-screen">
    <Navbar />
    <div class="grow  w-full">
      <slot />
    </div>
    <Piano />
    <BottomBar />
  </div>
</template>
