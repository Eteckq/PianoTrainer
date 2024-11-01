<script setup lang="ts">
import * as particles from "@pixi/particle-emitter";
import { getData, setData } from "nuxt-storage/local-storage";
import {
  Application,
  onTick,
  type ApplicationInst,
  type GraphicsInst,
} from "vue3-pixi";
import { Container } from "@pixi/display";
import { Color, Filter, Shader } from "@pixi/core";
import type { IKey, IRect, ParticleConfigOptions } from "~/src";
import { off, on } from "~/src/NoteHandler";
import { getPianoRects, keys } from "~/src/renders/piano";

const application: Ref<ApplicationInst | null> = ref(null);
const topDiv: Ref<HTMLElement | null> = ref(null);
const rects: Ref<DrawKey[]> = ref([]);
const openConfig = ref(false);
const openConfigKey = ref(false);

let mounted = true;
let bottomY = 0;

const tick = ref(0);

const emitterKeys: Array<{ key: IKey; emitter: particles.Emitter }> = [];
const container: Ref<Container | null> = ref(null);

function createParticleConfig(
  rect: IRect,
  options: Partial<ParticleConfigOptions> = {}
) {
  return {
    lifetime: options.lifetime ?? { min: 2, max: 4 },
    frequency: options.frequency ?? 0.08,
    spawnChance: options.spawnChance ?? 1,
    particlesPerWave: options.particlesPerWave ?? 2,
    maxParticles: options.maxParticles ?? 2000,
    pos: { x: rect.x, y: bottomY },
    addAtBack: true,
    behaviors: [
      {
        type: "alpha",
        config: {
          alpha: {
            list: options.alpha ?? [
              { time: 0, value: 1 },
              { time: 1, value: 0 },
            ],
          },
        },
      },
      {
        type: "moveSpeed",
        config: {
          speed: {
            list: options.moveSpeed ?? [
              { time: 0, value: 200 },
              { time: 1, value: 50 },
            ],
          },
          minMult: 1,
        },
      },
      {
        type: "scale",
        config: {
          scale: {
            list: options.scale ?? [
              { time: 0, value: 0.18 },
              { time: 1, value: 0.03 },
            ],
          },
          minMult: options.scaleMultiplier ?? 1.13,
        },
      },
      {
        type: "color",
        config: {
          color: {
            list: options.color ?? [
              { time: 0, value: "#e4f9ff" },
              { time: 1, value: "#3fcbff" },
            ],
          },
        },
      },
      {
        type: "rotationStatic",
        config: options.rotation ?? { min: 250, max: 290 },
      },
      {
        type: "textureRandom",
        config: {
          textures: options.textures ?? ["Sparks.png"],
        },
      },
      {
        type: "spawnShape",
        config: {
          type: "rect",
          data: { x: 0, y: 0, w: rect.w, h: 0 },
        },
      },
    ],
  };
}

function addEmitterKeys(config: Partial<ParticleConfigOptions> = {}) {
  if (!container.value) return;
  const oldEmit = [];
  if (emitterKeys.length > 0) {
    for (const emm of emitterKeys) {
      emm.emitter.cleanup();
      if (emm.emitter.emit) {
        oldEmit.push(emm.key.note.midi);
      }
    }
    emitterKeys.splice(0, emitterKeys.length);
  }

  for (const key of getPianoRects()) {
    const emitter = new particles.Emitter(
      container.value,
      createParticleConfig(key.rect, config)
    );
    emitter.emit = oldEmit.some((e) => e == key.note.midi);
    emitterKeys.push({ key, emitter });
  }
}

function toggleEmit(midi: number, emit: boolean) {
  const emitterKey = emitterKeys.find((e) => e.key.note.midi === midi);
  if (!emitterKey) return;

  const rect = rects.value.find((r) => r.midi === midi && !r.finished);
  if (emit && !rect) {
    rects.value.push({
      rect: {...emitterKey.key.rect},
      midi: emitterKey.key.note.midi,
      started: Date.now(),
      finished: 0,
      outscreen: false,
    });
  } else if (!emit && rect) {
    rect.finished = Date.now();
  }

  emitterKey.emitter.emit = emit;
}

function initializeTicks() {
  let elapsed = Date.now();
  onTick((delta) => {
    if (!mounted) return;

    const now = Date.now();
    emitterKeys.forEach((emitter) =>
      emitter.emitter.update((now - elapsed) * 0.001)
    );

    tick.value++;
    elapsed = now;
  });
}

