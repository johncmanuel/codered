import { FirewallConfig } from "./firewallConfig";
import { Scene } from "phaser";
import { Tasks } from "@/game/types/room";
import { Task } from "./task";

// factory function to create tasks based on their type
export function createTask(scene: Scene, taskId: string, taskType: Tasks): Task {
  // all return firewall config for now lol
  // rest of tasks are WIP
  switch (taskType) {
    case Tasks.FIREWALL_CONFIG:
      return new FirewallConfig(scene, taskId);
    case Tasks.PHISHING_EMAIL:
      return new FirewallConfig(scene, taskId);
    case Tasks.VIRUS_CONTAINMENT:
      return new FirewallConfig(scene, taskId);
    case Tasks.NETWORK_MAPPING:
      return new FirewallConfig(scene, taskId);
    case Tasks.SYSTEM_REBOOT:
      return new FirewallConfig(scene, taskId);
    case Tasks.SOCIAL_ENGINEERING:
      return new FirewallConfig(scene, taskId);
    case Tasks.RESTART_PC:
      return new FirewallConfig(scene, taskId);
    case Tasks.RESET_PASSWORDS:
      return new FirewallConfig(scene, taskId);
    case Tasks.MALWARE_SCAN:
      return new FirewallConfig(scene, taskId);
    case Tasks.CREATE_INCIDENT_REPORT:
      return new FirewallConfig(scene, taskId);
    case Tasks.UPDATE_SOFTWARE:
      return new FirewallConfig(scene, taskId);
    case Tasks.PATCH_SECURITY_SOFTWARE:
      return new FirewallConfig(scene, taskId);
    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
}

// TODO: work on this later to prevent switch statement from being too long
// Use for creating tasks based on their type
// export const TaskConstructors: Record<Tasks, TaskConstructor> = {
//   [Tasks.FIREWALL_CONFIG]: FirewallConfig,
// };
//
// export type TaskConstructor = new (scene: Scene, taskId: string) => Task;
