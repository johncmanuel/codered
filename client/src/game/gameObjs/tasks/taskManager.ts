import { Task } from "./task";

export class TaskManager {
  private activeTasks: Task[] = [];

  addTask(task: Task) {
    this.activeTasks.push(task);
    task.start(); // Start the task
  }

  removeTask(taskId: string) {
    const taskIndex = this.activeTasks.findIndex((task) => task.taskId === taskId);
    if (taskIndex !== -1) {
      const task = this.activeTasks[taskIndex];
      task.cleanup();
      this.activeTasks.splice(taskIndex, 1);
    }
  }

  update() {
    for (const task of this.activeTasks) {
      task.update();
    }
  }

  cleanupAllTasks() {
    for (const task of this.activeTasks) {
      task.cleanup();
    }
    this.activeTasks = [];
  }
}
