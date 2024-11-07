<script setup lang="ts">
import {
  connect,
  connected,
  disconnect,
  joinRoom,
  roomInfo,
} from "~/src/socket";
const connecting = ref(false);
await connect();
const roomName = ref("");

async function connectToSocket() {
  connecting.value = true;
  await connect();
  connecting.value = false;
}
</script>

<template>
  <Param>
    <template #button>
      <div
        v-if="connected"
        class="absolute ml-4 left-0 flex text-gray-400 items-center gap-4 h-12"
      >
        Connected in room {{ roomInfo.name }} 🤵 {{ roomInfo.users }}
      </div>
      <div
        v-else
        class="absolute ml-4 left-0 flex text-gray-400 items-center gap-4 h-12"
      >
        Offline mode
      </div>
    </template>
    <template #title> Socket Configuration </template>
    <template #content>
      <div class="p-4 text-center">
        <div v-if="connected">
          <div
            v-if="roomInfo.name"
            class="text-pallet-primary font-medium my-2 text-xl"
          >
            Room: {{ roomInfo.name }} ({{ roomInfo.users }})
          </div>
          <div class="flex gap-1 justify-center">
            <input class="" v-model="roomName" maxlength="50" type="text" placeholder="room" />
            <div
              class="p-1 cursor-pointer bg-green-500 text-pallet-text rounded-sm px-3 hover:bg-opacity-85 inline-block"
              @click="joinRoom(roomName)"
            >
              Join
            </div>
          </div>
          <div
            class="p-1 cursor-pointer bg-red-500 text-pallet-text rounded-sm px-3 hover:bg-opacity-85 mt-16"
            @click="disconnect"
          >
            Disconnect
          </div>
        </div>
        <div v-else-if="connecting">...</div>
        <div v-else>
          <div
            class="p-1 cursor-pointer bg-pallet-primary text-pallet-text rounded-sm px-3 hover:bg-opacity-85"
            @click="connectToSocket"
          >
            Connect!
          </div>
        </div>
      </div>
    </template>
  </Param>
</template>
