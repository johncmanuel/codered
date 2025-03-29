import { Task } from "./task";
import { Scene } from "phaser";

export class FillerTask extends Task {
  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
  }
  start() {
    console.log("Starting filler task");

    // filler tasks are too ez, so complete it immedately
    this.complete();
  }
  update() {}
  cleanup() {
    super.cleanup();
  }
}
