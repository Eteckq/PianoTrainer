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
    const json: Message = JSON.parse(m.text());
    console.log(peer.peers.size);
    
    peer.publish("piano", m);
  },
  // close(peer) {
  //   peer.publish("piano", { user: "server", message: `${peer} left!` });
  // },
});
