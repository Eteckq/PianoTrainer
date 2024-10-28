import type { ChordInfo, INoteName } from ".";
import { chords, getNoteNameFromNumber } from "./utils";

function analyze(midiNotes: number[]): ChordInfo[] {
  if (midiNotes.length <= 1) return [];
  const results: ChordInfo[] = [];
  midiNotes = midiNotes.sort((a, b) => a - b);
  const rootNote = getNoteNameFromNumber(midiNotes[0]);

  const normalizedNotes = [
    ...new Set(midiNotes.map((note) => (note - midiNotes[0]) % 12)),
  ].sort((a, b) => a - b);

  for (const chord of chords) {
    let intervalInversed = [...chord.interval.sort((a, b) => a - b)];
    for (let inversion = 0; inversion < chord.interval.length; inversion++) {
      if (normalizedNotes.toString() === intervalInversed.toString()) {
        const note: INoteName =
          inversion != 0
            ? getNoteNameFromNumber(
                midiNotes[chord.interval.length - inversion]
              )
            : rootNote;
        results.push({
          chord: `${note}${chord.notation}`,
          note,
          name: chord.name,
          root: rootNote,
          inversion,
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
