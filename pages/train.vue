<script setup lang="ts">
import type { INoteName, IChordName, IChord, IPressedChordInfo } from "~/src";
import { analyze } from "~/src/ChordAnalyser";
import { off, on, pressedKeys } from "~/src/NoteHandler";
import { chords, type IChordInfo } from "~/src/utils";

const selectedNotes: Ref<INoteName[]> = ref(["C"]);
const selectedMode: Ref<IChordName[]> = ref(["Major"]);

let selectedChords: IChordInfo[] = [];
const chordsToFound: Ref<IChord[]> = ref([]);

onMounted(() => {
  on("note:change", checkChord);
});

onBeforeUnmount(() => {
  off("note:change", checkChord);
});

function pickInArray<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

function start() {
  selectedChords = chords.filter((c) => selectedMode.value.includes(c.name));
  for (let i = 0; i < 3; i++) {
    chordsToFound.value.push(pickChord());
  }
}

function checkChord() {
  if (chordsToFound.value.length === 0) return;
  const analyzed = analyze(pressedKeys.map((k) => k.midi));
  if (
    analyzed.some(
      (ci) =>
        ci.name == chordsToFound.value[0].chord.name &&
        ci.note == chordsToFound.value[0].note
    )
  ) {
    chordFound();
  }
}

function chordFound() {
  chordsToFound.value.shift();
  chordsToFound.value.push(pickChord());
}

function pickChord(): IChord {
  return {
    note: pickInArray(selectedNotes.value),
    chord: pickInArray(selectedChords),
  };
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full">
    <div v-if="chordsToFound.length == 0">
      <Selector
        :multiple="true"
        @select="
          (sn, sc) => {
            selectedNotes = sn;
            selectedMode = sc;
          }
        "
      />
      <div @click="start">GO</div>
    </div>
    <div v-else>
      <TransitionGroup
        class="flex flex-col gap-6 justify-center items-center"
        style="font-size: 20px"
        @click="chordFound"
        name="list"
        tag="ul"
      >
        <div class="customAnim" v-for="(item, i) in chordsToFound" :key="item">
          <span>{{ item.note }}</span
          ><span>{{ item.chord.notation }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
  opacity: 0.2;
}

.list-enter-from,
.list-leave-to {
  font-size: 0px !important;
  transform: translateY(60px);
}

.list-leave-active {
  position: absolute;
  transform: translateY(-100px);
  opacity: 0;
}

.customAnim.list-move:nth-child(2) {
  font-size: 50px;
  opacity: 1;
}

.customAnim:nth-child(1) {
  font-size: 50px;
  opacity: 1;
}

.customAnim.list-move:nth-child(3) {
  font-size: 30px;
  opacity: 0.5;
}

.customAnim:nth-child(2) {
  font-size: 30px;
  opacity: 0.5;
}

.customAnim:nth-child(3) {
  opacity: 0.2;
}
</style>
