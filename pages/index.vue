<script setup lang="ts">
import { analyze } from '~/src/ChordAnalyser';
import { on, pressedKeys } from '~/src/NoteHandler';
import { setHightligtedKeys } from '~/src/renders/piano';

const result = ref()

on('note:on', (note) => {
    result.value = analyze(pressedKeys.map(k => k.note))
})
on('note:off', (note) => {
    result.value = analyze(pressedKeys.map(k => k.note))
})
console.log("Cmaj", analyze([60, 64, 67]));
console.log("Cmaj inversion 1", analyze([64, 67, 72]));
console.log("Cmaj inversion 2", analyze([55, 60, 64]));
console.log("Cmaj w/ too much notes", analyze([60, 64, 67, 72]));
console.log("Minor 11th", analyze([48, 51, 55, 58, 62, 65]));



</script>



<template>
    <div class="">
        <div class="py-2" v-for="res of result">
            {{ res }}
        </div>
    </div>
</template>