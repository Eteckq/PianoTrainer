<script setup>
import { getCurrentInstance } from "vue";
const instance = getCurrentInstance();

const midiStore = useMidiStore();
const webmidi = await navigator.requestMIDIAccess();
webmidi.addEventListener("statechange", async (event) => {
  console.log(event.port);
  instance?.proxy?.$forceUpdate();
  if (event.port.type == "output") {
    midiStore.disableOutput(event.port.id);
  } else {
    midiStore.disableInput(event.port.id);
  }
});
</script>

<template>
  <div>
    <div v-for="device in webmidi.inputs">
      {{ device[1].name }}
      <div @click="midiStore.enableInput(device[1])">activate</div>
    </div>

    <div v-for="device in webmidi.outputs">
      {{ device[1].name }}
      <div @click="midiStore.enableOutput(device[1])">activate</div>
    </div>
    {{ midiStore.inputsActivated.map((d) => d.id) }}
    {{ midiStore.outputsActivated.map((d) => d.id) }}
  </div>
</template>
