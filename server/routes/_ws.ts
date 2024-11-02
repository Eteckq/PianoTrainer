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
  message(peer, m) {
    peer.publish("piano", m);
  },
  // close(peer) {
  //   peer.publish("piano", { user: "server", message: `${peer} left!` });
  // },
});
