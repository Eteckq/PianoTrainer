import type { INote, INoteName, IRect } from ".";



const notesNames: INoteName[] = [
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

export function getNoteNameFromNumber(note: number): INoteName {
  return notesNames[note % 12]
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