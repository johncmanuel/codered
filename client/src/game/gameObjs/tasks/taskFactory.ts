import { FirewallConfig } from "./firewallConfig";
import { Scene } from "phaser";
import { Tasks } from "@/game/types/room";
import { Task } from "./task";
import { SystemRebootSequence } from "./systemRebootSeq";
import { EncryptionDecryption } from "./encryptionDecryption";
import { PhishingEmail } from "./phishingEmail";
import { VirusContainment } from "./virusContainment";
import { NetworkMapping } from "./networkMapping";
import { SocialEng } from "./socialEng";
import { FillerTask } from "./fillerTask";

// factory function to create tasks based on their type
export function createTask(scene: Scene, taskId: string, taskType: Tasks): Task {
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
    case Tasks.ENCRYPTION_DECRYPTION:
      return new EncryptionDecryption(scene, taskId);
    case Tasks.SOCIAL_ENGINEERING:
      return new SocialEng(scene, taskId);
    default:
      return new FillerTask(scene, taskId);
  }
}

// TODO: work on this later to prevent switch statement from being too long
// Use for creating tasks based on their type
// export const TaskConstructors: Record<Tasks, TaskConstructor> = {
//   [Tasks.FIREWALL_CONFIG]: FirewallConfig,
// };
//
// export type TaskConstructor = new (scene: Scene, taskId: string) => Task;
