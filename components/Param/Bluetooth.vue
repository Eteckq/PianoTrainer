<script setup lang="ts">
import { askBtDevice, MidiBTDevice } from "~/src/handlers/bluetooth";
import {
  emitNoteOff,
  emitNoteOn,
  emitSustainOff,
  emitSustainOn,
  NoteOrigin,
  on,
} from "~/src/NoteHandler";
const devices: Ref<MidiBTDevice[]> = ref([]);
const error = ref("");

async function askDevice() {
  const d = await askBtDevice().catch((e) => {
    error.value = e.toString();
  });
  if (!d) return;

  d.emit("note:on", 44, 45);

  d.on("note:on", (note, vel) => {
    emitNoteOn(note, vel, NoteOrigin.DEVICE);
  });
  d.on("note:off", (note) => {
    emitNoteOff(note, NoteOrigin.DEVICE);
  });
  d.on("sustain:on", () => {
    emitSustainOn(NoteOrigin.DEVICE);
  });
  d.on("sustain:off", () => {
    emitSustainOff(NoteOrigin.DEVICE);
  });

  on("note:on", (note, vel, origin) => {
    if (origin != NoteOrigin.DEVICE) d.emit("note:on", note, vel);
  });
  on("note:off", (note, origin) => {
    if (origin != NoteOrigin.DEVICE) d.emit("note:off", note);
  });
  on("sustain:on", (origin) => {
    if (origin != NoteOrigin.DEVICE) d.emit("sustain:on");
  });
  on("sustain:off", (origin) => {
    if (origin != NoteOrigin.DEVICE) d.emit("sustain:off");
  });
  devices.value.push(d);
}
</script>

<template>
  <Param>
    <template #button>
      <div class="py-2 px-4 bg-pallet-secondary rounded">Bluetooth Params</div>
    </template>
    <template #title>Bluetooth Connections</template>
    <template #content>
      <div class="flex flex-col gap-8 items-center justify-center text-center">
        <div
          class="mt-6 bg-green-400 rounded px-2 py-1 cursor-pointer"
          @click="askDevice"
        >
          Search device
        </div>
        <div v-if="devices.length > 0">
          <div v-for="device in devices">
            <p>{{ device.getName() }}</p>
            <p @click="device.toggleInput()">IN: {{ device.inputActivated }}</p>
            <p @click="device.toggleOutput()">
              OUT: {{ device.outputActivated }}
            </p>
          </div>
        </div>
        <div class="text-pallet-text">No bluetooth device connected</div>
        <div v-if="error" class="text-red-500">
          {{ error }}
        </div>
      </div>
    </template>
  </Param>
</template>
