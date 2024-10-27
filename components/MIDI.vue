<script setup>
import { getCurrentInstance } from "vue";
import { webmidi, inputsActivated, outputsActivated, enableInput, enableOutput, disableInput, disableOutput } from "~/src/MidiHandler";

const instance = getCurrentInstance();

const interval = setInterval(() => {
  if (webmidi) {
    webmidi.addEventListener("statechange", async (event) => {
      forceRefresh()
    });
    forceRefresh()
    clearInterval(interval);
  }
}, 200);

function forceRefresh(){
  instance.proxy.$forceUpdate();

}
</script>

<template>
  <div v-if="webmidi">
    <p>Output</p>
    <div class="flex gap-3" v-for="device in webmidi.inputs">
      {{ device[1].name }}
      <div
        v-if="!inputsActivated.some((d) => d.id == device[1].id)"
        @click="enableInput(device[1]); forceRefresh()"
      >
        activate
      </div>
      <div v-else @click="disableInput(device[1].id); forceRefresh()">
        desactivate
      </div>
    </div>

    <p>Input</p>
    <div class="flex gap-3" v-for="device in webmidi.outputs">
      {{ device[1].name }}
      <div
        v-if="!outputsActivated.some((d) => d.id == device[1].id)"
        @click="enableOutput(device[1]); forceRefresh()"
      >
        activate
      </div>
      <div v-else @click="disableOutput(device[1].id); forceRefresh()">
        desactivate
      </div>
    </div>
  </div>
  <div v-else>...</div>
</template>
