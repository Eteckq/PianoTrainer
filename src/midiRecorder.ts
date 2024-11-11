import { Track, Midi } from "@tonejs/midi";
import { on } from "./NoteHandler";
import type { IRecorder } from "./utils";

let noteHolder: {
  midi: number;
  time: number;
  velocity: number;
}[] = [];

on("note:on", (note, velocity, origin) => {
  if (!MidiRecorder.recording || !MidiRecorder.track) return;

  noteHolder.push({
    midi: note,
    time: getTime(),
    velocity: velocity / 127,
  });
});

on("note:off", (note, origin) => {
  if (!MidiRecorder.recording || !MidiRecorder.track) return;
  const iNote = noteHolder.findIndex((n) => n.midi == note);
  if (iNote == -1) return;

  MidiRecorder.track.addNote({
    ...noteHolder[iNote],
    duration: getTime() - noteHolder[iNote].time,
  });

  noteHolder = noteHolder.filter((n) => n.midi != note);
});

on("sustain:on", (origin) => {
  if (!MidiRecorder.recording || !MidiRecorder.track) return;

  MidiRecorder.track.addCC({
    number: 64,
    value: 1,
    time: getTime(),
  });
});

on("sustain:off", (origin) => {
  if (!MidiRecorder.recording || !MidiRecorder.track) return;

  MidiRecorder.track.addCC({
    number: 64,
    value: 0,
    time: getTime(),
  });
});
export class MidiRecorder implements IRecorder {
  static recording: number | false = false;
  static track: Track | null = null;
  midi: Midi | null = null;
  startRecording(): void {
    MidiRecorder.recording = Date.now();
    this.midi = new Midi();
    MidiRecorder.track = this.midi.addTrack();
    noteHolder = [];
  }
  stopRecording(): void {
    MidiRecorder.recording = false;
    MidiRecorder.track = null;
  }
  download(filename = "midi.mid"): void {
    if (!this.midi) return;

    const blob = new Blob([this.midi.toArray()], {
      type: "application/octet-stream",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
function getTime(): number {
  if (!MidiRecorder.recording) return 0;
  return (Date.now() - MidiRecorder.recording) / 1000;
}
