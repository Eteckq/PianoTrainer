import type { IChordName, INote, INoteName, IRect } from ".";

export type IChordInfo = {
  name: IChordName;
  interval: number[];
  notation: string;
};

export const chords: IChordInfo[] = [
  { name: "Major", interval: [0, 4, 7], notation: "maj" },
  { name: "Minor", interval: [0, 3, 7], notation: "min" },
  { name: "5th", interval: [0, 7], notation: "5" },
  { name: "Suspended 2nd", interval: [0, 2, 7], notation: "sus2" },
  { name: "Suspended 4th", interval: [0, 5, 7], notation: "sus4" },
  { name: "7th", interval: [0, 4, 7, 10], notation: "7" },
  { name: "Major 7th", interval: [0, 4, 7, 11], notation: "maj7" },
  { name: "Minor 7th", interval: [0, 3, 7, 10], notation: "m7" },
  { name: "7th Flat 5", interval: [0, 4, 6, 10], notation: "7♭5" },
  { name: "7th Sharp 5", interval: [0, 4, 8, 10], notation: "7♯5" },
  {
    name: "Minor 7th Flat 5th",
    interval: [0, 3, 6, 10],
    notation: "m7♭5",
  },
  { name: "Minor Major 7th", interval: [0, 3, 7, 11], notation: "minmaj7" },
  { name: "7th Suspended 4th", interval: [0, 5, 7, 10], notation: "7sus4" },
  { name: "6th", interval: [0, 4, 7, 9], notation: "6" },
  { name: "Minor 6th", interval: [0, 3, 7, 9], notation: "min6" },
  { name: "6th Add 9", interval: [0, 4, 7, 9, 2], notation: "6add9" },
  { name: "9th", interval: [0, 4, 7, 10, 2], notation: "9" },
  { name: "Major 9th", interval: [0, 4, 7, 11, 2], notation: "maj9" },
  { name: "Minor 9th", interval: [0, 3, 7, 10, 2], notation: "m9" },
  { name: "Minor Major 9th", interval: [0, 3, 7, 11, 2], notation: "minmaj9" },
  { name: "11th", interval: [0, 4, 7, 10, 2, 5], notation: "11" },
  { name: "Major 11th", interval: [0, 4, 7, 11, 2, 5], notation: "maj11" },
  { name: "Minor 11th", interval: [0, 3, 7, 10, 2, 5], notation: "m11" },
  { name: "Diminished", interval: [0, 3, 6], notation: "dim" },
  { name: "Diminished 7th", interval: [0, 3, 6, 9], notation: "dim7" },
  { name: "Diminished Major 7th", interval: [0, 3, 6, 11], notation: "dimM7" },
  { name: "Augmented", interval: [0, 4, 8], notation: "aug" },
  { name: "Augmented Major 7th", interval: [0, 4, 8, 11], notation: "augM7" },
];




export const notesNames: INoteName[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const notes: INote[] = [];

export const bottomNote = 21;
export const topNote = 108;

for (let i = bottomNote; i <= topNote; i++) {
  notes.push({
    midi: i,
    black: isBlackKey(i),
    name: getNoteNameFromNumber(i),
    octave: Math.floor(i / 12) - 1
  });
}

export function getMidiFromNote(name: INoteName): number {
  return notesNames.indexOf(name)
}

export function getNoteNameFromNumber(midi: number): INoteName {
  return notesNames[midi % 12]
}

export function isBlackKey(midiPitch: number) {
  let noteMod = midiPitch % 12;

  return (
    noteMod === 1 ||
    noteMod === 3 ||
    noteMod === 6 ||
    noteMod === 8 ||
    noteMod === 10
  );
}

export function getNoteFromMidiNote(note: number) {
  return notes.find((n) => n.midi == note);
}



export function getNumWhiteKeys() {
  let numberOfNotes = topNote - bottomNote;
  let numberOfOctaves = Math.floor(numberOfNotes / 12);
  let numberOfWhiteKeys = numberOfOctaves * 7 + 1;

  if (numberOfNotes % 12 === 0) {
    return numberOfWhiteKeys;
  }

  let noteRemainderBottom = bottomNote + numberOfOctaves * 12 + 1;

  for (let i = noteRemainderBottom; i <= topNote; i++) {
    if (!isBlackKey(i)) {
      numberOfWhiteKeys++;
    }
  }
  return numberOfWhiteKeys
}

export function contains(rect: IRect, x: number, y: number){
  return (
    x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h
  );
}