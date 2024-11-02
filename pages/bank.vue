<script setup lang="ts">
import type { IChordName, INoteName } from "~/src";
import { setHighlightedKeys } from "~/src/renders/piano";
import { chords, getMidiFromNote, notes } from "~/src/utils";

function refreshHighlight(
  selectedNotes: INoteName[],
  selectedChords: IChordName[]
) {
  const c = chords.find((c) => c.name === selectedChords[0]);
  if (!c) return;

  const baseNoteIndex = getMidiFromNote(selectedNotes[0]);
  const highlightedKeys = notes
    .filter((note) =>
      c.interval.some(
        (midiInterval) => (midiInterval + baseNoteIndex) % 12 === note.midi % 12
      )
    )
    .map((note) => note.midi);

    setHighlightedKeys(highlightedKeys);
}

onBeforeUnmount(() => {
  setHighlightedKeys([]);
});
</script>

<template>
  <div class="flex justify-center h-full gap-8 items-center text-center">
    <Selector @select="refreshHighlight" />
  </div>
</template>
