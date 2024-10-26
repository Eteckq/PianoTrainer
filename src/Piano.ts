import type Note from "./interfaces/Note";
import { isBlackKey, notes } from "./utils";

export class Piano {
  protected pressedKeys: { velocity: number; note: Note }[] = [];
  private numberOfWhiteKeys: number;

  protected bottomNote = 21;
  protected topNote = 108;
  private notes = notes;

  constructor() {
    this.numberOfWhiteKeys = 0;
    this.setNumWhiteKeys();
  }

  private setNumWhiteKeys() {
    let numberOfNotes = this.topNote - this.bottomNote;
    let numberOfOctaves = Math.floor(numberOfNotes / 12);
    this.numberOfWhiteKeys = numberOfOctaves * 7 + 1;

    if (numberOfNotes % 12 === 0) {
      return;
    }

    let noteRemainderBottom = this.bottomNote + numberOfOctaves * 12 + 1;

    for (let i = noteRemainderBottom; i <= this.topNote; i++) {
      if (!isBlackKey(i)) {
        this.numberOfWhiteKeys++;
      }
    }
  }

  public numWhiteKeys() {
    return this.numberOfWhiteKeys;
  }

  public getNotes() {
    return this.notes;
  }

  public getNoteFromMidiNote(note: number) {
    return this.notes.find((n) => n.note == note);
  }

  public getPressedKeys() {
    return this.pressedKeys;
  }

  public pressKey(key: number, velocity: number): void {
    const alreadyPressed = this.pressedKeys.find((pk) => pk.note.note == key);
    if (alreadyPressed) return;
    const n = this.getNoteFromMidiNote(key);
    if (!n) return;
    this.pressedKeys.push({
      note: n,
      velocity: velocity,
    });
  }

  public unpressKey(key: number): void {
    this.pressedKeys = this.pressedKeys.filter((pk) => pk.note.note != key);
  }
}
