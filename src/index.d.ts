/**
 * Rectangle, to display on a canvas
 */
export interface IRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type INoteName =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

/**
 * A piano note
 * - midi: The midi value of the note
 * - black: If the note is a black key
 * - name: Human name for the note
 */
export interface INote {
  midi: number;
  black: boolean;
  name: INoteName;
  octave: number;
}

/**
 * A key on the piano canvas. It contains
 * - rect: The position of the key
 * - note: A note
 */
export interface IKey {
  rect: IRect;
  note: INote;
}
