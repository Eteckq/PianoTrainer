<template>
  <div class="bg-red-400">
    <canvas @click="pressNote" ref="canvas" class="bg-blue-400"></canvas>
    <p class="text-red-600">
      {{ keyboardCanvas?.getPressedKeys() }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { PianoCanvas } from "~/src/PianoCanvas";

const canvas = ref(null);
const keyboardCanvas: Ref<PianoCanvas | undefined> = ref();

onMounted(() => {
  if (!canvas.value) return;
  keyboardCanvas.value = new PianoCanvas(canvas.value);

  window.addEventListener("resize", function (event) {
    keyboardCanvas.value?.resize();
  });
});

function pressNote(e: MouseEvent) {
  const note = keyboardCanvas.value?.getKeyAtPoint(e);
  if (!note) return;
  console.log(note.note);

  keyboardCanvas.value?.pressKey(note.note, 1);
  setTimeout(() => {
    keyboardCanvas.value?.unpressKey(note.note);
  }, 1000);
  keyboardCanvas.value?.redraw();
}
</script>
