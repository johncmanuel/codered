import type { Room } from "colyseus.js";
import { SetSchema, Schema, type, MapSchema } from "@colyseus/schema";

// export class PlayerState extends Schema {
//   @type("string") name: string;
// }
// export class LobbyState extends Schema {
//   @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
//   @type("string") roomCode: string;
//   @type("string") hostId: string;
// }

export enum Tasks {
  FIREWALL_CONFIG,
  PHISHING_EMAIL,
  VIRUS_CONTAINMENT,
  NETWORK_MAPPING,
}

export class TaskState extends Schema {
  @type("string") id: string;
  @type("string") type: string; // Probably don't have to assign this type as Tasks, can do it in the game logic
  @type("string") assignedTo: string;
  @type("boolean") completed: boolean = false;
  @type("number") timeCreated: number;
  @type("number") timeLimit: number;
}

export class PlayerState extends Schema {
  @type("string") name: string;
}

// Limit for number of fields: 64
// https://docs.colyseus.io/state/schema/#limitations-and-best-practices
// Add @type for fields that should be synchronized between the clients
export class GameState extends Schema {
  @type("number") timer: number = initRoundTimeLimitSecs;
  @type("number") dataHealth: number = 100;
  @type("number") round: number = 1;
  @type("number") tasksDone: number = 0;
  @type("boolean") isGameOver: boolean = false;
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type("string") hostId: string;
  @type({ map: TaskState }) activeTasks = new MapSchema<TaskState>();

  // I don't think room code is needed to be synchronized but we'll do it for now
  @type("string") roomCode: string;
}

export const initRoundTimeLimitSecs = 30;

export type GameRoom = Room<GameState>;

export interface Player {
  id: string;
  name: string;
}
