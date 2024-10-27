<script setup lang="ts">
const instance = getCurrentInstance();

defineProps({
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

function forceRefresh() {
  instance?.proxy?.$forceUpdate();
}
</script>

<template>
  <div>
    <p>{{ title }}</p>
    <div class="flex gap-3" v-for="device in devices">
      {{ device[1].name }}
      <div
        v-if="!activated.some((d) => d.id == device[1].id)"
        @click="
          fcEnable(device[1]);
          forceRefresh();
        "
      >
        activate
      </div>
      <div
        v-else
        @click="
          fcDisable(device[1].id);
          forceRefresh();
        "
      >
        desactivate
      </div>
    </div>
  </div>
</template>
