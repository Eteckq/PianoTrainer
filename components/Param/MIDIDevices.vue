<script setup lang="ts">
const instance = getCurrentInstance();

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  activated: {
    type: [Array<MIDIInput>, Array<MIDIOutput>],
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
  return props.activated.some((d) => d.id == id);
}
</script>

<template>
  <div class="p-2 text-pallet-primary">
    <p class="text-xl mb-2 font-bold">{{ title }}</p>
    <div class="flex gap-3 items-center justify-between" v-for="device in devices">
      <p :class="{ 'text-green-700': isEnabled(device[1].id) }">
        {{ device[1].name }}
      </p>

      <div class="cursor-pointer border py-1 px-3 bg-pallet-text rounded-sm hover:bg-slate-400">
        <div v-if="!isEnabled(device[1].id)" @click="fcEnable(device[1])">
          ON
        </div>
        <div v-else @click="fcDisable(device[1].id)">OFF</div>
      </div>
    </div>
  </div>
</template>
