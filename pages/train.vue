<script setup lang="ts">
import type { INoteName, IChordName, IChord, ChordInfo } from "~/src";
import { analyze } from "~/src/ChordAnalyser";
import { on, pressedKeys } from "~/src/NoteHandler";

const selectedNotes: Ref<INoteName[]> = ref(["C"]);
const selectedMode: Ref<IChordName[]> = ref(["Major"]);

const chordsToFound: Ref<IChord[]> = ref([]);

on("note:on", () => {
  checkChord(analyze(pressedKeys.map((k) => k.midi)));
});
on("note:off", () => {
  checkChord(analyze(pressedKeys.map((k) => k.midi)));
});

const pickInArray = (array: any[]) =>
  array[Math.floor(Math.random() * array.length)];

function start() {
  for (let i = 0; i < 3; i++) {
    chordsToFound.value.push(pickChord());
  }
}

function checkChord(analyzed: ChordInfo[]) {
  if (
    analyzed.some(
      (ci) =>
        ci.name == chordsToFound.value[0].chord &&
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
    chord: pickInArray(selectedMode.value),
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
        class=" flex flex-col gap-6 justify-center items-center"
        style="font-size: 20px;"
        @click="chordFound"
        name="list"
        tag="ul"
      >
        <!-- :style="[{'font-size': `${50-(i*15)}px`}, {'opacity': `${(100-(i*40))/100}`}]" -->
        <div class="TG" v-for="(item, i) in chordsToFound" :key="item">
          <span class="mr-1">{{ item.note }}</span
          ><span>{{ item.chord }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all .5s ease;
  opacity: .2;
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


.TG.list-move:nth-child(2) {
  font-size: 50px;
  opacity: 1;
}

.TG:nth-child(1) {
  font-size: 50px;
  opacity: 1;
}

.TG.list-move:nth-child(3) {
  font-size: 30px;
  opacity: .5;
}

.TG:nth-child(2) {
  font-size: 30px;
  opacity: .5;
}



.TG:nth-child(3) {
  opacity: .2;
}

</style>
