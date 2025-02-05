import { Task } from "./task";

export class TaskManager {
  private activeTask: Task | null;

  constructor() {
    this.activeTask = null;
  }

  addTask(task: Task) {
    if (this.activeTask) {
      this.activeTask.cleanup();
    }
    this.activeTask = task;
    task.start();
  }

  removeTask(taskId: string) {
    if (this.activeTask && this.activeTask.taskId === taskId) {
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

  hasActiveTask() {
    return this.activeTask !== null;
  }

  getActiveTask(): Task | null {
    return this.activeTask;
  }
}
