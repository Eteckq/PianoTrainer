import * as particles from "@pixi/particle-emitter";
import type { IKeyPosition, ParticleConfigOptions } from "..";
import { Container } from "@pixi/display";
import { Application as Application$1 } from "@pixi/app";
import { getKeyPositions } from "./piano";
import { getColorFromNumber } from "../utils";
import { Application, onTick, type GraphicsInst } from "vue3-pixi";

export interface DrawKey {
  keyPos: IKeyPosition;
  started: number;
  finished: number;
  outscreen: boolean;
}

let bottomY = 0;
let mounted = false;
const emitterKeys: Array<{ key: IKeyPosition; emitter: particles.Emitter }> =
  [];
const container: Ref<Container | null> = ref(null);
const rects: Ref<DrawKey[]> = ref([]);
const tick = ref(0);
export const visualizeReady = ref(false);

function setMounted(m: boolean) {
  mounted = m;
}
function updateParticles(config: ParticleConfigOptions) {
  if (!container.value) return;
  addEmitterKeys(container.value, config);
}

function mountInit(
  app: Application$1,
  canvas: HTMLCanvasElement,
  parent: HTMLElement
) {
  app.resizeTo = parent;
  setBottomY(canvas.height);
  container.value = app.stage;
  visualizeReady.value = true;
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
  bg: {
    color: "#000000",
    alpha: 1,
  },
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

watch(rectangleConfig, () => {
  localStorage.setItem(
    "rectangle-config",
    JSON.stringify(rectangleConfig.value)
  );
});

const rstored = localStorage.getItem("rectangle-config");
if (rstored) {
  rectangleConfig.value = JSON.parse(rstored);
}

function createParticleConfig(
  rect: { x: number; w: number },
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

function toggleEmit(midi: number, emit: boolean) {
  const emitterKey = emitterKeys.find((e) => e.key.note.midi === midi);
  if (!emitterKey) return;

  const rect = rects.value.find(
    (r) => r.keyPos.note.midi === midi && !r.finished
  );
  if (emit && !rect) {
    rects.value.push({
      keyPos: emitterKey.key,
      started: Date.now(),
      finished: 0,
      outscreen: false,
    });
  } else if (!emit && rect) {
    rect.finished = Date.now();
  }

  emitterKey.emitter.emit = emit;
}

function addEmitterKeys(
  container: Container,
  config: Partial<ParticleConfigOptions> = {}
) {
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

  for (const key of getKeyPositions()) {
    const emitter = new particles.Emitter(
      container,
      createParticleConfig(key, config)
    );
    emitter.emit = oldEmit.some((e) => e == key.note.midi);
    emitterKeys.push({ key, emitter });
  }
}

function setBottomY(y: number) {
  bottomY = y;
}

function purge() {
  const stillInScreen = rects.value.some((r) => !r.outscreen);
  if (stillInScreen) return;
  rects.value = [];
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
  const width = rect.keyPos.w;
  const height =
    (timeAlive - timeAliveFinished) * 0.2 * rectangleConfig.value.speed;
  const x = rect.keyPos.x;

  graphics.clear();
  if (y + height < 0) {
    rect.outscreen = true;
    purge();
  }
  const speedColorFactor = rectangleConfig.value.color.speedFactor;
  if (rectangleConfig.value.color.aliveBased) {
    graphics.beginFill(
      getColorFromNumber((timeAlive / 100) * speedColorFactor)
    );
  } else if (rectangleConfig.value.color.heightBased) {
    graphics.beginFill(getColorFromNumber((height / 10) * speedColorFactor));
  } else if (rectangleConfig.value.color.timeBased) {
    graphics.beginFill(
      getColorFromNumber((tick.value / 10) * speedColorFactor)
    );
  } else {
    graphics.beginFill(rectangleConfig.value.color.fixed);
  }
  graphics.drawRoundedRect(0, 0, width, height, 5);
  graphics.x = x;
  graphics.y = y;
}

export {
  createParticleConfig,
  setBottomY,
  bottomY,
  emitterKeys,
  rects,
  addEmitterKeys,
  toggleEmit,
  rectangleConfig,
  drawRectangle,
  initializeTicks,
  setMounted,
  mountInit,
  updateParticles,
};
