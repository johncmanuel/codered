import { Room, Client } from "colyseus";
import { PlayerState } from "./schema/PlayerState";
import { GameState } from "./schema/GameState";

// All the gaming will happen here
export class GameRoom extends Room<GameState> {
  maxClients = 6;

  onCreate(options: any) {}

  onJoin(client: Client, options: any) {
    // Want to use data from options (sent from client app) to create new player state
    const player = new PlayerState();
    player.name = options.name || `Player ${this.clients.length}`;
  }

  onLeave(client: Client) {}

  onDispose() {
    console.log("game room disposing for", this.roomId);
  }
}
