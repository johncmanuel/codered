import { Task } from "./task";

export class TaskManager {
  private activeTask: Task | null;
  private isStarted: boolean;

  constructor() {
    this.activeTask = null;
    this.isStarted = false;
  }

  addTask(task: Task) {
    if (this.activeTask) {
      console.error("Cannot add task - another task is already active");
      return;
    }
    this.activeTask = task;
  }

  startTask() {
    if (this.activeTask) {
      this.isStarted = true;
      this.activeTask.start();
    }
  }

  removeTask() {
    if (this.activeTask) {
      this.activeTask.cleanup();
      this.activeTask = null;
    }
  }

  update() {
    if (this.activeTask) {
      this.activeTask.update();
    }
  }

  cleanup() {
    if (this.activeTask) {
      this.activeTask.cleanup();
      this.activeTask = null;
    }
  }

  getActiveTask(): Task | null {
    return this.activeTask;
  }

  isTaskStarted() {
    return this.isStarted;
  }
}