const rectangleConfig = ref({
  color: {
    timeBased: false,
    aliveBased: false,
    heightBased: true,
    speedFactor: 1,
    fixed: "#e4f9ff",
  },
  speed: 1,
  blur: 1,
  strength: 1,
  // tint: "#ffffffff",
});

function purge() {
    const stillInScreen = rects.value.some(r => !r.outscreen)
    if(stillInScreen) return
    rects.value = []
}

function drawRectangle(graphics: GraphicsInst, rect: DrawKey) {
  if (rect.outscreen) return;
  tick.value;
  const timeAlive = Date.now() - rect.started;
  const timeAliveFinished = rect.finished ? Date.now() - rect.finished : 0;
  const y =
    bottomY -
    graphics.height -
    timeAliveFinished * 0.2 * rectangleConfig.value.speed;
  const width = rect.rect.w;
  const height =
    (timeAlive - timeAliveFinished) * 0.2 * rectangleConfig.value.speed;
  const x = rect.rect.x;
  
  graphics.clear();
  if (y + height < 0) {
    rect.outscreen = true;
    purge()
  }

  if (rectangleConfig.value.color.aliveBased) {
    graphics.beginFill(getColorFromNumber(timeAlive / 100));
  } else if (rectangleConfig.value.color.heightBased) {
    graphics.beginFill(getColorFromNumber(height / 10));
  } else if (rectangleConfig.value.color.timeBased) {
    graphics.beginFill(getColorFromNumber(tick.value / 10));
  } else {
    graphics.beginFill(rectangleConfig.value.color.fixed);
  }
  graphics.drawRoundedRect(0, 0, rect.outscreen ? 0 : width, height, 5);
  graphics.x = x;
  graphics.y = y;
}
function getColorFromNumber(value: number): string {
  value *= rectangleConfig.value.color.speedFactor;
  // Utilisation de fonctions sinusoïdales pour générer des valeurs entre 0 et 255
  const red = Math.floor((Math.sin(value * 0.1) + 1) * 127.5);
  const green = Math.floor((Math.sin(value * 0.1 + 2) + 1) * 127.5);
  const blue = Math.floor((Math.sin(value * 0.1 + 4) + 1) * 127.5);

  // Conversion en format hexadécimal et ajout de zéros initiaux si nécessaire
  const redHex = red.toString(16).padStart(2, "0");
  const greenHex = green.toString(16).padStart(2, "0");
  const blueHex = blue.toString(16).padStart(2, "0");

  return `#${redHex}${greenHex}${blueHex}`;
}
function updateParticles(config: ParticleConfigOptions) {
  addEmitterKeys(config);
}

function mountCanvas() {
  const app = application.value?.app;
  const canvas = application.value?.canvas;
  if (!app || !canvas || !topDiv.value) return;

  app.resizeTo = topDiv.value;
  bottomY = canvas.height;
  container.value = app.stage;

  const particleConfig = getData("particle-config");
  if (particleConfig) {
    addEmitterKeys(particleConfig);
  } else {
    addEmitterKeys();
  }
}

onMounted(() => {
  mountCanvas();
  initializeTicks();
  on("note:on", (midi) => toggleEmit(midi, true));
  on("note:off", (midi) => toggleEmit(midi, false));
});

onUnmounted(() => {
  mounted = false;
  off("note:on", (midi) => toggleEmit(midi, true));
  off("note:off", (midi) => toggleEmit(midi, false));
});

interface DrawKey {
  rect: IRect;
  midi: number;
  started: number;
  finished: number;
  outscreen: boolean;
}
</script>

<template>
  <div class="h-full w-full relative bg-black overflow-hidden" ref="topDiv">
    <ParamModal v-model="openConfig">
      <template #title> Particles Configuration </template>
      <template #content>
        <ParamParticles v-if="container" @update="updateParticles" />
      </template>
    </ParamModal>
    <ParamModal v-model="openConfigKey">
      <template #title> Keys Configuration </template>
      <template #content>
        <JsonEditorVue v-model="rectangleConfig" />
      </template>
    </ParamModal>

    <div class="absolute z-10 top-0 left-0 flex gap-4">
      <div @click="openConfig = !openConfig" class="cursor-pointer">✨</div>

      <div @click="openConfigKey = !openConfigKey" class="cursor-pointer">
        🟦
      </div>
    </div>
    <Application ref="application" class="absolute bottom-0">
      <Graphics v-for="rect in rects" @render="drawRectangle($event, rect)">
        <BlurFilter
          :strength="rectangleConfig.strength"
          :blur="rectangleConfig.blur"
        />
      </Graphics>
    </Application>
  </div>
</template>
