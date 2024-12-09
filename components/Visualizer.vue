<script setup lang="ts">
import { Application, type ApplicationInst } from "vue3-pixi";
import {
  emitSustainOff,
  emitSustainOn,
  NoteOrigin,
  off,
  on,
} from "~/src/NoteHandler";
import {
  drawRectangle,
  initializeTicks,
  mountInit,
  rectangleConfig,
  rects,
  setMounted,
  toggleEmit,
  updateParticles,
  visualizeReady,
} from "~/src/renders/visualizer";
import { pianoCanvas } from "~/src/renders/piano";
import { sustain, volume } from "~/src/audio/engine";
const application: Ref<ApplicationInst | null> = ref(null);
const topDiv: Ref<HTMLElement | null> = ref(null);

function onNote(midi: number) {
  toggleEmit(midi, true);
}
function offNote(midi: number) {
  toggleEmit(midi, false);
}

onMounted(() => {
  const app = application.value?.app;
  const canvas = application.value?.canvas;
  if (!app || !canvas || !topDiv.value) return;

  mountInit(app, canvas, topDiv.value);

  initializeTicks();
  setMounted(true);
  on("note:on", onNote);
  on("note:off", offNote);
});

onUnmounted(() => {
  setMounted(false);
  visualizeReady.value = false;
  off("note:on", onNote);
  off("note:off", offNote);
});
</script>

<template>
  <div class="h-full w-full relative overflow-hidden" ref="topDiv">
    <div class="absolute right-2 bottom-4 z-10 flex items-center gap-2">
      <div class="w-24">
        <input
          type="range"
          class="volume"
          v-model="volume"
          max="1"
          min="0"
          step="0.05"
        />
      </div>
      <div
        class="cursor-pointer inline-block"
        @click="
          !sustain
            ? emitSustainOn(NoteOrigin.MOUSE)
            : emitSustainOff(NoteOrigin.MOUSE)
        "
        :class="{ 'opacity-40': !sustain }"
      >
        🟦
      </div>
    </div>

    <div
      class="absolute z-10 top-0 left-0 flex gap-4 w-full px-4 mt-2"
      v-if="visualizeReady"
    >
      <Param>
        <template #button> ✨ </template>
        <template #title> Particles Configuration </template>
        <template #content>
          <ParamParticles @update="updateParticles" />
        </template>
      </Param>

      <Param>
        <template #button> 🟦 </template>
        <template #title> Keys Configuration </template>
        <template #content>
          <JsonEditorVue v-model="rectangleConfig" />
        </template>
      </Param>

      <Recorder v-if="application?.canvas && pianoCanvas" />
    </div>
    <Application
      :background-alpha="rectangleConfig.bg.alpha"
      :background-color="rectangleConfig.bg.color"
      ref="application"
      class="absolute bottom-0"
    >
      <Graphics v-for="rect in rects" @render="drawRectangle($event, rect)">
        <BlurFilter
          :strength="rectangleConfig.strength"
          :blur="rectangleConfig.blur"
        />
      </Graphics>
    </Application>
  </div>
</template>

<style scoped>
.volume {
  background: url("/volume.png") no-repeat;
  width: 100%;
  height: 100%;
  background-position: 50% 50%;
  -webkit-appearance: none;
}
</style>
