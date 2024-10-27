<script setup lang="ts">
import type { IChordName, INoteName } from "~/src";
import { setHightligtedKeys } from "~/src/renders/piano";
import { chords, getMidiFromNote, notes, notesNames } from "~/src/utils";

const selectedNote: Ref<INoteName> = ref("C");
const selectedChord: Ref<IChordName> = ref("Major");

function setSelectedChord(chord: IChordName) {
  selectedChord.value = chord;
  refreshHighlight();
}
function setSelectedNote(note: INoteName) {
  selectedNote.value = note;
  refreshHighlight();
}

function refreshHighlight() {
  const chord = chords.find((c) => c.name === selectedChord.value);
  if (!chord) return;

  const baseNoteIndex = getMidiFromNote(selectedNote.value);
  const highlightedKeys = notes
    .filter((note) =>
      chord.interval.some(
        (midiInterval) => (midiInterval + baseNoteIndex) % 12 === note.midi % 12
      )
    )
    .map((note) => note.midi);

  setHightligtedKeys(highlightedKeys);
}
</script>

<template>
  <div class="flex flex-col items-center">
    bank
    <div class="flex gap-2">
      <div
        @click="setSelectedChord(chord.name)"
        :class="{ 'text-yellow-300': selectedChord == chord.name }"
        v-for="chord in chords"
      >
        {{ chord.name }}
      </div>
    </div>

    <div class="flex gap-2">
      <div
        @click="setSelectedNote(note)"
        v-for="note in notesNames"
        :class="{ 'text-yellow-300': selectedNote == note }"
      >
        {{ note }}
      </div>
    </div>
  </div>
</template>
