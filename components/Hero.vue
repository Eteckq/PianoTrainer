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

// loadMidi("http://localhost:3000/midi/Zanarkand.mid");

async function loadMidi(url: string) {
  const midi = await Midi.fromUrl(url);
  rects.value.splice(0, rects.value.length);
  time.value = -2;
  await new Promise((r) => setTimeout(r, 5));
  const keyPositions = getKeyPositions();

  midi.tracks.forEach((track) => {
    //tracks have notes and controlChanges

    //notes are an array
    const notes = track.notes;
    notes.forEach((note) => {
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
      //note.midi, note.time, note.duration, note.name
      maxTime.value = note.time + note.duration;
    });

    sustainTime.splice(0, sustainTime.length - 1);
    //they are also aliased to the CC number's common name (if it has one)
    if (track.controlChanges.sustain)
      track.controlChanges.sustain.forEach((cc) => {
        // cc.ticks, cc.value, cc.time
        if (cc.name == "sustain") {
          sustainTime.push({ time: cc.time, value: cc.value });
        }
      });
  });
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

function mountInit(
  app: Application$1,
  canvas: HTMLCanvasElement,
  parent: HTMLElement
) {
  app.resizeTo = parent;
  bottomY = canvas.height;
}

function startAutoplay() {
  rects.value.forEach((r) => {
    r.note.played = false;
  });
  started = -time.value * 1000 + Date.now();
  autoplay.value = true;
}

function startHero() {
  rects.value.forEach((r) => {
    r.note.played = false;
  });
  started = -time.value * 1000 + Date.now();
  hero.value = true;
}

function stopAutoplay() {
  autoplay.value = false;
  hero.value = false;
  waitingNotes.splice(0, waitingNotes.length);
  setHighlightedKeys([]);
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
  <div class="absolute z-50">
    <div class="flex gap-4">
      <select class="bg-pallet-primary" v-model="midiUrl">
        <option v-for="s in sounds" :value="s">{{ s }}</option>
      </select>
      <div @click="loadMidi(midiUrl)">LOAD</div>
    </div>
<div v-if="rects.length > 0">
  <div v-if="!autoplay && !hero">
      <div @click="startAutoplay">PLAY</div>
      <div @click="startHero">PLAY HERO</div>
    </div>
    <div v-else @click="stopAutoplay">STOP</div>
    <div>
      <input type="range" v-model="HEIGHT_FACTOR" min="20" max="300" step="1" />
      <span>height</span>
    </div>
    <div>
      <input type="range" v-model="time" min="-2" :max="maxTime" step="0.2" />
      <span>time: {{ time }} / {{ maxTime }}</span>
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
