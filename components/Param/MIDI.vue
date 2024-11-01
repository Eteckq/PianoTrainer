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
          :key="key + 1"
          title="Inputs"
          :fc-disable="(id: string)=>{disableInput(id); key++}"
          :fc-enable="(id: MIDIInput)=>{enableInput(id); key++}"
          :devices="webmidi.inputs"
          :activated="inputsActivated"
        />
        <ParamMIDIDevices
          :key="key"
          title="Outputs"
          :fc-disable="(id: string)=>{disableOutput(id); key++}"
          :fc-enable="(id: MIDIOutput)=>{enableOutput(id); key++}"
          :devices="webmidi.outputs"
          :activated="outputsActivated"
        />
      </div>
      <div v-else>...</div>
    </template>
  </Param>
</template>
