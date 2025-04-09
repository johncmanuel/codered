// only for testing phaser game objects

import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { createTask } from "../gameObjs/tasks/taskFactory";
import { Tasks } from "../types/room";
import { TaskManager } from "../gameObjs/tasks/taskManager";
import { SpamAds } from "../gameObjs/spamAds";

export const GAME_NAME = "Sandbox";

// use createTask to initialize the task

export class Sandbox extends Scene {
  taskManager: TaskManager;
  spamAds: SpamAds;

  constructor() {
    super(GAME_NAME);
  }

  init() {
    this.taskManager = new TaskManager();
  }

  preload() {}

  create() {
    const testId = "testId";
    const rect1 = this.add.rectangle(500, 500, 100, 100, 0xff0000).setInteractive();
    const rect2 = this.add.rectangle(500, 600, 100, 100, 0x00ff00).setInteractive();
    rect1.on("pointerdown", () => {
      console.log("Rect1 clicked");
    });
    rect2.on("pointerdown", () => {
      console.log("Rect2 clicked");
    });

    this.spamAds = new SpamAds(this);
    this.spamAds.spawnAds();

    this.taskManager.addTask(testId, createTask(this, testId, Tasks.ENCRYPYTION_DECRYPTION));

    console.log("Added task");
    this.taskManager.startTask(testId);
    EventBus.emit("current-active-scene");
  }
  update() {
    this.taskManager.update();
  }
}
