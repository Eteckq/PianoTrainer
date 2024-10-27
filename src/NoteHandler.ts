import { EventEmitter } from "events";

export enum NoteOrigin {
  DEVICE,
  MOUSE,
  APP,
}

interface INoteHandlerEvents {
  "note:on": (note: number, vel: number, origin: NoteOrigin) => void;
  "note:off": (note: number, origin: NoteOrigin) => void;
  "sustain:on": (origin: NoteOrigin) => void;
  "sustain:off": (origin: NoteOrigin) => void;
}

const eventEmitter = new EventEmitter();
const pressedKeys: { velocity: number; note: number }[] = [{note: 60, velocity: 1}, {note: 64, velocity: 1}, {note: 67, velocity: 1}];

function on<K extends keyof INoteHandlerEvents>(
  event: K,
  listener: INoteHandlerEvents[K]
): void {
  eventEmitter.on(event, listener);
}

function emitNoteOn(note: number, vel: number, origin: NoteOrigin): void {
  pressKey(note, vel);
  eventEmitter.emit("note:on", note, vel, origin);
}

function emitNoteOff(note: number, origin: NoteOrigin): void {
  unpressKey(note);
  eventEmitter.emit("note:off", note, origin);
}

function emitSustainOn(origin: NoteOrigin): void {
  eventEmitter.emit("sustain:on", origin);
}

function emitSustainOff(origin: NoteOrigin): void {
  eventEmitter.emit("sustain:off", origin);
}

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
