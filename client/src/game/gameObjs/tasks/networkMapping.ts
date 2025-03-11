import { Task } from "./task";
import { Scene } from "phaser";

export class NetworkMapping extends Task {
  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
  }
  start(): void {}
  update() {}
  cleanup(): void {
    super.cleanup();
  }
}
