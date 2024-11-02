import { INoteHandlerEvents, NoteOrigin } from "~/src/NoteHandler";

export interface MessageSocket {
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
    peer.publish("piano", m.toString());
  },
  // close(peer) {
  //   peer.publish("piano", { user: "server", message: `${peer} left!` });
  // },
});
