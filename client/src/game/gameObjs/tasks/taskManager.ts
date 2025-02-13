import { Task } from "./task";

export class TaskManager {
  private tasks: Map<string, Task>; // maps task ID to task
  private activeTaskId: string | null; // ID of the currently active task
  private isStarted: boolean;

  constructor() {
    this.tasks = new Map();
    this.activeTaskId = null;
    this.isStarted = false;
  }

  addTask(taskId: string, task: Task) {
    if (this.tasks.has(taskId)) {
      console.error(`Task with ID ${taskId} already exists`);
      return;
    }
    this.tasks.set(taskId, task);
  }

  startTask(taskId: string) {
    if (this.activeTaskId !== null) {
      console.error("Cannot start task - another task is already active");
      return;
    }

    const task = this.tasks.get(taskId);
    if (task) {
      this.activeTaskId = taskId;
      this.isStarted = true;
      task.start();
    } else {
      console.error(`Task with ID ${taskId} not found`);
    }
  }

  stopActiveTask() {
    if (this.activeTaskId !== null) {
      const task = this.tasks.get(this.activeTaskId);
      if (task) {
        task.cleanup();
      }
      this.activeTaskId = null;
      this.isStarted = false;
    }
  }

  removeTask(taskId: string) {
    if (this.activeTaskId === taskId) {
      this.stopActiveTask();
    }
    this.tasks.delete(taskId);
  }

  update() {
    if (this.activeTaskId !== null) {
      const task = this.tasks.get(this.activeTaskId);
      if (task) {
        task.update();
      }
    }
  }

  cleanup() {
    this.stopActiveTask();
    this.tasks.forEach((task) => {
      task.cleanup();
    });
    this.tasks.clear();
  }

  getActiveTask(): Task | null {
    if (this.activeTaskId !== null) {
      return this.tasks.get(this.activeTaskId) || null;
    }
    return null;
  }

  isTaskStarted(): boolean {
    return this.isStarted;
  }

  getAllTasks(): Map<string, Task> {
    return this.tasks;
  }
}
