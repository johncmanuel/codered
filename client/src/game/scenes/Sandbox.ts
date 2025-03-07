// only for testing phaser game objects

import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { createTask } from "../gameObjs/tasks/taskFactory";
import { Tasks } from "../types/room";
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
    const testId = "testId";
    this.taskManager.addTask(testId, createTask(this, testId, Tasks.PHISHING_EMAIL));
    console.log("Added task");
    this.taskManager.startTask(testId);
    EventBus.emit("current-active-scene");
  }
  update() {
    this.taskManager.update();
  }
}
