import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { PlayerState } from "../CodeRedState";
import { type Client } from "colyseus";

export class OnJoinCommand extends Command<CodeRedRoom, { client: Client; options: any }> {
  execute({ client, options } = this.payload) {
    const player = new PlayerState();
    const sessionId = client.sessionId;
    const lenClients = this.room.clients.length;

    player.name = options.name || `Player ${lenClients}`;
    this.state.players.set(sessionId, player);

    // Set host to be the first player
    if (lenClients === 1) this.state.hostId = sessionId;

    console.log(sessionId, "joined lobby roomId:", this.room.roomId);
  }
}
