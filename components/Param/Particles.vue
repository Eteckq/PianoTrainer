<script setup lang="ts">
import type { ParticleConfigOptions } from "~/src";

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

type Behaviors = "color" | "alpha" | "scale" | "moveSpeed";
const behaviors: Behaviors[] = ["color", "alpha", "scale", "moveSpeed"];

function addItem<T>(array: T[], newItem: T) {
  array.push(newItem);
}

// Function to remove an item from an array
function removeItem(array: any[], index: number) {
  if(array.length <= 2) return
  array.splice(index, 1);
}

// Function to update an item in an array at a given index
function updateArrayItem(
  array: any[],
  index: number,
  key: string | null,
  value: any
) {
  if (!value) return;
  if (key) {
    array[index][key] = value.value;
  } else {
    array[index] = value.value;
  }
}

function emit() {
  emits("update", config.value);
}
</script>

<template>
  <div class="text-gray-950 bg-gray-300">
    <!-- Lifetime -->
    <div>
      <h3>Lifetime</h3>
      <label>Min: <input v-model="config.lifetime.min" type="number" /></label>
      <label>Max: <input v-model="config.lifetime.max" type="number" /></label>
    </div>

    <!-- Frequency, Spawn Chance, Particles Per Wave, Max Particles -->
    <div>
      <h3>General Settings</h3>
      <label
        >Frequency: <input v-model="config.frequency" type="number" step="0.01"
      /></label>
      <label
        >Spawn Chance: <input v-model="config.spawnChance" type="number"
      /></label>
      <label
        >Particles Per Wave:
        <input v-model="config.particlesPerWave" type="number"
      /></label>
      <label
        >Max Particles: <input v-model="config.maxParticles" type="number"
      /></label>
    </div>

    <!-- Alpha Array -->

    <!-- Repeat similar structure for moveSpeed, scale, color arrays -->

    <div v-for="kkk in behaviors">
      <div>
        <h3>{{ kkk }}</h3>
        <div v-for="(item, index) in config[kkk]" :key="index">
          <label
            >Time:
            <input
              :value="item.time"
              @input="
                updateArrayItem(config[kkk], index, 'time', $event.target)
              "
              type="number"
              step="0.1"
          /></label>
          <label
            >Value:
            <input
              :value="item.value"
              @input="
                updateArrayItem(config[kkk], index, 'value', $event.target)
              "
              :type="kkk === 'color' ? 'color' : 'number'"
          /></label>
          <button @click="removeItem(config[kkk], index)">Remove</button>
        </div>
        <button
          @click="
            addItem(config[kkk], {
              time: 0,
              value: typeof config[kkk][0]?.value == 'number' ? 1 : '1',
            })
          "
        >
          Add {{ kkk }}
        </button>
      </div>
    </div>

    <!-- Scale Multiplier -->
    <div>
      <h3>Scale Multiplier</h3>
      <label>
        <input v-model="config.scaleMultiplier" type="number" step="0.01" />
      </label>
    </div>

    <!-- Rotation -->
    <div>
      <h3>Rotation</h3>
      <label>Min: <input v-model="config.rotation.min" type="number" /></label>
      <label>Max: <input v-model="config.rotation.max" type="number" /></label>
    </div>

    <!-- Textures Array -->
    <div>
      <h3>Textures</h3>
      <div v-for="(texture, index) in config.textures" :key="index">
        <label
          >Texture:
          <input
            :value="texture"
            @input="
              updateArrayItem(config.textures, index, null, $event.target)
            "
            type="text"
        /></label>
        <button @click="removeItem(config.textures, index)">
          Remove Texture
        </button>
      </div>
      <button @click="addItem(config.textures, 'NewTexture.png')">
        Add Texture
      </button>
    </div>
    <div @click="emit">SAVE</div>
  </div>
</template>
