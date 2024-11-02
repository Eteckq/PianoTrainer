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

const context = new AudioContext();

interface PackInfo {
  name: string;
  keys: string[];
  ext: string;
}

const sounds = new Map<number, HTMLAudioElement>();

export async function loadPack(pack: string) {
  const packUrl = `/sounds/${pack}`;
  const infoJson = await $fetch<PackInfo>(`${packUrl}/info.json`);

  for (const i in notes) {
    const note = notes[i];
    
    sounds.set(note.midi, new Audio(`/sounds/${pack}/${infoJson.keys[i]}${infoJson.ext}`));
  }
}

// async function load(id: number, url: string): Promise<void> {
//   return new Promise(async (resolve, reject) => {
//     const resp = await $fetch<ArrayBuffer>(url, {
//       responseType: "arrayBuffer",
//     });
//     try {
//       context.decodeAudioData(resp, function (buffer) {
//         sounds.set(id, buffer);
//         resolve();
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// }

export const sustain = ref(false)

export function playNote(midi: number, vel: number) {
  const s = sounds.get(midi);
  if (!s) return;
  s.sustained = false

  s.muted = false
  s.currentTime = 0
  s.volume = vel/127
  s.play()
}

export function stopPlayNote(midi: number) {
  const s = sounds.get(midi);
  if (!s) return;
  s.sustained = true
  
  if(sustain.value) return
    
  s.currentTime = 0
  s.muted = true
}

function stopSustainedNotes(){
  for (const key of sounds) {
    if(key[1].sustained){
      key[1].volume /= 5
    }
  }
}

on("note:on", (note, vel, origin) => {
  playNote(note, vel);
});

on("note:off", (note, origin) => {
  stopPlayNote(note);
});

on("sustain:on", () => {
  sustain.value = true
});

on("sustain:off", () => {
  stopSustainedNotes()
  sustain.value = false
});

