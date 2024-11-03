<script setup lang="ts">
import { connect, connected, disconnect, joinRoom, roomInfo } from "~/src/socket";
const connecting = ref(false);
await connect();
const roomName = ref('')

async function connectToSocket() {
  connecting.value = true;
  await connect();
  connecting.value = false;
}
</script>

<template>
  <Param>
    <template #button>
      <div class="py-2 px-4 bg-pallet-secondary rounded">Socket</div>
    </template>
    <template #title> Socket Configuration </template>
    <template #content>
      <div class="p-4">
        <div v-if="connected">
          Websocket is connected
          <div
            class="p-1 cursor-pointer bg-pallet-primary text-pallet-text rounded-sm px-3 hover:bg-opacity-85"
            @click="disconnect"
          >
            OFF
          </div>
          <div v-if="roomInfo.name" class="text-pallet-text text-xl">
            Room: {{ roomInfo.name }} ({{ roomInfo.users }})
          </div>
          <input v-model="roomName" type="text" placeholder="room">
          <div @click="joinRoom(roomName)">Join</div>
        </div>
        <div v-else-if="connecting">...</div>
        <div v-else>
          <div
            class="p-1 cursor-pointer bg-pallet-primary text-pallet-text rounded-sm px-3 hover:bg-opacity-85"
            @click="connectToSocket"
          >
            Active socket mode
          </div>
        </div>
      </div>
    </template>
  </Param>
</template>
