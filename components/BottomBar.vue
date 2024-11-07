<script setup lang="ts">
const bluetoothAvailable = ref(!!navigator.bluetooth)
</script>

<template>
  <div class="bg-pallet-primary text-pallet-primary overflow-hidden">
    <div class="flex items-center gap-4 p-4">
      <ParamMIDI />
      <ParamBluetooth v-if="bluetoothAvailable"/>
    </div>
  </div>
</template>
