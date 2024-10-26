import { isBlackKey } from "./utils";
import { Piano } from "./Piano";
import Rect from "./Rect";

const FACTOR_BLACK_KEYS_WIDTH = 2;
const FACTOR_BLACK_KEYS_HEIGHT = 1.6;

interface Key {
  rect: Rect;
  note: number;
  black: boolean;
}

export class PianoCanvas extends Piano {
  private ctx: CanvasRenderingContext2D;

  private keys: Key[] = [];

  private whiteKeyWidth!: number;
  private blackKeyWidth!: number;
  private whiteKeyHeight!: number;
  private blackKeyHeight!: number;

  constructor(private canvas: HTMLCanvasElement) {
    super();

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D Context not found");
    this.ctx = ctx;
    this.resize();

    let self = this;
    let render = function () {
      self.redraw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  public resize(width: number = window.innerWidth) {
    this.whiteKeyWidth = width / this.numWhiteKeys();
    this.blackKeyWidth = this.whiteKeyWidth / FACTOR_BLACK_KEYS_WIDTH;

    this.whiteKeyHeight = width / 8;
    this.blackKeyHeight = this.whiteKeyHeight / FACTOR_BLACK_KEYS_HEIGHT;

    this.canvas.width = this.getWidth();
    this.canvas.height = this.whiteKeyHeight;
    this.buildRects();
    this.redraw();
  }

  public getKeyAtPoint(e: MouseEvent) {
    const canvasX = e.clientX - this.canvas.getBoundingClientRect().left;
    const canvasY = e.clientY - this.canvas.getBoundingClientRect().top;

    if (canvasY < this.blackKeyHeight)
      for (const key of this.keys.filter((k) => k.black == true))
        if (key.rect.contains(canvasX, canvasY)) return key;

    for (const key of this.keys.filter((k) => k.black == false))
      if (key.rect.contains(canvasX, canvasY)) return key;

    return null;
  }

  public getKeyFromNote(note: number) {
    return this.keys.find((k) => k.note == note);
  }

  private buildRects() {
    let curXPos = 0;
    this.keys = [];
    for (var midiNote = this.bottomNote; midiNote <= this.topNote; midiNote++) {
      if (!isBlackKey(midiNote)) {
        const rect = new Rect(
          curXPos,
          0,
          this.whiteKeyWidth,
          this.whiteKeyHeight
        );
        this.keys.push({
          rect,
          note: midiNote,
          black: false,
        });
        curXPos += this.whiteKeyWidth;
      } else {
        const rect = new Rect(
          curXPos - this.blackKeyWidth / 2,
          0,
          this.blackKeyWidth,
          this.blackKeyHeight
        );
        this.keys.push({
          rect,
          note: midiNote,
          black: true,
        });
      }
    }
  }

  public redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawKeys();
  }

  private isKeyPressed(note: number) {
    return this.getPressedKeys().some(
      (pressedKey) => pressedKey.note.note === note
    );
  }

  private drawKeys() {
    const whiteGradient = this.ctx.createLinearGradient(0, 0, 0, 100);
    whiteGradient.addColorStop(0, "grey");
    whiteGradient.addColorStop(0.4, "white");

    const blackRadient = this.ctx.createLinearGradient(0, 0, 0, 100);
    blackRadient.addColorStop(0, "#2b2b2b");
    blackRadient.addColorStop(0.3, "black");

    this.ctx.fillStyle = whiteGradient;
    for (const key of this.keys.filter((k) => k.black == false)) {
      const pressed = this.isKeyPressed(key.note);

      const percent = this.updateKeyHeight(key, this.whiteKeyHeight, pressed);

      this.ctx.beginPath();
      this.ctx.roundRect(
        key.rect.x,
        key.rect.y,
        key.rect.w,
        key.rect.h,
        [0, 0, 4, 4]
      );
      this.ctx.fill();
      this.ctx.strokeRect(
        key.rect.x,
        key.rect.y,
        key.rect.w - 1 * percent,
        key.rect.h
      );
    }
    this.ctx.fillStyle = blackRadient;
    for (const key of this.keys.filter((k) => k.black == true)) {
      const pressed = this.isKeyPressed(key.note);

      this.updateKeyHeight(key, this.blackKeyHeight, pressed);

      this.ctx.beginPath();
      this.ctx.roundRect(
        key.rect.x,
        key.rect.y,
        key.rect.w,
        key.rect.h,
        [0, 0, 2, 2]
      );
      this.ctx.fill();
    }
  }

  private updateKeyHeight(key: Key, defaultHeight: number, pressed: boolean) {
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

  public getWidth() {
    return this.whiteKeyWidth * this.numWhiteKeys();
  }
}
