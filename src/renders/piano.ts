import type { IKey } from "..";
import { pressedKeys } from "../NoteHandler";
import {
  bottomNote,
  contains,
  getNoteFromMidiNote,
  getNumWhiteKeys,
  isBlackKey,
  topNote,
} from "../utils";
const FACTOR_BLACK_KEYS_HEIGHT = 1.6;

let ctx: CanvasRenderingContext2D | null;

let keys: IKey[] = [];

let hightligtedKeys: { midi: number; color: string }[] = [];

let whiteKeyWidth!: number;
let blackKeyWidth!: number;
let whiteKeyHeight!: number;
let blackKeyHeight!: number;

function initCanvas(canvas: HTMLCanvasElement) {
  ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D Context not found");

  resize();
  render();
}

function setHightligtedKeys(notes: number[], color: string = "yellow") {
  hightligtedKeys = [];
  for (const note of notes) {
    hightligtedKeys.push({ midi: note, color });
  }
}

function render() {
  redraw();
  requestAnimationFrame(() => render());
  // setTimeout(() => {
  //   render()
  // }, 1000/60);
  // console.count('c')
}

function resize(width: number = window.innerWidth) {
  if (!ctx) return;
  whiteKeyWidth = width / getNumWhiteKeys();
  blackKeyWidth = whiteKeyWidth * (7 / 12);

  whiteKeyHeight = width / 8;
  blackKeyHeight = whiteKeyHeight / FACTOR_BLACK_KEYS_HEIGHT;

  ctx.canvas.width = getWidth();
  ctx.canvas.height = whiteKeyHeight;
  buildRects();
  redraw();
}

function getKeyAtPoint(e: MouseEvent) {
  if (!ctx) return;
  const canvasX = e.clientX - ctx.canvas.getBoundingClientRect().left;
  const canvasY = e.clientY - ctx.canvas.getBoundingClientRect().top;

  if (canvasY < blackKeyHeight)
    for (const key of keys.filter((k) => k.note.black == true))
      if (contains(key.rect, canvasX, canvasY)) return key;

  for (const key of keys.filter((k) => k.note.black == false))
    if (contains(key.rect, canvasX, canvasY)) return key;

  return null;
}

function buildRects() {
  let curXWhitePos = 0;
  let curXBlackPos = blackKeyWidth / 2;
  keys = [];
  for (var midiNote = bottomNote; midiNote <= topNote; midiNote++) {
    const note = getNoteFromMidiNote(midiNote);
    if (!note) continue;
    if (!isBlackKey(midiNote)) {
      const rect = {
        x: curXWhitePos,
        y: 0,
        w: whiteKeyWidth,
        h: whiteKeyHeight,
      };
      keys.push({
        rect,
        note: note,
      });
      curXWhitePos += whiteKeyWidth;
      curXBlackPos += blackKeyWidth;
    } else {
      const rect = {
        x: curXBlackPos,
        y: 0,
        w: blackKeyWidth,
        h: blackKeyHeight,
      };
      keys.push({
        rect,
        note: note,
      });
      curXBlackPos += blackKeyWidth;
    }
  }
}

function redraw() {
  if (!ctx) return;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawKeys();
}

function isKeyPressed(note: number) {
  return pressedKeys.some((pressedKey) => pressedKey.note === note);
}

function drawKeys() {
  if (!ctx) return;
  const whiteGradient = ctx.createLinearGradient(0, 0, 0, 100);
  whiteGradient.addColorStop(0, "grey");
  whiteGradient.addColorStop(0.4, "white");

  const blackRadient = ctx.createLinearGradient(0, 0, 0, 100);
  blackRadient.addColorStop(0, "#2b2b2b");
  blackRadient.addColorStop(0.3, "black");

  const drawKey = (key: IKey) => {
    if (!ctx) return;
    const hightligtedKey = hightligtedKeys.find(
      (k) => k.midi === key.note.midi
    );
    const defaultGradient = key.note.black ? blackRadient : whiteGradient;
    const customGradient = ctx.createLinearGradient(0, 0, 0, 100);

    if (hightligtedKey) {
      customGradient.addColorStop(0, key.note.black ? "#2b2b2b" : "grey");
      customGradient.addColorStop(1, hightligtedKey.color);
      ctx.fillStyle = customGradient;
    } else {
      ctx.fillStyle = defaultGradient;
    }

    const pressed = isKeyPressed(key.note.midi);
    const keyHeight = key.note.black ? blackKeyHeight : whiteKeyHeight;
    const percent = updateKeyHeight(key, keyHeight, pressed);

    ctx.beginPath();
    ctx.roundRect(
      key.rect.x,
      key.rect.y,
      key.rect.w,
      key.rect.h,
      key.note.black ? [0, 0, 2, 2] : [0, 0, 4, 4]
    );
    ctx.fill();

    if (!key.note.black) {
      ctx.strokeRect(
        key.rect.x,
        key.rect.y,
        key.rect.w - 1 * percent,
        key.rect.h
      );
    }
  };

  keys.filter((key) => !key.note.black).forEach((key) => drawKey(key));
  keys.filter((key) => key.note.black).forEach((key) => drawKey(key));

  // Draw each blackKeyWidth
  // const red = ctx.createLinearGradient(0, 0, 0, 100);
  // red.addColorStop(0, "blue");
  // red.addColorStop(0.3, "red");
  // ctx.fillStyle = red;
  // let gap = keys[1].rect.x - blackKeyWidth*2
  // for (let key of keys) {
  //   // console.log(key);
  //   ctx.fillRect(
  //     (gap+=blackKeyWidth)+1,
  //     key.rect.y+50,
  //     blackKeyWidth - 2,
  //     25,
  //   );
  // }
}

function updateKeyHeight(key: IKey, defaultHeight: number, pressed: boolean) {
  const speedFactor = 0.5;
  const heightFactor = 5;

  const heightDifference = defaultHeight - key.rect.h;
  const adjustment = pressed
    ? heightDifference < heightFactor
      ? -speedFactor
      : 0
    : heightDifference > 0
    ? speedFactor
    : defaultHeight - key.rect.h;

  key.rect.h += adjustment;

  return heightDifference / heightFactor;
}

function getWidth() {
  return whiteKeyWidth * getNumWhiteKeys();
}

export { resize, getKeyAtPoint, initCanvas, setHightligtedKeys };
