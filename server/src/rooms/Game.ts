import { Room, Client, Delayed } from "@colyseus/core";
import { PlayerState, GameState } from "./schema/CodeRedState";

export class CodeRedRoom extends Room<GameState> {
  // Allow up to 6 players per room
  maxClients = 6;

  timerInterval!: Delayed;

  TIMER_INTERVAL_MS = 1000;
  TIMEOUT_INTERVAL_MS = 5000;

  onCreate(options: any) {
    this.setState(new GameState());
    this.state.roomCode = this.generateRoomCode();

    // Create all our event handlers down below
    // This is where most of our multiplayer logic will be

    // Handle starting the game
    this.onMessage("startGame", (client) => {
      if (client.sessionId !== this.state.hostId) {
        return;
      }

      if (this.clients.length < 3) {
        console.log("Cannot start game with less than 3 players");
        return;
      }

      console.log("Starting game for lobby roomid", this.roomId);

      // Broadcast start game to all clients
      this.broadcast("startGame");

      // Start timer immediately, but ideally should do so once everyone is properly connected
      this.startTimer();
    });
  }

  onJoin(client: Client, options: any) {
    const player = new PlayerState();
    player.name = options.name || `Player ${this.clients.length}`;
    this.state.players.set(client.sessionId, player);

    // Set host to be the first player
    if (this.clients.length === 1) this.state.hostId = client.sessionId;

    console.log(client.sessionId, "joined lobby roomId:", this.roomId);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);

    // If host leaves, assign new host
    if (client.sessionId === this.state.hostId && this.clients.length > 0) {
      this.state.hostId = this.clients[0].sessionId;
    }

    console.log(client.sessionId, "left lobby lobby roomId:", this.roomId);
  }

  onDispose() {
    console.log("lobby", this.roomId, "disposing...");
  }

  startTimer() {
    this.state.timer = 0;
    this.clock.start();
    console.log("Timer started!");

    this.timerInterval = this.clock.setInterval(() => {
      this.state.timer++;
      console.log("Timer:", this.state.timer);
      // this.broadcast("updateTimer", this.state.timer);
    }, this.TIMER_INTERVAL_MS);

    // clear timer once time limit is reached
    // putting 5 seconds for now
    // this.clock.setTimeout(() => {
    //   this.state.timer = 0;
    //   this.clock.stop();
    //   console.log("Game over!");
    //   this.timerInterval.clear();
    // }, this.TIMEOUT_INTERVAL_MS);
  }

  // Generates a random, unique 6-character room code
  generateRoomCode(): string {
    const numChars = 6;
    return Math.random().toString(36).substring(2, numChars).toUpperCase();
  }
}
