import {
  bottomNote,
  getNoteFromMidiNote,
  getNumWhiteKeys,
  isBlackKey,
  topNote,
} from "./utils";
import { noteHandler } from ".";

const FACTOR_BLACK_KEYS_WIDTH = 1.7;
const FACTOR_BLACK_KEYS_HEIGHT = 1.6;

class Rect {
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number
  ) {}

  contains(x: number, y: number): boolean {
    return (
      x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
    );
  }
}

interface Key {
  rect: Rect;
  note: number;
  black: boolean;
}

export class PianoCanvas {
  private ctx: CanvasRenderingContext2D;

  private keys: Key[] = [];

  private hightligtedKeys: { note: number; color: string }[] = [];

  private whiteKeyWidth!: number;
  private blackKeyWidth!: number;
  private whiteKeyHeight!: number;
  private blackKeyHeight!: number;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D Context not found");
    this.ctx = ctx;

    this.resize();
    this.render();

    this.setHightligtedKeys([45, 42, 55, 67])
  }

  public setHightligtedKeys(notes: number[], color: string = "yellow") {
    this.hightligtedKeys = [];
    for (const note of notes) {
      this.hightligtedKeys.push({ note, color });
    }
  }

  private render() {
    this.redraw();
    requestAnimationFrame(() => this.render());
    // setTimeout(() => {
    //   this.render()
    // }, 1000/60);
    // console.count('c')
  }

  public resize(width: number = window.innerWidth) {
    this.whiteKeyWidth = width / getNumWhiteKeys();
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
    for (var midiNote = bottomNote; midiNote <= topNote; midiNote++) {
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
    return noteHandler.pressedKeys.some(
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

    const drawKey = (key: Key) => {
      const hightligtedKey = this.hightligtedKeys.find((k) => k.note === key.note);
      const defaultGradient = key.black ? blackRadient : whiteGradient;
      const customGradient = this.ctx.createLinearGradient(0, 0, 0, 100);
    
      if (hightligtedKey) {
        customGradient.addColorStop(0, key.black ? "#2b2b2b" : "grey");
        customGradient.addColorStop(1, hightligtedKey.color);
        this.ctx.fillStyle = customGradient;
      } else {
        this.ctx.fillStyle = defaultGradient;
      }
    
      const pressed = this.isKeyPressed(key.note);
      const keyHeight = key.black ? this.blackKeyHeight : this.whiteKeyHeight;
      const percent = this.updateKeyHeight(key, keyHeight, pressed);
    
      this.ctx.beginPath();
      this.ctx.roundRect(
        key.rect.x,
        key.rect.y,
        key.rect.w,
        key.rect.h,
        key.black ? [0, 0, 2, 2] : [0, 0, 4, 4]
      );
      this.ctx.fill();
    
      if (!key.black) {
        this.ctx.strokeRect(
          key.rect.x,
          key.rect.y,
          key.rect.w - 1 * percent,
          key.rect.h
        );
      }
    };
    
    this.keys.filter((key) => !key.black).forEach((key) => drawKey(key));
    this.keys.filter((key) => key.black).forEach((key) => drawKey(key));
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
    return this.whiteKeyWidth * getNumWhiteKeys();
  }
}
