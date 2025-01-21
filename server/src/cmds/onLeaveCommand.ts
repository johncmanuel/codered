import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { Client } from "colyseus";

export class OnLeaveCommand extends Command<CodeRedRoom, { client: Client; options: any }> {
  execute({ client, options } = this.payload) {
    const sessionId = client.sessionId;
    const clients = this.room.clients;

    this.state.players.delete(client.sessionId);

    // If host leaves, assign new host
    if (sessionId === this.state.hostId && clients.length > 0) {
      this.state.hostId = clients[0].sessionId;
    }

    console.log(sessionId, "left lobby roomId:", this.room.roomId);
  }
}
