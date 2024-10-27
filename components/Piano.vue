<template>
  <div class="">
    <canvas @click="pressNote" ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { emitNoteOff, emitNoteOn, NoteOrigin } from "~/src/NoteHandler";
import { getKeyAtPoint, initCanvas, resize } from "~/src/renders/piano";
const canvas = ref(null);
onMounted(() => {
  if (!canvas.value) return;
  initCanvas(canvas.value);
  window.addEventListener("resize", function (event) {
    resize();
  });
});

function pressNote(e: MouseEvent) {
  const key = getKeyAtPoint(e);
  if (!key) return;
  emitNoteOn(key.note.midi, 40, NoteOrigin.MOUSE);
  setTimeout(() => {
    emitNoteOff(key.note.midi, NoteOrigin.MOUSE);
  }, 10000);
}
</script>
