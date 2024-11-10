<script setup lang="ts">
import type {
  INoteName,
  IChordName,
  IChord,
  IPressedChordInfo,
  IGammeName,
} from "~/src";
import { analyze } from "~/src/ChordAnalyser";
import { off, on, pressedKeys } from "~/src/NoteHandler";
import { chords, type IChordInfo } from "~/src/utils";

type ChordWithInversion = IChord & {
  inversion: number;
};

const selectedNotes: Ref<INoteName[]> = ref(["C"]);
const selectedMode: Ref<(IChordName | IGammeName)[]> = ref(["Major"]);

let selectedChords: IChordInfo[] = [];
const chordsToFound: Ref<ChordWithInversion[]> = ref([]);

const enableReversion = ref(false);

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

function stop() {
  chordsToFound.value = [];
}

function checkChord() {
  if (chordsToFound.value.length === 0) return;
  const analyzed = analyze(pressedKeys.map((k) => k.midi));

  if (
    analyzed.some(
      (ci) =>
        ci.name == chordsToFound.value[0].chord.name &&
        ci.note == chordsToFound.value[0].note &&
        (enableReversion.value
          ? ci.inversion == chordsToFound.value[0].inversion
          : true)
    )
  ) {
    chordFound();
  }
}

function chordFound() {
  chordsToFound.value.shift();
  chordsToFound.value.push(pickChord());
}

function pickChord(): ChordWithInversion {
  const chord = pickInArray(selectedChords);
  return {
    note: pickInArray(selectedNotes.value),
    chord: chord,
    inversion: Math.floor(Math.random() * chord.interval.length),
  };
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full">
    <div v-show="chordsToFound.length == 0" class="flex flex-col items-center justify-center gap-4">
      <Selector
        :multiple="true"
        @select="
          (sn, sc) => {
            selectedNotes = sn;
            selectedMode = sc;
          }
        "
      />
      <div
        class="mb-4 px-4 text-center cursor-pointer rounded inline-block mx-auto"
        :class="[!enableReversion ? 'bg-gray-400' : 'bg-green-400']"
        @click="enableReversion = !enableReversion"
      >
        <p>
          <span v-if="!enableReversion">Enable</span>
          <span v-else>Disable</span> inversions
        </p>
      </div>
      <div
        class="w-full text-2xl font-bold hover:border-pallet-primary border-green-600 text-center border py-2 rounded-sm bg-green-600 cursor-pointer text-pallet-text"
        @click="start"
      >
        Go!
      </div>
    </div>
    <div
      class="grid grid-rows-2 w-full gap-12"
      v-if="chordsToFound.length != 0"
    >
      <div
        class="m-auto text-pallet-text w-1/3 text-2xl font-bold hover:border-red-300 border-red-600 text-center border py-2 rounded-sm bg-red-600 cursor-pointer "
        @click="stop"
      >
        Stop
      </div>
      <div class="h-56">
        <TransitionGroup
          class="flex flex-col gap-6 justify-center items-center"
          style="font-size: 20px"
          @click="chordFound"
          name="list"
          tag="ul"
        >
          <div
            class="customAnim"
            v-for="(item, i) in chordsToFound"
            :key="item"
          >
            <span>{{ item.note }}</span>
            <span>{{ item.chord.notation }}</span>
            <span v-if="enableReversion && item.inversion">
              ~{{ item.inversion }}</span
            >
          </div>
        </TransitionGroup>
      </div>
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
