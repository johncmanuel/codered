import { Scene } from "phaser";
import { type GameRoom } from "@/game/types/room";

export abstract class Task {
  protected taskId: string;
  // isCompleted: task succesfully finished, isFailed: task failed
  protected isCompleted: boolean;
  protected isFailed: boolean;
  protected scene: Scene;
  protected room: GameRoom;

  constructor(scene: Scene, room: GameRoom, taskId: string) {
    this.scene = scene;
    this.room = room;
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
  complete() {
    if (this.isCompleted || this.isFailed) return;

    this.isCompleted = true;
    console.log(`Task ${this.taskId} completed!`);
    this.room?.send("taskCompleted", this.taskId);
  }

  // fail the task
  fail() {
    if (this.isCompleted || this.isFailed) return;

    this.isFailed = true;
    console.log(`Task ${this.taskId} failed!`);
    this.room?.send("taskFailed", this.taskId);
  }

  // clean up after task game is over
  protected cleanup(onAdditionalCleanup?: (taskId: string) => void) {
    console.log(`Cleaning up task ${this.taskId}`);
    if (onAdditionalCleanup) onAdditionalCleanup(this.taskId);
  }
}
