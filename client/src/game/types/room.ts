import type { Room } from "colyseus.js";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { toTitleCase } from "@/lib/utils";

// See the doc for all tasks
//https://docs.google.com/document/d/108iqAIOSarstxAkN5XhzX--UqDadNuoiModpusWcysA/edit?tab=t.0
export enum Tasks {
  FIREWALL_CONFIG,
  PHISHING_EMAIL,
  VIRUS_CONTAINMENT,
  NETWORK_MAPPING,
  SYSTEM_REBOOT,
  SOCIAL_ENGINEERING,
  ENCRYPTION_DECRYPTION,
  // New ones not mentioned in the doc
  // These are the filler tasks, tasks that are meant to be done easily and should take like 1-2 clicks at most
  RESTART_PC,
  RESET_PASSWORDS,
  MALWARE_SCAN,
  CREATE_INCIDENT_REPORT,
  UPDATE_SOFTWARE,
  PATCH_SECURITY_SOFTWARE,

  FLUSH_DNS_CACHE,
  TERMINATE_PROCESS,
  CLEAR_EVENT_LOGS,
  REVOKE_API_KEYS,
  CHECK_DISK_SPACE,
  VERIFY_BACKUP_STATUS,
  ANALYZE_TRAFFIC_LOGS,
  CHECK_SYSTEM_INTEGRITY,
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

export const getTaskMessage = (taskType: string): string => {
  const messages: Partial<Record<Tasks, string[]>> = {
    [Tasks.FIREWALL_CONFIG]: ["Configure Firewall Rules"],
    [Tasks.PHISHING_EMAIL]: ["Investigate Phishing Email"],
    [Tasks.VIRUS_CONTAINMENT]: ["Contain Virus Spread"],
    [Tasks.NETWORK_MAPPING]: ["Map Network Devices"],
    [Tasks.SYSTEM_REBOOT]: ["Reboot Critical System"],
    [Tasks.SOCIAL_ENGINEERING]: ["Investigate Social Engineering Issue"],
    [Tasks.ENCRYPTION_DECRYPTION]: ["Run Encryption and Decryption"],
    [Tasks.RESTART_PC]: ["Restart Computer"],
    [Tasks.MALWARE_SCAN]: ["Run Malware Scan"],
    [Tasks.UPDATE_SOFTWARE]: ["Update Outdated Software"],
    [Tasks.TERMINATE_PROCESS]: ["Terminate Suspicious Process"],
    [Tasks.REVOKE_API_KEYS]: ["Disable Compromised API Secrets"],
    [Tasks.VERIFY_BACKUP_STATUS]: ["Verify backup integrity"],
    [Tasks.ANALYZE_TRAFFIC_LOGS]: ["Analyze Network Traffic Logs"],
    [Tasks.FLUSH_DNS_CACHE]: ["Flush DNS Cache"],
  };

  const enumKey = taskType as keyof typeof Tasks;
  const enumValue = Tasks[enumKey];
  const defaultMessage = toTitleCase(taskType.replace(/_/g, " "));

  return messages[enumValue]
    ? messages[enumValue][Math.floor(Math.random() * messages[enumValue].length)]
    : defaultMessage;
};

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

export interface TaskCompletedData {
  taskId: string;
}

export type GameRoom = Room<GameState>;

export interface Player {
  id: string;
  name: string;
}

export enum FillerTasks {
  RESTART_PC = Tasks.RESTART_PC,
  RESET_PASSWORDS = Tasks.RESET_PASSWORDS,
  MALWARE_SCAN = Tasks.MALWARE_SCAN,
  CREATE_INCIDENT_REPORT = Tasks.CREATE_INCIDENT_REPORT,
  UPDATE_SOFTWARE = Tasks.UPDATE_SOFTWARE,
  PATCH_SECURITY_SOFTWARE = Tasks.PATCH_SECURITY_SOFTWARE,
}
