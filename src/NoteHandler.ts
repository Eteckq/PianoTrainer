import { EventEmitter } from "events";

export enum NoteOrigin {
  DEVICE = "d",
  MOUSE = "m",
  APP = "a",
  SOCKET = "s",
}

export interface INoteHandlerEvents {
  "note:on": (note: number, vel: number, origin: NoteOrigin) => void;
  "note:off": (note: number, origin: NoteOrigin) => void;
  "note:change": (origin: NoteOrigin) => void;
  "sustain:on": (origin: NoteOrigin) => void;
  "sustain:off": (origin: NoteOrigin) => void;
  "sustain:change": (origin: NoteOrigin) => void;
}

const eventEmitter = new EventEmitter();
const pressedKeys: { velocity: number; midi: number }[] = [];

function on<K extends keyof INoteHandlerEvents>(
  event: K,
  listener: INoteHandlerEvents[K]
): void {
  eventEmitter.on(event, listener);
}

function off<K extends keyof INoteHandlerEvents>(
  event: K,
  listener: INoteHandlerEvents[K]
): void {
  eventEmitter.off(event, listener);
}

function emitNoteOn(note: number, vel: number, origin: NoteOrigin): void {
  pressKey(note, vel);
  eventEmitter.emit("note:on", note, vel, origin);
  eventEmitter.emit("note:change", origin);
}

function emitNoteOff(note: number, origin: NoteOrigin): void {
  unpressKey(note);
  eventEmitter.emit("note:off", note, origin);
  eventEmitter.emit("note:change", origin);
}

function emitSustainOn(origin: NoteOrigin): void {
  eventEmitter.emit("sustain:on", origin);
  eventEmitter.emit("sustain:change", origin);
}

function emitSustainOff(origin: NoteOrigin): void {
  eventEmitter.emit("sustain:off", origin);
  eventEmitter.emit("sustain:change", origin);
}

function pressKey(key: number, velocity: number): void {
  if (!pressedKeys.find((pk) => pk.midi === key)) {
    pressedKeys.push({
      midi: key,
      velocity: velocity,
    });
  }
}

function unpressKey(key: number): void {
  const index = pressedKeys.findIndex((pk) => pk.midi === key);
  if (index !== -1) {
    pressedKeys.splice(index, 1);
  }
}

export {
  pressedKeys,
  on,
  off,
  emitNoteOff,
  emitNoteOn,
  emitSustainOff,
  emitSustainOn,
  pressKey,
  unpressKey,
};
