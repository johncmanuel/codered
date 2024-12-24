import { Room, Client } from "@colyseus/core";
import { LobbyState } from "./schema/RoomState";
import { PlayerState } from "./schema/PlayerState";

export class MyRoom extends Room<LobbyState> {
  // Allow up to 6 players per room
  maxClients = 6;

  onCreate(options: any) {
    this.setState(new LobbyState());
    this.state.roomCode = this.generateRoomCode();
  }

  onJoin(client: Client, options: any) {
    const player = new PlayerState();
    player.name = options.name || `Player ${this.clients.length}`;
    this.state.players.set(client.sessionId, player);

    // Set host to be the first player
    if (this.clients.length === 1) this.state.hostId = client.sessionId;

    console.log(client.sessionId, "joined roomId:", this.roomId);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);

    // If host leaves, assign new host
    if (client.sessionId === this.state.hostId && this.clients.length > 0) {
      this.state.hostId = this.clients[0].sessionId;
    }

    console.log(client.sessionId, "left roomId:", this.roomId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  // Generates a random, unique 6-character room code
  generateRoomCode(): string {
    const numChars = 6;
    return Math.random().toString(36).substring(2, numChars).toUpperCase();
  }
}
