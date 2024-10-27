<template>
  <div class="">
    <canvas @click="pressNote" ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { emitNoteOff, emitNoteOn, NoteOrigin } from "~/src/NoteHandler";
import { PianoCanvas } from "~/src/PianoCanvas";
const canvas = ref(null);
let keyboardCanvas: PianoCanvas | undefined;
onMounted(() => {
  if (!canvas.value) return;

  keyboardCanvas = new PianoCanvas(canvas.value);
  window.addEventListener("resize", function (event) {
    keyboardCanvas?.resize();
  });
});

function pressNote(e: MouseEvent) {

  const note = keyboardCanvas?.getKeyAtPoint(e);
  if (!note) return;
  emitNoteOn(note.note, 40, NoteOrigin.MOUSE);
  // piano.pressKey(note.note, 40);
  setTimeout(() => {
    emitNoteOff(note.note, NoteOrigin.MOUSE);
    // piano.unpressKey(note.note);
  }, 1000);
}
</script>
