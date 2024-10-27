import { EventEmitter } from "events";

export enum NoteOrigin {
  DEVICE,
  MOUSE,
  APP,
}

interface NoteHandlerEvents {
  "note:on": (note: number, vel: number, origin: NoteOrigin) => void;
  "note:off": (note: number, origin: NoteOrigin) => void;
  "sustain:on": (origin: NoteOrigin) => void;
  "sustain:off": (origin: NoteOrigin) => void;
}

const eventEmitter = new EventEmitter();
const pressedKeys: { velocity: number; note: number }[] = [];

// Register event listeners
function on<K extends keyof NoteHandlerEvents>(
  event: K,
  listener: NoteHandlerEvents[K]
): void {
  eventEmitter.on(event, listener);
}

// Emit functions
function emitNoteOn(note: number, vel: number, origin: NoteOrigin): void {
  eventEmitter.emit("note:on", note, vel, origin);
  pressKey(note, vel);
}

function emitNoteOff(note: number, origin: NoteOrigin): void {
  eventEmitter.emit("note:off", note, origin);
  unpressKey(note);
}

function emitSustainOn(origin: NoteOrigin): void {
  eventEmitter.emit("sustain:on", origin);
}

function emitSustainOff(origin: NoteOrigin): void {
  eventEmitter.emit("sustain:off", origin);
}

// Key press management functions
function pressKey(key: number, velocity: number): void {
  if (!pressedKeys.find((pk) => pk.note === key)) {
    pressedKeys.push({
      note: key,
      velocity: velocity,
    });
  }
}

function unpressKey(key: number): void {
  const index = pressedKeys.findIndex((pk) => pk.note === key);
  if (index !== -1) {
    pressedKeys.splice(index, 1);
  }
}

export {
  pressedKeys,
  on,
  emitNoteOff,
  emitNoteOn,
  emitSustainOff,
  emitSustainOn,
  pressKey,
  unpressKey,
};
