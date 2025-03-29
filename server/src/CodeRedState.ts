import { ArraySchema, Schema, MapSchema, type } from "@colyseus/schema";

// See the doc for all tasks
//https://docs.google.com/document/d/108iqAIOSarstxAkN5XhzX--UqDadNuoiModpusWcysA/edit?tab=t.0
export enum Tasks {
  FIREWALL_CONFIG,
  PHISHING_EMAIL,
  VIRUS_CONTAINMENT,
  NETWORK_MAPPING,
  SYSTEM_REBOOT,
  SOCIAL_ENGINEERING,
  ENCRYPYTION_DECRYPTION,
  // New ones not mentioned in the doc
  // These are the filler tasks, tasks that are meant to be done easily and should take like 1-2 clicks at most
  RESTART_PC,
  RESET_PASSWORDS,
  MALWARE_SCAN,
  CREATE_INCIDENT_REPORT,
  UPDATE_SOFTWARE,
  PATCH_SECURITY_SOFTWARE,
}

export class TaskState extends Schema {
  @type("string") id: string;
  @type("string") type: string;
  @type("boolean") completed: boolean = false;
  // @type("number") timeLimit: number;
  @type("string") control: string;
}

// Example entry: [Tasks.FIREWALL_CONFIG, "FIREWALL_CONFIG_CONTROL"]
export const TaskToControls = new Map<Tasks, string>(
  Object.values(Tasks)
    .filter((task) => typeof task === "number")
    .map((task) => [task, `${Tasks[task]}_CONTROL`]),
);

export class PlayerState extends Schema {
  @type("string") name: string;
  @type(["string"]) controls = new ArraySchema<string>();
  @type("string") activeTaskId: string | null = null;
}

// Limit for number of fields: 64
// https://docs.colyseus.io/state/schema/#limitations-and-best-practices
// Add @type for fields that should be synchronized between the clients
export class GameState extends Schema {
  @type("number") timer: number = initRoundTimeLimitSecs;
  @type("number") dataHealth: number = 100;
  @type("number") round: number = 1;
  @type("number") tasksDone: number = 0;

  // statistics to track for at the end of the game
  @type("number") totalTasksDone: number = 0;
  @type("number") totalTimeSecs: number = 0;
  @type("number") totalTasksFailed: number = 0;
  @type("number") totalAdsClicked: number = 0;

  @type("boolean") isGameOver: boolean = false;
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>(); // sessionId -> PlayerState
  @type("string") hostId: string;
  @type({ map: TaskState }) activeTasks = new MapSchema<TaskState>();
}

export const initRoundTimeLimitSecs = 120;
