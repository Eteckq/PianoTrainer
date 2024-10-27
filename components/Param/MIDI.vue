<script setup lang="ts">
import {
  webmidi,
  inputsActivated,
  outputsActivated,
  enableInput,
  enableOutput,
  disableInput,
  disableOutput,
} from "~/src/handlers/midi";
const key = ref(0);
const opened = ref();

onMounted(() => {
  const interval = setInterval(() => {
    if (webmidi) {
      webmidi.addEventListener("statechange", async (event) => {
        opened.value = true;
        key.value++;
      });
      clearInterval(interval);
    }
  }, 200);
});
</script>

<template>
  <Param v-model="opened">
    <template #title>MIDI Connections</template>
    <template #content>
      <div class="flex flex-col" v-if="webmidi">
        <ParamMIDIDevices
          :key="key"
          title="Input"
          :fc-disable="disableOutput"
          :fc-enable="enableOutput"
          :devices="webmidi.outputs"
          :activated="outputsActivated"
        />
        <ParamMIDIDevices
          :key="key+1"
          title="Outputs"
          :fc-disable="disableInput"
          :fc-enable="enableInput"
          :devices="webmidi.inputs"
          :activated="inputsActivated"
        />
      </div>
      <div v-else>...</div>
    </template>
  </Param>
</template>
