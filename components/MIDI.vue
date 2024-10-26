<script setup>
import { getCurrentInstance } from "vue";
import { midiHandler } from "~/src";

const instance = getCurrentInstance();

const interval = setInterval(() => {
  if (midiHandler.webmidi) {
    midiHandler.webmidi.addEventListener("statechange", async (event) => {
      instance.proxy.$forceUpdate();
    });
    instance.proxy.$forceUpdate();
    clearInterval(interval);
  }
}, 200);
</script>

<template>
  <div v-if="midiHandler.webmidi">
    <p>Inputs</p>
    <div class="flex gap-3" v-for="device in midiHandler.webmidi.inputs">
      {{ device[1].name }}
      <div
        v-if="!midiHandler.inputsActivated.some((d) => d.id == device[1].id)"
        @click="midiHandler.enableInput(device[1])"
      >
        activate
      </div>
      <div v-else @click="midiHandler.disableInput(device[1].id)">
        desactivate
      </div>
    </div>

    <p>Outputs</p>
    <div class="flex gap-3" v-for="device in midiHandler.webmidi.outputs">
      {{ device[1].name }}
      <div
        v-if="!midiHandler.outputsActivated.some((d) => d.id == device[1].id)"
        @click="midiHandler.enableOutput(device[1])"
      >
        activate
      </div>
      <div v-else @click="midiHandler.disableOutput(device[1].id)">
        desactivate
      </div>
    </div>
  </div>
  <div v-else>...</div>
</template>
