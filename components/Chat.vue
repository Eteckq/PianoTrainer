<template>
  <div>
    <div ref="chatList" class="h-56 overflow-y-scroll scrollbar-none">
      <div v-for="chat in chatMessages">{{ chat.user }}: {{ chat.txt }}</div>
    </div>
    <input
      class="p-1 bg-pallet-primary rounded-sm bg-opacity-30"
      maxlength="49"
      v-model="c"
      placeholder="message"
      @keydown.enter="
        sendChatMsg(c);
        c = '';
      "
      type="text"
    />
  </div>
</template>

<script setup lang="ts">
import { chatMessages, sendChatMsg } from "~/src/socket";

watch(
  chatMessages,
  () => {
    nextTick(function () {
      chatList.value.scrollTop = chatList.value.scrollHeight;
    });
  },
  { deep: true }
);

const c = ref("");
const chatList = ref();
</script>
