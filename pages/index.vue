<script setup lang="ts">
import type { ChordInfo } from "~/src";
import { analyze } from "~/src/ChordAnalyser";
import { on, pressedKeys } from "~/src/NoteHandler";

const result: Ref<ChordInfo[]> = ref([]);

on("note:on", () => {
  result.value = analyze(pressedKeys.map((k) => k.midi));
});
on("note:off", () => {
  result.value = analyze(pressedKeys.map((k) => k.midi));
});
// console.log("Cmaj", analyze([60, 64, 67]));
// console.log("Cmaj inversion 1", analyze([64, 67, 72]));
// console.log("Cmaj inversion 2", analyze([55, 60, 64]));
// console.log("Cmaj w/ too much notes", analyze([60, 64, 67, 72]));
// console.log("Minor 11th", analyze([48, 51, 55, 58, 62, 65]));
// console.log("Minor 11th w/ too much notes", analyze([39,48, 51, 55, 58, 62, 65]));
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full">
    <div class="py-2 flex gap-4 items-baseline" v-for="res of result">
      <p class="text-4xl">{{ res.chord }}</p>
      <p class="text-2xl text-gray-400">({{ res.name }})</p>
      <p class="text-xl text-gray-500" v-if="res.inversion">
        Inversion {{ res.inversion }}
      </p>
    </div>
  </div>
</template>
