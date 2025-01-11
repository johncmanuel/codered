import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { ClientArray } from "colyseus";

export class OnLeaveCommand extends Command<
  CodeRedRoom,
  { sessionId: string; clients: ClientArray; roomId: string; options: any }
> {
  execute({ sessionId, clients, options, roomId } = this.payload) {
    this.state.players.delete(sessionId);

    // If host leaves, assign new host
    if (sessionId === this.state.hostId && clients.length > 0) {
      this.state.hostId = clients[0].sessionId;
    }

    console.log(sessionId, "left lobby roomId:", roomId);
  }
}
