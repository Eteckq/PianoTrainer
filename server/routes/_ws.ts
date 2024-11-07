import { INoteHandlerEvents, NoteOrigin } from "~/src/NoteHandler";
import { Peer } from "crossws";

export interface MessageType {
  type: "piano" | "room";
}

export interface PianoMessage extends MessageType {
  cmd: keyof INoteHandlerEvents;
  note?: number;
  vel?: number;
  origin: NoteOrigin;
}

export interface RoomMessage extends MessageType {
  name: string;
  users?: number;
}

class Room {
  public peers = new Map<string, Peer>();
  constructor(public name: string) {}

  public present(peer: Peer) {
    return this.peers.get(peer.id);
  }

  public addPeer(peer: Peer) {
    this.peers.set(peer.id, peer);
    this.broadcasUserCount();
  }

  public removePeer(peer: Peer) {
    this.peers.delete(peer.id);
    this.broadcasUserCount();
  }

  public broadcast(message: MessageType, origin?: Peer) {
    this.peers.forEach((p) => {
      if (p.id == origin?.id) return;

      p.send(JSON.stringify(message));
    });
  }

  public broadcasUserCount() {
    const rMessage: RoomMessage = {
      type: "room",
      users: this.peers.size,
      name: this.name,
    };
    this.broadcast(rMessage);
  }
}

const rooms: Room[] = [];

function kickUserFromEveryRooms(peer: Peer) {
  const userInRoom = rooms.filter((r) => r.present(peer));
  userInRoom.forEach((r) => {
    r.removePeer(peer);
  });
}

function joinOrCreate(roomName: string, peer: Peer) {
  kickUserFromEveryRooms(peer);

  const existing = rooms.find((r) => r.name == roomName);
  if (!existing) {
    const newRoom = new Room(roomName);
    newRoom.addPeer(peer);
    rooms.push(newRoom);
    return newRoom;
  } else {
    existing.addPeer(peer);
    return existing;
  }
}

export default defineWebSocketHandler({
  open(peer) {
    joinOrCreate("default", peer);
  },
  message(peer, m) {
    const message: MessageType = m.json();
    let room = rooms.find((r) => r.present(peer));
    if (!room) return console.log("USER WITHOUT ROOM");

    switch (message.type) {
      case "piano":
        room.broadcast(message, peer);
        break;
      case "room":
        const roomMessage = message as RoomMessage;
        if(roomMessage.name.length > 50) return
        room = joinOrCreate(roomMessage.name, peer);
        break;
    }
  },
  close(peer) {
    kickUserFromEveryRooms(peer);
  },
});
