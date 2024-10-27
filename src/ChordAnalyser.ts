import type { INoteName } from ".";
import { getNoteNameFromNumber } from "./utils";

const chords = [
  { name: "Major", interval: [0, 4, 7], notation: "maj" },
  { name: "Minor", interval: [0, 3, 7], notation: "min" },
  { name: "5th", interval: [0, 7], notation: "5" },
  { name: "Suspended 2nd", interval: [0, 2, 7], notation: "sus2" },
  { name: "Suspended 4th", interval: [0, 5, 7], notation: "sus4" },
  { name: "7th", interval: [0, 4, 7, 10], notation: "7" },
  { name: "Major 7th", interval: [0, 4, 7, 11], notation: "maj7" },
  { name: "Minor 7th", interval: [0, 3, 7, 10], notation: "m7" },
  { name: "7th Flat 5", interval: [0, 4, 6, 10], notation: "7&flat;5" },
  { name: "7th Sharp 5", interval: [0, 4, 8, 10], notation: "7&sharp;5" },
  {
    name: "Minor 7th Flat 5th",
    interval: [0, 3, 6, 10],
    notation: "m7&flat;5",
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

type ChordInfo = {
    chord: string;
    inversion: number;
    root: INoteName;
    name: string;
  };
  
  function analyze(midiNotes: number[]): ChordInfo[] {
    if (midiNotes.length <= 1) return [];
    const results: ChordInfo[] = [];
    midiNotes = midiNotes.sort((a, b) => a - b);
    const rootNote = getNoteNameFromNumber(midiNotes.sort((a, b) => a - b)[0]);
  
    const normalizedNotes = [...new Set((midiNotes.map((note) => (note - midiNotes[0]) % 12)))]
  
    for (const chord of chords) {
      let intervalInversed = [...chord.interval];
      for (let inversion = 0; inversion < chord.interval.length; inversion++) {
        if (normalizedNotes.toString() === intervalInversed.toString()) {
          results.push({
            chord: `${
              inversion != 0
                ? getNoteNameFromNumber(
                    midiNotes[chord.interval.length - inversion]
                  )
                : rootNote
            }${chord.notation}`,
            name: chord.name,
            root: rootNote,
            inversion: inversion,
          });
          break;
        }
        intervalInversed[0] += 12;
        intervalInversed.push(intervalInversed.shift() || 0);
        intervalInversed = intervalInversed.map(
          (note) => (note - intervalInversed[0]) % 12
        );
      }
    }
  
    return results;
  }
  
  export { analyze };
  