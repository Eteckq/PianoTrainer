import type { MessageSocket } from "~/server/routes/_ws";
import {
  emitNoteOff,
  emitNoteOn,
  emitSustainOff,
  emitSustainOn,
  NoteOrigin,
  on,
} from "./NoteHandler";

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
  ws.value = new WebSocket(url);

  ws.value.addEventListener("message", async (event) => {
    const message: MessageSocket = JSON.parse(event.data);
    if (message.cmd == "note:on") {
      emitNoteOn(message.note, message.vel, NoteOrigin.SOCKET);
    }
    if (message.cmd == "note:off") {
      emitNoteOff(message.note, NoteOrigin.SOCKET);
    }
    if (message.cmd == "sustain:on") {
      emitSustainOn(NoteOrigin.SOCKET);
    }
    if (message.cmd == "sustain:off") {
      emitSustainOff(NoteOrigin.SOCKET);
    }
  });

  await new Promise((resolve) => ws.value?.addEventListener("open", resolve));
  log("ws", "Connected!");
};

export function disconnect() {
  if (ws.value) {
    ws.value.close();
    ws.value = null;
  }
}

on("note:on", (note, vel, origin) => {
  if (origin == NoteOrigin.SOCKET || !ws.value) return;
  ws.value.send(JSON.stringify({ cmd: "note:on", note, vel, origin }));
});

on("note:off", (note, origin) => {
  if (origin == NoteOrigin.SOCKET || !ws.value) return;
  ws.value.send(JSON.stringify({ cmd: "note:off", note, origin }));
});

on("sustain:on", (origin) => {
  if (origin == NoteOrigin.SOCKET || !ws.value) return;
  ws.value.send(JSON.stringify({ cmd: "sustain:on", origin }));
});

on("sustain:off", (origin) => {
  if (origin == NoteOrigin.SOCKET || !ws.value) return;
  ws.value.send(JSON.stringify({ cmd: "sustain:off", origin }));
});
