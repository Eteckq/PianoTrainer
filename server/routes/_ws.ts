import { INoteHandlerEvents, NoteOrigin } from "~/src/NoteHandler";

export interface Message {
  cmd: keyof INoteHandlerEvents;
  note: number;
  vel: number;
  origin: NoteOrigin;
}

export default defineWebSocketHandler({
  open(peer) {
    peer.subscribe("piano");
  },
  message(peer, message) {
    const json: Message = message.json();
    peer.publish("piano", message);
  },
  // close(peer) {
  //   peer.publish("piano", { user: "server", message: `${peer} left!` });
  // },
});
