<script setup lang="ts">
import { soundInitied } from "~/src/audio/engine";

const pages = [
  {
    to: "/",
    name: "Visualizer",
  },
  {
    to: "/analyzer",
    name: "Identifier",
  },
  {
    to: "/bank",
    name: "Bank",
  },
  {
    to: "/train",
    name: "Training",
  },
  {
    to: "/hero",
    name: "Hero",
  },
];
</script>

<template>
  <div class="w-full absolute z-20 mt-20 md:mt-0">
    <ParamSocket v-if="soundInitied" />
  </div>
  <div
    class="flex justify-center md:justify-end lg:justify-end xl:justify-center text-pallet-text items-center gap-4 h-12 px-4"
  >
    <NuxtLink
      v-for="page in pages"
      :to="page.to"
      active-class="font-medium text-pallet-white"
    >
      {{ page.name }}
    </NuxtLink>
  </div>
</template>
