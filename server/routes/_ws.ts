import { Peer } from "crossws";
import { MessageType, RoomMessage } from "~/src";
import { isChatMessage, isPianoMessage, isRoomMessage } from "~/src/utils";

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
    const message = m.json<MessageType>();
    let room = rooms.find((r) => r.present(peer));
    if (!room) return console.log("USER WITHOUT ROOM");

    if (isPianoMessage(message)) {
      room.broadcast(message, peer);
    } else if (isRoomMessage(message)) {
      if (message.name.length > 50) return;
      room = joinOrCreate(message.name, peer);
    }else if (isChatMessage(message)) {
      if (message.txt.length > 50) return;
      room.broadcast(message)
    }
  },
  close(peer) {
    kickUserFromEveryRooms(peer);
  },
});
