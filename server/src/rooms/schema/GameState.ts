import { Schema, type, MapSchema } from "@colyseus/schema";
import { PlayerState } from "./PlayerState";

// See the doc for all tasks
//https://docs.google.com/document/d/108iqAIOSarstxAkN5XhzX--UqDadNuoiModpusWcysA/edit?tab=t.0
export enum Tasks {
  FIREWALL_CONFIG,
  PHISHING_EMAIL,
  VIRUS_CONTAINMENT,
  NETWORK_MAPPING,
}

export class TaskState extends Schema {
  @type("number") taskType: Tasks;
  @type("string") assignedPlayerId: string;
  @type("boolean") isComplete: boolean = false;
}

export class GameState extends Schema {
  @type("number") score: number = 0;
  @type("number") dataHealth: number = 100;
  @type("boolean") isGameOver: boolean = false;
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}
