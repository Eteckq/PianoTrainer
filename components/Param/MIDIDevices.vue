<script setup lang="ts">
import type { Input, OutputWithOrigins } from "~/src/handlers/midi";
import { NoteOrigin } from "~/src/NoteHandler";

const emits = defineEmits(["toggleOrigin"]);

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
</script>

<template>
  <div class="p-2 text-pallet-primary">
    <p class="text-xl mb-2 font-bold">{{ title }}</p>
    <div
      class="flex gap-3 items-center justify-between my-2"
      v-for="device in devices"
    >
      <p class=" py-1 px-2 rounded" :class="{ 'bg-green-900 text-pallet-text font-medium': isEnabled(device[1].id) }">
        {{ device[1].name }}
      </p>

      <!-- Origins enabled -->
      <div
        class="flex gap-2"
        v-if="isEnabled(device[1].id) && getActivatedOutputDevice(device[1].id)"
      >
        <div
          @click="
            emits(
              'toggleOrigin',
              getActivatedOutputDevice(device[1].id),
              origin
            )
          "
          v-for="(origin, index) in NoteOrigin"
          class="border px-2 py-1 cursor-pointer"
          :class="[
            getActivatedOutputDevice(device[1].id).origins.includes(origin)
              ? 'bg-green-300'
              : 'bg-red-300',
          ]"
        >
          {{ index }}
        </div>
      </div>
      <div class="cursor-pointer">
        <div
          v-if="!isEnabled(device[1].id)"
          @click="fcEnable(device[1])"
          class="bg-green-500 border py-1 px-3 rounded-sm"
        >
          Enable
        </div>
        <div
          v-else
          @click="fcDisable(device[1].id)"
          class="bg-red-500 border py-1 px-3 rounded-sm"
        >
          Disable
        </div>
      </div>
    </div>
  </div>
</template>
