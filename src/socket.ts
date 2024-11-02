import type { Message } from "~/server/routes/_ws";
import { emitNoteOff, emitNoteOn, NoteOrigin, on } from "./NoteHandler";

function log(u: string, ...m: string[]) {
  console.log(u, m);
}
export let ws: Ref<WebSocket | null> = ref(null);

export const connect = async () => {
  const isSecure = location.protocol === "https:";
  const url = (isSecure ? "wss://" : "ws://") + location.host + "/_ws";
  if (ws.value) {
    log("ws", "Closing previous connection before reconnecting...");
    ws.value.close();
  }

  log("ws", "Connecting to", url, "...");
  ws.value = (new WebSocket(url));

  ws.value.addEventListener("message", async (event) => {
    const message: Message = JSON.parse(await event.data.text());
    if(message.cmd == 'note:on'){
        console.log('get note');
        
        emitNoteOn(message.note, message.vel, NoteOrigin.SOCKET)
    }
    if(message.cmd == 'note:off'){
        emitNoteOff(message.note, NoteOrigin.SOCKET)
    }
  });

  await new Promise((resolve) => ws.value?.addEventListener("open", resolve));
  log("ws", "Connected!");
};

export function disconnect(){
  if (ws.value) {
    ws.value.close();
    ws.value = null
  }
}



on("note:on", (note, vel, origin) => {
  if(origin == NoteOrigin.SOCKET || !ws.value) return
  ws.value.send(JSON.stringify({ cmd: "note:on", note, vel, origin }));
});

on("note:off", (note, origin) => {
  if(origin == NoteOrigin.SOCKET || !ws.value) return
  ws.value.send(JSON.stringify({ cmd: "note:off", note, origin }));
});
