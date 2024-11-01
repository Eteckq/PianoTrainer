<script setup lang="ts">
const opened = defineModel({ default: false });

const modal = ref();

function draggable(el: HTMLElement) {
  el.addEventListener("mousedown", function (e) {
    var offsetX = e.clientX - parseInt(window.getComputedStyle(this).left);
    var offsetY = e.clientY - parseInt(window.getComputedStyle(this).top);

    function mouseMoveHandler(e: MouseEvent) {
      el.style.top = e.clientY - offsetY + "px";
      el.style.left = e.clientX - offsetX + "px";
    }

    function reset() {
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mouseup", reset);
    }

    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", reset);
  });
}

onMounted(() => {
  modal.value.style.top = 100 + "px";
  draggable(modal.value);
});

</script>

<template>
  <!-- Modal -->
  <div ref="modal" v-show="opened" class="rounded bg-pallet-secondary absolute border overflow-y-scroll overflow-x-hidden scrollbar-thin z-10" style="max-height: 50vh;">
    <div
      class="w-full border-b p-2 flex gap-6 items-center justify-between cursor-move font-medium text-xl"
    >
      <slot name="title" />
      <div
        class="cursor-pointer p-1 transform rotate-45 text-3xl hover:text-gray-800"
        @click="opened = false"
      >
        +
      </div>
    </div>
    <slot name="content" />
  </div>
</template>
