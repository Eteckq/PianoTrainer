<script setup lang="ts">
import VueDraggableResizable from "vue-draggable-resizable";
const opened = defineModel({ default: false });

</script>

<template>
  <!-- Modal -->
  <Teleport to="body">
    <vue-draggable-resizable
      v-show="opened"
      class="absolute bg-pallet-secondary top-16 left-16"
      :minHeight="100"
      :minWidth="300"
      :z="300"
      :w="335"
      :h="400"
      drag-handle=".header"
    >
      <div
        class="header w-full border-b p-2 flex gap-6 items-center justify-between cursor-move font-medium text-xl"
      >
        <slot name="title" />
        <div
          class="cursor-pointer p-1 transform rotate-45 text-3xl hover:text-gray-800"
          @click="opened = false"
        >
          +
        </div>
      </div>
      <div class="overflow-y-scroll h-full scrollbar-thin scrollbar-track-transparent scrollbar-thumb-pallet-primary content">
        <slot name="content" />
      </div>
    </vue-draggable-resizable>
  </Teleport>
</template>

<style scoped>
.content {
  height: calc(100% - 61px)
}
</style>