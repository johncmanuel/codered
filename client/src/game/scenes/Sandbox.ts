// only for testing phaser game objects

import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { createTask } from "../gameObjs/tasks/taskFactory";
import { TaskManager } from "../gameObjs/tasks/taskManager";

export const GAME_NAME = "Sandbox";

// use createTask to initialize the task

export class Sandbox extends Scene {
  taskManager: TaskManager;

  constructor() {
    super(GAME_NAME);
  }

  init() {
    this.taskManager = new TaskManager();
  }

  preload() {}

  create() {
    this.add.text(100, 100, "Hello World", {});
    EventBus.emit("current-active-scene");
  }
  update() {
    this.taskManager.update();
  }
}
