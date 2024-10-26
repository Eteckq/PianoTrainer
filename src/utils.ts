import type Note from "./interfaces/Note";

export const notesNames = [
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

export const notes: Note[] = [];

for (let i = 21; i <= 108; i++) {
  notes.push({
    note: i,
    black: isBlackKey(i),
    name: getNoteNameFromNumber(i),
  });
}

export function getNoteNameFromNumber(note: number) {
  return `${notesNames[note % 12]}${Math.floor(note / 12) - 1}`;
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
