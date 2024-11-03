import type {
  MessageType,
  PianoMessage,
  RoomMessage,
} from "~/server/routes/_ws";
import {
  emitNoteOff,
  emitNoteOn,
  emitSustainOff,
  emitSustainOn,
  NoteOrigin,
  on,
} from "./NoteHandler";

export const ws: Ref<WebSocket | null> = ref(null);
export const connected = ref(false);
export const roomInfo = reactive({name: '', users: 0});

export const connect = async () => {
  const isSecure = location.protocol === "https:";
  const url = (isSecure ? "wss://" : "ws://") + location.host + "/_ws";
  if (ws.value) {
    ws.value.close();
  }

  // log("ws", "Connecting to", url, "...");

  return new Promise((resolve) => {
    ws.value = new WebSocket(url);

    ws.value.addEventListener("message", async (event) => {
      const message: MessageType = JSON.parse(event.data);

      switch (message.type) {
        case "piano":
          const pianoMessage = message as PianoMessage;
          if (pianoMessage.cmd == "note:on") {
            if (!pianoMessage.note || !pianoMessage.vel) break;
            emitNoteOn(pianoMessage.note, pianoMessage.vel, NoteOrigin.SOCKET);
          }
          if (pianoMessage.cmd == "note:off") {
            if (!pianoMessage.note) break;
            emitNoteOff(pianoMessage.note, NoteOrigin.SOCKET);
          }
          if (pianoMessage.cmd == "sustain:on") {
            emitSustainOn(NoteOrigin.SOCKET);
          }
          if (pianoMessage.cmd == "sustain:off") {
            emitSustainOff(NoteOrigin.SOCKET);
          }
          break;
        case "room":
          const roomMessage = message as RoomMessage;
          if(!roomMessage.users) return
          roomInfo.name = roomMessage.name
          roomInfo.users = roomMessage.users
          break;
      }
    });

    ws.value.addEventListener("error", async (event) => {
      connected.value = false;
    });

    ws.value.addEventListener("close", async (event) => {
      connected.value = false;
    });

    ws.value.addEventListener("open", async (event) => {
      connected.value = true;
      resolve(true);
    });
  });
};

export function joinRoom(room: string){
  const message: RoomMessage = {
    type: "room",
    name: room
  };
  ws.value?.send(JSON.stringify(message));
}

export function disconnect() {
  connected.value = false;
  if (ws.value) {
    ws.value.close();
    ws.value = null;
  }
}

const socketGuard = (origin: NoteOrigin) => {
  return origin == NoteOrigin.SOCKET || !ws.value || !connected.value;
};

on("note:on", (note, vel, origin) => {
  if (socketGuard(origin)) return;
  const message: PianoMessage = {
    type: "piano",
    cmd: "note:on",
    note,
    vel,
    origin,
  };
  ws.value?.send(JSON.stringify(message));
});

on("note:off", (note, origin) => {
  if (socketGuard(origin)) return;
  const message: PianoMessage = {
    type: "piano",
    cmd: "note:off",
    note,
    origin,
  };
  ws.value?.send(JSON.stringify(message));
});

on("sustain:on", (origin) => {
  if (socketGuard(origin)) return;
  const message: PianoMessage = {
    type: "piano",
    cmd: "sustain:on",
    origin,
  };
  ws.value?.send(JSON.stringify(message));
});

on("sustain:off", (origin) => {
  if (socketGuard(origin)) return;
  const message: PianoMessage = {
    type: "piano",
    cmd: "sustain:off",
    origin,
  };
  ws.value?.send(JSON.stringify(message));
});
