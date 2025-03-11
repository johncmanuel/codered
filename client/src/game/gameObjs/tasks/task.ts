import { Scene, Display } from "phaser";

export abstract class Task {
  taskId: string;
  isCompleted: boolean;
  isFailed: boolean;
  scene: Scene;

  // stop game objects from outside the task from being interacted with while task is running
  blockingOverlay: Phaser.GameObjects.Rectangle | null;

  constructor(scene: Scene, taskId: string) {
    this.scene = scene;
    this.taskId = taskId;
    this.isCompleted = false;
    this.isFailed = false;

    this.createBlockingOverlay();
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
    this.scene.events.emit("taskFailed", this.taskId);
    this.cleanup();
  }

  // clean up after task game is over
  cleanup(): void {
    console.log(`Cleaning up task ${this.taskId}`);
    this.destroyBlockingOverlay();
  }

  protected createBlockingOverlay(): void {
    const alpha = 1;
    const color = new Display.Color(0, 0, 200, 1).color;
    this.blockingOverlay = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width - 20,
      this.scene.cameras.main.height - 20,
      color,
      alpha,
    );
    this.blockingOverlay.setInteractive();

    // ensure it's above other game objects but below game objects in tasks
    // this.blockingOverlay.depth = 9998;
    // this.scene.children.sendToBack(this.blockingOverlay);
  }

  protected destroyBlockingOverlay(): void {
    if (this.blockingOverlay) {
      this.blockingOverlay.destroy();
      this.blockingOverlay = null;
    }
  }
}
