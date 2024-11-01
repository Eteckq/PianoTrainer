<script setup lang="ts">
import * as particles from "@pixi/particle-emitter";
import {
  Application,
  onTick,
  type ApplicationInst,
  type GraphicsInst,
} from "vue3-pixi";
import { Container } from "@pixi/display";
import type { IKey, IRect, ParticleConfigOptions } from "~/src";
import { off, on } from "~/src/NoteHandler";
import { getPianoRects } from "~/src/renders/piano";

const application: Ref<ApplicationInst | null> = ref(null);
const topDiv: Ref<HTMLElement | null> = ref(null);
const rects: Ref<DrawKey[]> = ref([]);
const openConfig = ref(false);
let mounted = true;
let bottomY = 0;

const tick = ref(0);
const SPEED_MULTIPLIER = 0.2;

const emitterKeys: Array<{ key: IKey; emitter: particles.Emitter }> = [];
const container: Ref<Container | null> = ref(null);

function createParticleConfig(
  rect: IRect,
  y: number,
  options: Partial<ParticleConfigOptions> = {}
) {
  return {
    lifetime: options.lifetime ?? { min: 2, max: 4 },
    frequency: options.frequency ?? 0.08,
    spawnChance: options.spawnChance ?? 1,
    particlesPerWave: options.particlesPerWave ?? 2,
    maxParticles: options.maxParticles ?? 2000,
    pos: { x: rect.x, y },
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
  if (emitterKeys.length > 0) {
    for (const emm of emitterKeys) {
      emm.emitter.cleanup();
    }
    emitterKeys.splice(0, emitterKeys.length);
  }

  for (const key of getPianoRects()) {
    const emitter = new particles.Emitter(
      container.value,
      createParticleConfig(key.rect, bottomY, config)
    );

    emitter.emit = false;
    emitterKeys.push({ key, emitter });
  }
}

function toggleEmit(midi: number, emit: boolean) {
  const emitterKey = emitterKeys.find((e) => e.key.note.midi === midi);
  if (!emitterKey) return;

  const rect = rects.value.find((r) => r.key.note.midi === midi && !r.finished);
  if (emit && !rect) {
    rects.value.push({
      key: emitterKey.key,
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

function drawRectangle(graphics: GraphicsInst, rect: DrawKey) {
  if (rect.outscreen) return;
  tick.value;
  const timeAlive = Date.now() - rect.started;
  const timeAliveFinished = rect.finished ? Date.now() - rect.finished : 0;
  const y = bottomY - graphics.height - timeAliveFinished * SPEED_MULTIPLIER;
  const width = rect.key.rect.w;
  const height = (timeAlive - timeAliveFinished) * SPEED_MULTIPLIER;
  const x = rect.key.rect.x;

  if (y + height < 0) rect.outscreen = true;

  graphics.clear();
  graphics.beginFill("#e4f9ff");
  graphics.drawRoundedRect(0, 0, width, height, 5);
  graphics.x = x;
  graphics.y = y;
}

function updateParticles(config: ParticleConfigOptions) {
  addEmitterKeys(config);
}

onMounted(async () => {
  const app = application.value?.app;
  const canvas = application.value?.canvas;
  if (!app || !canvas || !topDiv.value) return;

  while (getPianoRects().length === 0)
    await new Promise((resolve) => setTimeout(resolve, 10));

  app.resizeTo = topDiv.value;
  bottomY = canvas.height;
  container.value = app.stage;

  addEmitterKeys();
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
  key: IKey;
  started: number;
  finished: number;
  outscreen: boolean;
}
</script>

<template>
  <div class="h-full w-full" ref="topDiv">
    <ParamModal :model-value="openConfig">
      <template #title>
        Particles Configuration
      </template>
      <template #content>
        <ParamParticles @update="updateParticles" />
      </template>
    </ParamModal>
    <div @click="openConfig = !openConfig" class="absolute">OPEN</div>
    <Application ref="application">
      <Graphics
        v-for="rect in rects"
        :key="rect.key.note.midi"
        @render="drawRectangle($event, rect)"
      >
        <BlurFilter :strength="4" :blur="1" />
      </Graphics>
    </Application>
  </div>
</template>
