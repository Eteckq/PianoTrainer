<script setup lang="ts">
import { sustain } from "~/src/audio/engine";
import { emitSustainOff, emitSustainOn, NoteOrigin } from "~/src/NoteHandler";
import { connect, disconnect, ws } from "~/src/socket";
await connect()
</script>

<template>
  <div class="absolute" v-if="!sustain" @click="emitSustainOn(NoteOrigin.MOUSE)">{{sustain}}</div>
  <div class="absolute" v-else @click="emitSustainOff(NoteOrigin.MOUSE)">{{sustain}}</div>
  <div class="bg-pallet-primary text-pallet-primary overflow-hidden">
    <div class="flex items-center gap-4 p-4">
      <ParamMIDI />
      <Param>
        <template #button>
          <div class="py-2 px-4 bg-pallet-secondary rounded">Socket</div>
        </template>
        <template #title> Socket Configuration </template>
        <template #content>
          <div class="p-4">
            <div v-if="ws?.OPEN">
              Websocket is connected
              <div
                class="p-1 cursor-pointer bg-pallet-primary text-pallet-text rounded-sm px-3 hover:bg-opacity-85"
                @click="disconnect"
              >
                OFF
              </div>
            </div>
            <div v-else>
              <div
                class="p-1 cursor-pointer bg-pallet-primary text-pallet-text rounded-sm px-3 hover:bg-opacity-85"
                @click="connect"
              >
                Active socket mode
              </div>
            </div>
          </div>
        </template>
      </Param>
    </div>
  </div>
</template>
