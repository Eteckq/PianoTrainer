<script setup lang="ts">
import type { IChordName, IGammeName, INoteName } from "~/src";
import { chords, gammes, notesNames } from "~/src/utils";

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false,
  },
  allowGamme: {
    type: Boolean,
    default: false,
  },
});
const selectedNotes: Ref<INoteName[]> = ref(["C"]);
const selectedChords: Ref<(IChordName | IGammeName)[]> = ref(["Major"]);

if (props.multiple) {
  selectedNotes.value = [...notesNames];
}

const emits = defineEmits<{
  select: [notes: INoteName[], chords: (IChordName | IGammeName)[]];
}>();

function toggleSelectedChord(chord: IChordName | IGammeName) {
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
  <div class="flex flex-col justify-center h-full gap-4 items-center text-center text-xs md:text-xl text-pallet-text">
    <div class="">
      <h2 class="mb-3 font-medium">Root note</h2>
      <div
        class="p-2 flex gap-2"
      >
        <div
          @click="toggleSelectedNote(note)"
          v-for="note in notesNames"
          :class="{ 'border-pallet-secondary text-pallet-secondary': selectedNotes.some((n) => n == note) }"
          class="cursor-pointer border py-1 md:py-2 w-8 md:w-12 rounded-sm"
        >
          {{ note }}
        </div>
      </div>
    </div>
    <div class="flex gap-12">
      <div class="">
      <h2 class="mb-3 font-medium">Chord</h2>
      <div
        class="text-lg border p-2 overflow-y-scroll scrollbar-thin scrollbar-thumb-slate-500 h-28 md:h-60"
      >
        <div
          @click="toggleSelectedChord(chord.name)"
          :class="{
            'text-pallet-secondary': selectedChords.some((c) => c == chord.name),
          }"
          class="cursor-pointer py-1"
          v-for="chord in chords"
        >
          {{ chord.name }}
        </div>
      </div>
    </div>
    <div v-if="allowGamme">
      <h2 class="mb-3 font-medium">Gammes</h2>
      <div
        class="border p-2 overflow-y-scroll scrollbar-thin scrollbar-thumb-slate-500 h-28 md:h-60"
      >
        <div
          @click="toggleSelectedChord(chord.name)"
          :class="{
            'text-pallet-secondary': selectedChords.some((c) => c == chord.name),
          }"
          class="cursor-pointer py-1"
          v-for="chord in gammes"
        >
          {{ chord.name }}
        </div>
      </div>
    </div>
    </div>
  </div>
</template>
