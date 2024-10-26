import { isBlackKey } from "./utils";
import { Piano } from "./Piano";
import Rect from "./Rect";

const FACTOR_BLACK_KEYS_WIDTH = 2;
const FACTOR_BLACK_KEYS_HEIGHT = 1.6;

export class PianoCanvas extends Piano {
  private ctx: CanvasRenderingContext2D;

  private keys: { rect: Rect; note: number; black: boolean }[] = [];

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
  }

  public resize(width: number = window.innerWidth) {
    this.whiteKeyWidth = width / 52;
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

  override pressKey(key: number, velocity: number): void {
    super.pressKey(key, velocity);
    this.redraw();
  }

  override unpressKey(key: number): void {
    super.unpressKey(key);
    this.redraw();
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
      const pressed = this.getPressedKeys().some(
        (k) => k.note.note == key.note
      );
      const y = !pressed ? key.rect.y : key.rect.y - 5;
      const w_stroke = !pressed ? key.rect.w : key.rect.w - 1;
      this.ctx.fillRect(key.rect.x, y, key.rect.w, key.rect.h);
      this.ctx.strokeRect(key.rect.x, y, w_stroke, key.rect.h);
    }
    this.ctx.fillStyle = blackRadient;
    for (const key of this.keys.filter((k) => k.black == true)) {
      const pressed = this.getPressedKeys().some(
        (k) => k.note.note == key.note
      );
      const y = !pressed ? key.rect.y : key.rect.y - 3;
      this.ctx.fillRect(key.rect.x, y, key.rect.w, key.rect.h);
    }
  }

  public getWidth() {
    return this.whiteKeyWidth * this.numWhiteKeys();
  }
}
