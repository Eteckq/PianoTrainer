<template>
  <div class="relative">
    <Chat
      v-if="connected"
      class="absolute left-2 -top-72"
    />
    <canvas @click="pressNote" ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import {
  emitNoteOff,
  emitNoteOn,
  NoteOrigin,
  pressedKeys,
} from "~/src/NoteHandler";
import {
  getKeyAtPoint,
  initCanvas,
  pianoCanvas,
  resize,
} from "~/src/renders/piano";
import { connected } from "~/src/socket";

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

  if (!pressedKeys.some((k) => k.midi == key.note.midi)) {
    emitNoteOn(key.note.midi, 40, NoteOrigin.MOUSE);
    setTimeout(() => {
      emitNoteOff(key.note.midi, NoteOrigin.MOUSE);
    }, 1800);
  } else {
    emitNoteOff(key.note.midi, NoteOrigin.MOUSE);
  }
}
</script>
