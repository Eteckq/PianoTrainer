<script setup lang="ts">
import { Application, type ApplicationInst } from "vue3-pixi";
import { off, on } from "~/src/NoteHandler";
import {
  drawRectangle,
  initializeTicks,
  mountInit,
  rectangleConfig,
  rects,
  setMounted,
  toggleEmit,
  updateParticles,
} from "~/src/renders/visualizer";
import { isRecording, record } from "~/src/renders/recorder";
import { pianoCanvas } from "~/src/renders/piano";

const application: Ref<ApplicationInst | null> = ref(null);
const topDiv: Ref<HTMLElement | null> = ref(null);

onMounted(() => {
  const app = application.value?.app;
  const canvas = application.value?.canvas;
  if (!app || !canvas || !topDiv.value) return;

  mountInit(app, canvas, topDiv.value);

  initializeTicks();
  setMounted(true);
  on("note:on", (midi) => toggleEmit(midi, true));
  on("note:off", (midi) => toggleEmit(midi, false));
});

onUnmounted(() => {
  setMounted(false);
  off("note:on", (midi) => toggleEmit(midi, true));
  off("note:off", (midi) => toggleEmit(midi, false));
});
</script>

<template>
  <div class="h-full w-full relative overflow-hidden" ref="topDiv">
    <div class="absolute z-10 top-0 left-0 flex gap-4 w-full px-4 mt-2">
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

      <div
        v-if="application?.canvas && pianoCanvas"
        @click="record(application.canvas, pianoCanvas)"
        class="cursor-pointer ml-auto"
      >
        <span v-if="isRecording">🔴</span>
        <span v-else>🟢</span>
      </div>
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
