import { FirewallConfig } from "./firewallConfig";
import { Scene } from "phaser";
import { Tasks } from "@/game/types/room";
import { Task } from "./task";

// factory function to create tasks based on their type
// TODO: create all task types here
export function createTask(scene: Scene, taskId: string, taskType: Tasks): Task {
  console.log(Tasks);
  switch (taskType) {
    case Tasks.FIREWALL_CONFIG:
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
