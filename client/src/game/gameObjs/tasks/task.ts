import { Scene } from "phaser";

export abstract class Task {
  taskId: string;
  // isCompleted: task succesfully finished, isFailed: task failed
  isCompleted: boolean;
  isFailed: boolean;
  scene: Scene;

  constructor(scene: Scene, taskId: string) {
    this.scene = scene;
    this.taskId = taskId;
    this.isCompleted = false;
    this.isFailed = false;
  }

  // should be called once when the task is started
  // used to initialize task stuff (i.e game objects, variables, etc)
  abstract start(): void;

  // runs continuously until the task is completed or failed
  // used to implement the actual minigame logic
  abstract update(): void;

  // called when the task is successfully completed
  complete(): void {
    if (this.isCompleted || this.isFailed) return;

    this.isCompleted = true;
    console.log(`Task ${this.taskId} completed!`);
    this.scene.events.emit("taskCompleted", this.taskId);
    this.cleanup();
  }

  // fail the task
  fail(): void {
    if (this.isCompleted || this.isFailed) return;

    this.isFailed = true;
    console.log(`Task ${this.taskId} failed!`);
    this.scene.events.emit("taskCompleted", this.taskId);
    this.cleanup();
  }

  // clean up after task game is over
  cleanup(): void {
    console.log(`Cleaning up task ${this.taskId}`);
  }
}
