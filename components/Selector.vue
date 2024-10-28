<script setup lang="ts">
import type { IChordName, INoteName } from "~/src";
import { chords, notesNames } from "~/src/utils";

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false,
  },
});
const selectedNotes: Ref<INoteName[]> = ref(["C"]);
const selectedChords: Ref<IChordName[]> = ref(["Major"]);

if (props.multiple) {
  selectedNotes.value = [...notesNames];
}

const emits = defineEmits<{
  select: [notes: INoteName[], chords: IChordName[]];
}>();

function toggleSelectedChord(chord: IChordName) {
  append(selectedChords.value, chord);
}

function toggleSelectedNote(note: INoteName) {
  append(selectedNotes.value, note);
}

function append<T>(array: T[], value: T) {
  if (props.multiple) {
    if (array.some((c) => c == value)) {
      if (array.length == 1) return;
      const i = array.indexOf(value);
      if (i != -1) array.splice(i, 1);
    } else {
      array.push(value);
    }
  } else {
    array.shift();
    array.push(value);
  }
  sendValues();
}

function sendValues() {
  emits("select", selectedNotes.value, selectedChords.value);
}

onMounted(() => {
  sendValues();
});
</script>

<template>
  <div class="flex justify-center h-full gap-8 items-center text-center">
    <div class="">
      <h2>Root note</h2>
      <div
        class="border p-2 overflow-y-scroll scrollbar-thin scrollbar-thumb-slate-500 h-52"
      >
        <div
          @click="toggleSelectedNote(note)"
          v-for="note in notesNames"
          :class="{ 'text-yellow-300': selectedNotes.some((n) => n == note) }"
          class="cursor-pointer"
        >
          {{ note }}
        </div>
      </div>
    </div>
    <div class="">
      <h2>Chord</h2>
      <div
        class="border p-2 overflow-y-scroll scrollbar-thin scrollbar-thumb-slate-500 h-52"
      >
        <div
          @click="toggleSelectedChord(chord.name)"
          :class="{
            'text-yellow-300': selectedChords.some((c) => c == chord.name),
          }"
          class="cursor-pointer"
          v-for="chord in chords"
        >
          {{ chord.name }}
        </div>
      </div>
    </div>
  </div>
</template>
