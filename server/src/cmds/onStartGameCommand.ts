import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { type Client } from "colyseus";

export class OnStartGameCommand extends Command<CodeRedRoom, { client: Client }> {
  execute({ client } = this.payload) {
    if (client.sessionId !== this.state.hostId) {
      console.error(
        "Only the host can start the game",
        "client.sessionId",
        client.sessionId,
        "hostId",
        this.state.hostId,
      );
      return;
    }

    if (this.room.clients.length < 3) {
      console.error("Cannot start game with less than 3 players");
      return;
    }

    console.log("Starting game for lobby roomid", this.room.roomId);
  }
}
