import EventEmitter from "events";
import type Note from "./utils";
import { getNoteFromMidiNote } from "./utils";

export enum NoteOrigin {
  DEVICE,
  MOUSE,
  APP
}

export declare interface NoteHandler {
  on(event: "note:on", listener: (note: number, vel: number, origin: NoteOrigin) => void): this;
  on(event: "note:off", listener: (note: number, origin: NoteOrigin) => void): this;
  on(event: "sustain:on", listener: (origin: NoteOrigin) => void): this;
  on(event: "sustain:off", listener: (origin: NoteOrigin) => void): this;
}

export class NoteHandler extends EventEmitter {
  public pressedKeys: { velocity: number; note: Note }[] = [];


  emitNoteOn(note: number, vel: number, origin: NoteOrigin) {
    this.emit("note:on", note, vel, origin);
    this.pressKey(note, vel)
  }

  emitNoteOff(note: number, origin: NoteOrigin) {
    this.emit("note:off", note, origin);
    this.unpressKey(note)
  }

  emitSustainOff(origin: NoteOrigin) {
    this.emit("sustain:off", origin);
  }
  emitSustainOn(origin: NoteOrigin) {
    this.emit("sustain:on", origin);
  }

  public pressKey(key: number, velocity: number): void {
    let n = this.pressedKeys.find((pk) => pk.note.note == key)?.note;
    if (!n) {
      n = getNoteFromMidiNote(key);
      if (!n) return;
      this.pressedKeys.push({
        note: n,
        velocity: velocity,
      });
    }
  }

  public unpressKey(key: number): void {
    this.pressedKeys = this.pressedKeys.filter((pk) => pk.note.note != key);
  }
}
