import type { MessageType, RoomMessage, PianoMessage, ChatMessage } from ".";
import {
  emitNoteOff,
  emitNoteOn,
  emitSustainOff,
  emitSustainOn,
  NoteOrigin,
  on,
} from "./NoteHandler";
import { isChatMessage, isPianoMessage, isRoomMessage } from "./utils";

export const ws: Ref<WebSocket | null> = ref(null);
export const connected = ref(false);
export const chatMessages: Ref<{ user: string; txt: string }[]> = ref([]);
export const roomInfo = reactive({ name: "", users: 0 });
export const pseudo = ref("");

let storedPseudo = localStorage.getItem("pseudo");
if (storedPseudo) {
  pseudo.value = storedPseudo;
}

watch(pseudo, () => {
  localStorage.setItem("pseudo", pseudo.value);
});

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

      if (isPianoMessage(message)) {
        if (message.cmd == "note:on") {
          if (!message.note || !message.vel) return;
          emitNoteOn(message.note, message.vel, NoteOrigin.SOCKET);
        }
        if (message.cmd == "note:off") {
          if (!message.note) return;
          emitNoteOff(message.note, NoteOrigin.SOCKET);
        }
        if (message.cmd == "sustain:on") {
          emitSustainOn(NoteOrigin.SOCKET);
        }
        if (message.cmd == "sustain:off") {
          emitSustainOff(NoteOrigin.SOCKET);
        }
      } else if (isRoomMessage(message)) {
        if (!message.users) return;
        roomInfo.name = message.name;
        roomInfo.users = message.users;
      } else if (isChatMessage(message)) {
        chatMessages.value.push(message);
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

export function joinRoom(room: string) {
  const message: RoomMessage = {
    name: room,
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
  return (
    origin == NoteOrigin.SOCKET ||
    origin == NoteOrigin.APP ||
    !ws.value ||
    !connected.value
  );
};

on("note:on", (note, vel, origin) => {
  if (socketGuard(origin)) return;
  const message: PianoMessage = {
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
    cmd: "note:off",
    note,
    origin,
  };
  ws.value?.send(JSON.stringify(message));
});

on("sustain:on", (origin) => {
  if (socketGuard(origin)) return;
  const message: PianoMessage = {
    cmd: "sustain:on",
    origin,
  };
  ws.value?.send(JSON.stringify(message));
});

on("sustain:off", (origin) => {
  if (socketGuard(origin)) return;
  const message: PianoMessage = {
    cmd: "sustain:off",
    origin,
  };
  ws.value?.send(JSON.stringify(message));
});

export function sendChatMsg(txt: string) {
  const message: ChatMessage = {
    user: pseudo.value,
    txt,
  };
  ws.value?.send(JSON.stringify(message));
}
