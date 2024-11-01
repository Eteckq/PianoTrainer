<script setup lang="ts">
import type { ParticleConfigOptions } from "~/src";
import { getData, setData } from "nuxt-storage/local-storage";

const emits = defineEmits(["update"]);

const config: Ref<ParticleConfigOptions> = ref({
  lifetime: { min: 2, max: 4 },
  frequency: 0.08,
  spawnChance: 1,
  particlesPerWave: 2,
  maxParticles: 2000,
  alpha: [
    { time: 0, value: 1 },
    { time: 1, value: 0 },
  ],
  moveSpeed: [
    { time: 0, value: 200 },
    { time: 1, value: 50 },
  ],
  scale: [
    { time: 0, value: 0.18 },
    { time: 1, value: 0.03 },
  ],
  scaleMultiplier: 1.13,
  color: [
    { time: 0, value: "#e4f9ff" },
    { time: 1, value: "#3fcbff" },
  ],
  rotation: { min: 250, max: 290 },
  textures: ["Sparks.png"],
});

// if (getData("particle-config")) {
//   config.value = getData("particle-config");
//   if(typeof config.value == 'string'){
//     config.value = JSON.parse(config.value)
//   }
  
//   emits("update", config.value);
// }

watch(config, () => {
  emits("update", config.value);
  setData("particle-config", config.value);
});
</script>

<template>
  <JsonEditorVue v-model="config" />
</template>
