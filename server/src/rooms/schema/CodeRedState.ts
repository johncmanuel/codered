import { SetSchema, Schema, MapSchema, type } from "@colyseus/schema";

// See the doc for all tasks
//https://docs.google.com/document/d/108iqAIOSarstxAkN5XhzX--UqDadNuoiModpusWcysA/edit?tab=t.0
export enum Tasks {
  FIREWALL_CONFIG,
  PHISHING_EMAIL,
  VIRUS_CONTAINMENT,
  NETWORK_MAPPING,
}

export class PlayerState extends Schema {
  @type("string") name: string;
}

// Limit for number of fields: 64
// https://docs.colyseus.io/state/schema/#limitations-and-best-practices
// Add @type for fields that should be synchronized between the clients
export class GameState extends Schema {
  @type("number") timer: number = 0;
  @type("number") dataHealth: number = 100;
  @type("number") round: number = 0;
  @type("number") tasksDone: number = 0;
  @type("boolean") isGameOver: boolean = false;
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type("string") hostId: string;
  @type({ set: PlayerState }) playersDoingTasks = new SetSchema<PlayerState>();

  // I don't think room code is needed to be synchronized but we'll do it for now
  @type("string") roomCode: string;
}