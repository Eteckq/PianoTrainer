<script setup lang="ts">
const show = ref(false);

function log(u: string, ...m: string[]) {
  console.log(u, m);
}
let ws: WebSocket;

const connect = async () => {
  const isSecure = location.protocol === "https:";
  const url = (isSecure ? "wss://" : "ws://") + location.host + "/_ws";
  if (ws) {
    log("ws", "Closing previous connection before reconnecting...");
    ws.close();
  }

  log("ws", "Connecting to", url, "...");
  ws = new WebSocket(url);

  ws.addEventListener("message", async (event) => {
    let data = typeof event.data === "string" ? data : await event.data.text();
    const { user = "system", message = "" } = data.startsWith("{")
      ? JSON.parse(data)
      : { message: data };
    log(user, typeof message === "string" ? message : JSON.stringify(message));
  });

  await new Promise((resolve) => ws.addEventListener("open", resolve));
  log("ws", "Connected!");

  ping()
};


const ping = () => {
  log("ws", "Sending ping");
  ws.send("ping");
};

await connect();
</script>

<template>
  <div
    class="flex flex-col transition-all duration-500 text-white h-screen overflow-hidden"
  >
    <div
      class="absolute bottom-2 right-2 z-10 cursor-pointer"
      @click="show = !show"
    >
      <span :class="{ 'opacity-50': !show }">⚙️</span>
    </div>

    <Navbar />
    <div class="grow w-full">
      <slot />
    </div>
    <Piano />
    <BottomBar
      class="transition-all duration-500"
      :class="[show ? 'h-16' : 'h-0']"
    />
  </div>
</template>
