import { Scene, Display } from "phaser";

export abstract class Task {
  taskId: string;
  isCompleted: boolean;
  isFailed: boolean;
  scene: Scene;

  // stop game objects from outside the task from being interacted with while task is running
  // idea from: https://phaser.discourse.group/t/phaser-buttons-still-clickable-under-other-objects/8606
  blockingOverlay: Phaser.GameObjects.Rectangle | null;
  topBar: Phaser.GameObjects.Rectangle | null;
  greenDot: Phaser.GameObjects.Arc | null;
  yellowDot: Phaser.GameObjects.Arc | null;
  redDot: Phaser.GameObjects.Arc | null;

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
      this.scene.cameras.main.width - 10,
      this.scene.cameras.main.height - 10,
      color,
      alpha,
    );

    const barHeight = 50;
    this.topBar = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      1,
      this.scene.cameras.main.width - 10,
      barHeight - 20,
      0xffffff,
      1,
    );
    this.blockingOverlay.setInteractive();

    const dotRadius = 6;
    const dotSpacing = 6;
    const startX = 30;
    const dotY = 8;

    this.redDot = this.scene.add.circle(startX - 10, dotY, dotRadius, 0xff5f57, 1);

    this.yellowDot = this.scene.add.circle(
      startX + dotRadius * 2 + dotSpacing - 10,
      dotY,
      dotRadius,
      0xfebc2e,
      1,
    );

    this.greenDot = this.scene.add.circle(
      startX + (dotRadius * 2 + dotSpacing) * 2 - 10,
      dotY,
      dotRadius,
      0x28c840,
      1,
    );

    this.redDot.setStrokeStyle(1, 0xc14645);
    this.yellowDot.setStrokeStyle(1, 0xd6a243);
    this.greenDot.setStrokeStyle(1, 0x1aab29);
    // ensure it's above other game objects but below game objects in tasks
    // this.blockingOverlay.depth = 9998;
    // this.scene.children.sendToBack(this.blockingOverlay);
  }

  protected destroyBlockingOverlay(): void {
    if (this.blockingOverlay) {
      this.blockingOverlay.destroy();
      this.blockingOverlay = null;
    }

    if (this.topBar) {
      this.topBar.destroy();
      this.topBar = null;
    }

    if (this.redDot) {
      this.redDot.destroy();
      this.redDot = null;
    }

    if (this.yellowDot) {
      this.yellowDot.destroy();
      this.yellowDot = null;
    }

    if (this.greenDot) {
      this.greenDot.destroy();
      this.greenDot = null;
    }
  }
}
