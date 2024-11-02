<script setup lang="ts">
import type { Input, OutputWithOrigins } from "~/src/handlers/midi";
import { NoteOrigin } from "~/src/NoteHandler";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  activated: {
    type: [Array<Input>, Array<OutputWithOrigins>],
    required: true,
  },
  devices: {
    type: [MIDIOutputMap, MIDIInputMap],
    required: true,
  },
  fcEnable: {
    type: Function,
    required: true,
  },
  fcDisable: {
    type: Function,
    required: true,
  },
});

function isEnabled(id: string) {
  return props.activated.some((d) => d.device.id == id);
}

function getActivatedOutputDevice(id: string): OutputWithOrigins {
  const device = props.activated.find((d) => d.device.id == id);
  if (device && device.origins) return device;
  return null;
}

function toggleOrigin(output: OutputWithOrigins, origin: NoteOrigin) {
  const contain = output.origins.findIndex((n) => n == origin);
  if (contain != -1) {
    output.origins.splice(contain, 1);
  } else {
    output.origins.push(origin);
  }
}
</script>

<template>
  <div class="p-2 text-pallet-primary">
    <p class="text-xl mb-2 font-bold">{{ title }}</p>
    <div
      class="flex gap-3 items-center justify-between"
      v-for="device in devices"
    >
      <p :class="{ 'text-green-700': isEnabled(device[1].id) }">
        {{ device[1].name }}
      </p>

      <div
        class="cursor-pointer border py-1 px-3 bg-pallet-text rounded-sm hover:bg-slate-400"
      >
        <div v-if="!isEnabled(device[1].id)" @click="fcEnable(device[1])">
          ON
        </div>
        <div v-else @click="fcDisable(device[1].id)">OFF</div>
      </div>
      <!-- Devices enabled -->
      <div
        class="flex gap-2"
        v-if="isEnabled(device[1].id) && getActivatedOutputDevice(device[1].id)"
      >
        <div
          @click="toggleOrigin(getActivatedOutputDevice(device[1].id), origin)"
          v-for="(origin, index) in NoteOrigin"
          class="border px-2 py-1"
          :class="[
            getActivatedOutputDevice(device[1].id).origins.includes(origin)
              ? 'bg-green-600'
              : 'bg-red-600',
          ]"
        >
          {{ index }}
        </div>
      </div>
    </div>
  </div>
</template>
