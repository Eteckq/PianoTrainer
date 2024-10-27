/**
 * Rectangle, to display on a canvas
 */
export interface IRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ChordInfo = {
  chord: string;
  inversion: number;
  root: INoteName;
  name: string;
};

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

export type IChordName =
  | "Major"
  | "Minor"
  | "5th"
  | "Suspended 2nd"
  | "Suspended 4th"
  | "7th"
  | "Major 7th"
  | "Minor 7th"
  | "7th Flat 5"
  | "7th Sharp 5"
  | "Minor 7th Flat 5th"
  | "Minor Major 7th"
  | "7th Suspended 4th"
  | "6th"
  | "Minor 6th"
  | "6th Add 9"
  | "9th"
  | "Major 9th"
  | "Minor 9th"
  | "Minor Major 9th"
  | "11th"
  | "Major 11th"
  | "Minor 11th"
  | "Diminished"
  | "Diminished 7th"
  | "Diminished Major 7th"
  | "Augmented"
  | "Augmented Major 7th";

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
