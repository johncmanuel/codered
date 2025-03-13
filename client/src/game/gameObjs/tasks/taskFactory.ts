import { FirewallConfig } from "./firewallConfig";
import { Scene } from "phaser";
import { Tasks } from "@/game/types/room";
import { Task } from "./task";
import { SystemRebootSequence } from "./systemRebootSeq";
import { EncryptionDecryption } from "./encryptionDecryption";
import { PhishingEmail } from "./phishingEmail";
import { VirusContainment } from "./virusContainment";
import { NetworkMapping } from "./networkMapping";
import { FillerTask } from "./fillerTask";

// factory function to create tasks based on their type
export function createTask(scene: Scene, taskId: string, taskType: Tasks): Task {
  // all return firewall config for now lol
  // rest of tasks are WIP
  switch (taskType) {
    case Tasks.FIREWALL_CONFIG:
      return new FirewallConfig(scene, taskId);
    case Tasks.PHISHING_EMAIL:
      return new PhishingEmail(scene, taskId);
    case Tasks.VIRUS_CONTAINMENT:
      return new VirusContainment(scene, taskId);
    case Tasks.NETWORK_MAPPING:
      return new NetworkMapping(scene, taskId);
    case Tasks.SYSTEM_REBOOT:
      return new SystemRebootSequence(scene, taskId);
    case Tasks.SOCIAL_ENGINEERING:
      return new FirewallConfig(scene, taskId);
    case Tasks.RESTART_PC:
      return new FillerTask(scene, taskId);
    case Tasks.RESET_PASSWORDS:
      return new FillerTask(scene, taskId);
    case Tasks.MALWARE_SCAN:
      return new FillerTask(scene, taskId);
    case Tasks.CREATE_INCIDENT_REPORT:
      return new FillerTask(scene, taskId);
    case Tasks.UPDATE_SOFTWARE:
      return new FillerTask(scene, taskId);
    case Tasks.PATCH_SECURITY_SOFTWARE:
      return new FillerTask(scene, taskId);
    case Tasks.ENCRYPYTION_DECRYPTION:
      return new EncryptionDecryption(scene, taskId);
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
