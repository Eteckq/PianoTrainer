<script setup lang="ts">
import {
  isRecording,
  isRecordingMidi,
  isRecordingPinao,
  isRecordingSound,
  isRecordingVisualizer,
  record,
  stopRecording,
} from "~/src/renders/recorder";
</script>

<template>
  <div class="cursor-pointer ml-auto">
    <span @click="stopRecording()" v-if="isRecording">🔴</span>

    <Param v-else>
      <template #button>
        <div class="">🟢</div>
      </template>
      <template #title>Recorder Options</template>
      <template #content>
        <div class="flex flex-col gap-4 items-center mt-4">
          <div
            @click="isRecordingVisualizer = !isRecordingVisualizer"
            class="cursor-pointer px-2 py-1 rounded"
            :class="{ 'bg-green-500': isRecordingVisualizer }"
          >
            Visualizer
          </div>
          <div
            @click="isRecordingPinao = !isRecordingPinao"
            class="cursor-pointer px-2 py-1 rounded"
            :class="{ 'bg-green-500': isRecordingPinao }"
          >
            Keyboard
          </div>
          <div
            @click="isRecordingSound = !isRecordingSound"
            class="cursor-pointer px-2 py-1 rounded"
            :class="{ 'bg-green-500': isRecordingSound }"
          >
            Sound
          </div>
          <div
            @click="isRecordingMidi = !isRecordingMidi"
            class="cursor-pointer px-2 py-1 rounded"
            :class="{ 'bg-green-500': isRecordingMidi }"
          >
            Midi file
          </div>
          <div
            class="bg-green-700 text-white px-7 py-1 rounded inline-block cursor-pointer"
            @click="record()"
          >
            Start recording
          </div>
        </div>
      </template>
    </Param>
  </div>
</template>
