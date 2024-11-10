<script setup lang="ts">
import {
  Application,
  onTick,
  type ApplicationInst,
  type GraphicsInst,
} from "vue3-pixi";
import { Application as Application$1 } from "@pixi/app";
import { rectangleConfig } from "~/src/renders/visualizer";
import { Midi } from "@tonejs/midi";
import { getKeyPositions, setHighlightedKeys } from "~/src/renders/piano";
import type { IKeyPosition, INote } from "~/src";
import {
  emitNoteOff,
  emitNoteOn,
  emitSustainOff,
  emitSustainOn,
  NoteOrigin,
  off,
  on,
} from "~/src/NoteHandler";

const application: Ref<ApplicationInst | null> = ref(null);
const topDiv: Ref<HTMLElement | null> = ref(null);
let bottomY = 0;
const loop: Ref<number[]> = ref([]);

const sounds = [
  "/midi/Ori and the Will of the Wisps.mid",
  "/midi/Zanarkand.mid",
];

const rects: Ref<INoteWithPosition[]> = ref([]);
const time: Ref<number> = ref(-2);
const midiUrl = ref();
const maxTime = ref(0);
interface INoteWithPosition {
  note: {
    duration: number;
    time: number;
    velocity: number;
    played: boolean;
  };
  position: IKeyPosition;
}

const sustainTime: {
  time: number;
  value: number;
}[] = [];
const error = ref("");

// loadMidi("http://localhost:3000/midi/Zanarkand.mid");

async function loadMidi(url: string) {
  error.value = "";
  loading.value = true;
  let midi: Midi | null = null;
  try {
    midi = await Midi.fromUrl(url);
  } catch (e) {
    loading.value = false;
    error.value = String(e);
    return;
  }
  rects.value.splice(0, rects.value.length);
  sustainTime.splice(0, sustainTime.length - 1);
  time.value = -2;
  await new Promise((r) => setTimeout(r, 5));
  const keyPositions = getKeyPositions();

  const track = midi.tracks[0];
  if (!track) {
    loading.value = false;
    error.value = "No track found";
    return;
  }

  for (const note of track.notes) {
    const position = keyPositions.find((kp) => kp.note.midi == note.midi);
    if (!position) return;
    rects.value.push({
      note: {
        duration: note.duration,
        time: note.time,
        velocity: note.velocity,
        played: false,
      },
      position,
    });
    maxTime.value = note.time + note.duration;
  }

  if (track.controlChanges.sustain)
    track.controlChanges.sustain.forEach((cc) => {
      if (cc.name == "sustain") {
        sustainTime.push({ time: cc.time, value: cc.value });
      }
    });
  loading.value = false;
}

function playNote(note: INoteWithPosition) {
  if (note.note.played) return;
  note.note.played = true;
  emitNoteOn(note.position.note.midi, note.note.velocity * 127, NoteOrigin.APP);
  setTimeout(() => {
    emitNoteOff(note.position.note.midi, NoteOrigin.APP);
  }, note.note.duration * 1000);
}

const HEIGHT_FACTOR = ref(100);
function drawRectangle(graphics: GraphicsInst, rect: INoteWithPosition) {
  const height = rect.note.duration * HEIGHT_FACTOR.value;
  const y =
    bottomY -
    height -
    rect.note.time * HEIGHT_FACTOR.value +
    time.value * HEIGHT_FACTOR.value;

  if (y >= bottomY - height && y - 20 <= bottomY - height) {
    if (autoplay.value) {
      playNote(rect);
    }
    if (
      hero.value &&
      !rect.note.played &&
      !waitingNotes.some(
        (wn) => wn.position.note.midi == rect.position.note.midi
      )
    ) {
      pushWaitingNote();
    }
  }

  const width = rect.position.w;
  const x = rect.position.x;

  graphics.clear();
  graphics.beginFill(rectangleConfig.value.color.fixed);
  graphics.drawRoundedRect(0, 0, width, height, 5);
  graphics.x = x;
  graphics.y = y;
}

const autoplay = ref(false);
const hero = ref(false);
const loading = ref(false);

function mountInit(
  app: Application$1,
  canvas: HTMLCanvasElement,
  parent: HTMLElement
) {
  app.resizeTo = parent;
  bottomY = canvas.height;
}

function startAutoplay() {
  setNotesUnplayed();
  started = -time.value * 1000 + Date.now();
  autoplay.value = true;
}

function startHero() {
  setNotesUnplayed();
  started = -time.value * 1000 + Date.now();
  hero.value = true;
}

function setNotesUnplayed() {
  rects.value.forEach((r) => {
    r.note.played = false;
  });
}

function toogleLoop() {
  if (loop.value.length == 0) {
    loop.value.push(8, 10);
  } else [loop.value.splice(0, loop.value.length)];
}

function cleanWaitingNotes() {
  waitingNotes.splice(0, waitingNotes.length);
  setHighlightedKeys([]);
}

function stopAutoplay() {
  autoplay.value = false;
  hero.value = false;
  cleanWaitingNotes();
}
let mounted = false;
let started = 0;
const waitingNotes: INoteWithPosition[] = [];

