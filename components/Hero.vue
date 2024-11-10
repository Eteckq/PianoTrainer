<script setup lang="ts">
import {
  Application,
  onTick,
  type ApplicationInst,
  type GraphicsInst,
} from "vue3-pixi";
import { Application as Application$1 } from "@pixi/app";
import { rectangleConfig, type DrawKey } from "~/src/renders/visualizer";
import { Midi } from "@tonejs/midi";
import type { Note } from "@tonejs/midi/dist/Note";
import { getKeyPositions } from "~/src/renders/piano";
import type { IKeyPosition } from "~/src";
import {
  emitNoteOff,
  emitNoteOn,
  emitSustainOff,
  emitSustainOn,
  NoteOrigin,
} from "~/src/NoteHandler";

const application: Ref<ApplicationInst | null> = ref(null);
const topDiv: Ref<HTMLElement | null> = ref(null);
let bottomY = 0;

const rects: Ref<INoteWithPosition[]> = ref([]);
const time: Ref<number> = ref(-2);
const midiUrl = ref("http://localhost:3000/midi/Zanarkand.mid");
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
  time.value = -2
  await new Promise(r => setTimeout(r, 5))
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
    playNote(rect);
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

function stopAutoplay() {
  autoplay.value = false;
}
let mounted = false;
let started = 0;
onMounted(() => {
  const app = application.value?.app;
  const canvas = application.value?.canvas;
  if (!app || !canvas || !topDiv.value) return;

  mountInit(app, canvas, topDiv.value);
  mounted = true;

  onTick((delta) => {
    if (!mounted || !autoplay.value) return;

    const now = Date.now();

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
  });
});

onUnmounted(() => {
  mounted = false;
});
</script>

<template>
  <div class="absolute z-50">
    <input
      class="bg-pallet-primary"
      type="text"
      placeholder="Midi URL"
      v-model="midiUrl"
      @change="loadMidi(midiUrl)"
    />
    <div v-if="!autoplay" @click="startAutoplay">PLAY</div>
    <div v-else @click="stopAutoplay">STOP</div>
    <input type="range" v-model="HEIGHT_FACTOR" min="20" max="300" step="1" />
    <input type="range" v-model="time" min="-2" :max="maxTime" step="0.2" />
    {{ time }} / {{ maxTime }}
  </div>
  <div class="h-full w-full relative overflow-hidden" ref="topDiv">
    <Application ref="application" class="absolute bottom-0">
      <Graphics v-for="rect in rects" @render="drawRectangle($event, rect)">
      </Graphics>
    </Application>
  </div>
</template>
