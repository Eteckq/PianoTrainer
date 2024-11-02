<script setup lang="ts">
import {
  webmidi,
  inputsActivated,
  outputsActivated,
  enableInput,
  enableOutput,
  disableInput,
  disableOutput,
  type OutputWithOrigins,
} from "~/src/handlers/midi";
import type { NoteOrigin } from "~/src/NoteHandler";
const key = ref(0);
const opened = ref();

function toggleOrigin(output: OutputWithOrigins, origin: NoteOrigin) {
  const contain = output.origins.findIndex((n) => n == origin);
  if (contain != -1) {
    output.origins.splice(contain, 1);
  } else {
    output.origins.push(origin);
  }
  key.value++;
}

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
    <template #button>
      <div class="py-2 px-4 bg-pallet-secondary rounded">MIDI Params</div>
    </template>
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
          @toggleOrigin="toggleOrigin"
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