function noteOn(midi: number) {
  const waitIndex = waitingNotes.findIndex(
    (wn) => wn.position.note.midi == midi
  );
  if (waitIndex != -1) waitingNotes.splice(waitIndex, 1);
}

function pushWaitingNote() {
  const toAdd = rects.value.filter(
    (r) =>
      !r.note.played &&
      r.note.time - 0.2 < time.value &&
      time.value - 1 < r.note.time
  );
  for (const ta of toAdd) {
    ta.note.played = true;
    waitingNotes.push(ta);
  }
}

function loadLocalMidi(e: Event) {
  const t = e.target as HTMLInputElement;
  if (t.files) {
    var tmppath = URL.createObjectURL(t.files[0]);
    loadMidi(tmppath);
  }
}

onMounted(() => {
  const app = application.value?.app;
  const canvas = application.value?.canvas;
  if (!app || !canvas || !topDiv.value) return;
  on("note:on", noteOn);
  mountInit(app, canvas, topDiv.value);
  mounted = true;

  onTick((delta) => {
    if (!mounted) return;
    const now = Date.now();

    if ((hero.value || autoplay.value) && loop.value.length === 2) {
      const [loopStart, loopEnd] = loop.value;
      if (time.value > loopEnd || time.value < loopStart) {
        const wasAutoplay = autoplay.value;
        const wasHero = hero.value;

        stopAutoplay();
        time.value = loopStart;

        setTimeout(() => {
          if (wasAutoplay) {
            startAutoplay();
          } else if (wasHero) {
            startHero();
          }
        }, 500);

        return;
      }
    }

    if (hero.value) {
      if (waitingNotes.length == 0) {
        setHighlightedKeys([]);
        time.value = (now - started) / 1000;
      } else {
        setHighlightedKeys(waitingNotes.map((wn) => wn.position.note.midi));
        started = -time.value * 1000 + Date.now();
      }
    } else if (autoplay.value) {
      time.value = (now - started) / 1000;
      for (const sustain of sustainTime) {
        if (
          sustain.time + 0.01 > time.value &&
          sustain.time - 0.01 < time.value
        ) {
          if (sustain.value == 1) {
            emitSustainOn(NoteOrigin.APP);
            break;
          } else if (sustain.value == 0) {
            emitSustainOff(NoteOrigin.APP);
            break;
          }
        }
      }
    }
  });
});

onUnmounted(() => {
  mounted = false;
  off("note:on", noteOn);
});
</script>

<template>
  <div class="absolute z-50 w-full px-4">
    <div class="flex justify-between items-center">
      <input
        class="cursor-pointer px-4 py-2 bg-pallet-secondary rounded"
        type="file"
        @change="loadLocalMidi"
      />
      <div v-if="error">
        {{ error }}
      </div>
      <div class="flex gap-2">
        <select class="bg-pallet-primary" v-model="midiUrl">
          <option v-for="s in sounds" :value="s">{{ s }}</option>
        </select>
        <div
          v-if="!loading"
          class="cursor-pointer px-4 py-2 bg-pallet-primary rounded"
          @click="loadMidi(midiUrl)"
        >
          Load
        </div>
        <div v-else class="px-4 py-2 bg-pallet-secondary rounded">
          Loading..
        </div>
      </div>
    </div>
    <div v-if="rects.length > 0">
      <div v-if="!autoplay && !hero" class="flex gap-4 my-4">
        <div
          class="cursor-pointer px-2 py-1 bg-green-500 rounded-sm"
          @click="startAutoplay"
        >
          Play
        </div>
        <div
          class="cursor-pointer px-2 py-1 bg-green-500 rounded-sm"
          @click="startHero"
        >
          Play (Hero mode)
        </div>
      </div>
      <div
        class="cursor-pointer px-12 py-1 bg-red-500 rounded-sm inline-block my-4"
        v-else
        @click="stopAutoplay"
      >
        Stop
      </div>
      <div>
        <input
          type="range"
          v-model="HEIGHT_FACTOR"
          min="20"
          max="300"
          step="1"
        />
        <span>Height</span>
      </div>
      <div>
        <input type="range" v-model="time" min="-2" :max="maxTime" step="0.2" />
        <span>Time: {{ time }} / {{ maxTime }}</span>
      </div>
      <div class="flex gap-2">
        <div
          @click="toogleLoop"
          class="bg-green-500 cursor-pointer py-1 px-4"
          :class="{ 'bg-orange-500': loop.length > 0 }"
        >
          Loop mode
        </div>
        <input
          v-if="loop.length > 0"
          class="w-8 bg-pallet-primary"
          type="number"
          v-model="loop[0]"
        />
        <input
          v-if="loop.length > 0"
          class="w-8 bg-pallet-primary"
          type="number"
          v-model="loop[1]"
        />
      </div>
    </div>
  </div>
  <div class="h-full w-full relative overflow-hidden" ref="topDiv">
    <Application ref="application" class="absolute bottom-0">
      <Graphics v-for="rect in rects" @render="drawRectangle($event, rect)">
      </Graphics>
    </Application>
  </div>
</template>
