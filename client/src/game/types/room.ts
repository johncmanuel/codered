import type { Room } from "colyseus.js";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string") name: string;
}
export class LobbyState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type("string") roomCode: string;
  @type("string") hostId: string;
}

export type LobbyRoom = Room<LobbyState>;

export interface Player {
  id: string;
  name: string;
}

export interface GameState {
  health: number;
  round: number;
  tasksDone: number;
  timer: number;
}
