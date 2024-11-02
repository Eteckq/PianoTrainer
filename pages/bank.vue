<script setup lang="ts">
import type { IChordName, IGammeName, INoteName } from "~/src";
import { setHighlightedKeys } from "~/src/renders/piano";
import {
  chords,
  gammes,
  getMidiFromNote,
  notes,
  type IChordInfo,
  type IGammeInfo,
} from "~/src/utils";

function refreshHighlight(
  selectedNotes: INoteName[],
  selectedChords: (IChordName | IGammeName)[]
) {
  let c: IChordInfo | IGammeInfo | undefined = chords.find(
    (c) => c.name === selectedChords[0]
  );
  if (!c) {
    c = gammes.find((c) => c.name === selectedChords[0]);
  }
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
    <Selector :allowGamme="true" @select="refreshHighlight" />
  </div>
</template>
