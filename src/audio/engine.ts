import { on } from "../NoteHandler";
import { notes } from "../utils";

// export class AudioEngine {
//   volume: number;
//   sounds: Record<string, AudioBuffer>;
//   paused: boolean;

//   init(): this {
//     this.volume = 0.6;
//     this.sounds = {};
//     this.paused = true;
//     return this;
//   }
//   load(id: string, url: string, cb: Function) {}
//   play(id: string, vol: number, delay_ms: number, part_id: string) {}
//   stop(id: string, delay_ms: number, part_id: string) {}
//   setVolume(vol: number) {
//     this.volume = vol;
//   }
//   resume() {
//     this.paused = false;
//   }
// }

document
  .querySelector("body")
  ?.addEventListener("click", initSound, { once: true });

function initSound() {
  console.log("init");
  context = new window.AudioContext();
  loadPack("piano");
}

let context: AudioContext | null = null;

interface PackInfo {
  name: string;
  keys: string[];
  ext: string;
}

const sounds = ref(new Map<number, AudioBuffer>());
export const isLoading = ref(false);
export async function loadPack(pack: string) {
  isLoading.value = true;
  const packUrl = `/sounds/${pack}`;
  const infoJson = await $fetch<PackInfo>(`${packUrl}/info.json`);

  for (const i in notes) {
    const note = notes[i];
    await load(note.midi, `/sounds/${pack}/${infoJson.keys[i]}${infoJson.ext}`);
  }
  isLoading.value = false;
}

async function load(id: number, url: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    if (!context) return reject("No context");
    const resp = await $fetch<ArrayBuffer>(url, {
      responseType: "arrayBuffer",
    });
    try {
      context.decodeAudioData(resp, function (buffer) {
        sounds.value.set(id, buffer);
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

export const sustain = ref(false);
const played = new Map<
  number,
  { source: AudioBufferSourceNode; sustained: boolean }[]
>();

export function playNote(midi: number, vel: number) {
  const audioNote: AudioBuffer | undefined = sounds.value.get(midi);
  if (!audioNote || !context) return;

  const source = context.createBufferSource();

  source.buffer = audioNote;
  const gain = context.createGain();
  gain.gain.value = vel / 127;
  gain.connect(context.destination);
  source.connect(gain);
  source.start();

  if (!played.get(midi)) {
    played.set(midi, []);
  }

  played.get(midi)?.push({
    source,
    sustained: false,
  });
}

export function stopPlayNote(midi: number) {
  const audioNote: AudioBuffer | undefined = sounds.value.get(midi);
  if (!audioNote || !context) return;
  played.get(midi)?.forEach((k) => {
    k.sustained = true;
  });
  if (sustain.value) return;

  played.get(midi)?.forEach((k) => {
    k.source.stop();
  });
  played.set(midi, []);
}

function stopSustainedNotes() {
  for (const key of played) {
    key[1] = key[1].filter((k) => {
      if (k.sustained) {
        k.source.stop();
      } else {
        return k;
      }
    });
  }
}

on("note:on", (note, vel, origin) => {
  playNote(note, vel);
});

on("note:off", (note, origin) => {
  stopPlayNote(note);
});

on("sustain:on", () => {
  sustain.value = true;
});

on("sustain:off", () => {
  stopSustainedNotes();
  sustain.value = false;
});
