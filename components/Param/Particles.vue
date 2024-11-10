<script setup lang="ts">
import type { ParticleConfigOptions } from "~/src";

const emits = defineEmits(["update"]);

const particleConfig: Ref<ParticleConfigOptions> = ref({
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

const stored = localStorage.getItem('particle-config')
if (stored) {
  particleConfig.value = JSON.parse(stored)
}

watch(particleConfig, () => {
  emits("update", particleConfig.value);
  localStorage.setItem('particle-config', JSON.stringify(particleConfig.value))
});

onMounted(()=>{
  emits("update", particleConfig.value);
})
</script>

<template>
  <JsonEditorVue v-model="particleConfig" />
</template>
