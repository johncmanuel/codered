import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { type GameStore } from "../stores/gameStore";
import { type TaskState, type Tasks } from "../types/room";

// Order of execution in scene: init, preload, create, update
// update runs continuously
export class CodeRed extends Scene {
  // btw this is temporary, we wouldn't need to track this much data
  gameStore: GameStore;

  playerId: string;
  currentTasks: Map<string, TaskState>; // Map<taskId, TaskState>

  constructor() {
    super("Game");
  }

  init() {
    console.log("Initializing");
    this.currentTasks = new Map();
    this.createEventBusListeners();
  }

  // Load all assets here first and other stuff
  preload() {
    console.log("Preloading");
  }

  create() {
    console.log("Creating");
    EventBus.emit("current-scene-ready", this);
  }

  update() {}

  // Set up listeners for events from Svelte
  createEventBusListeners() {
    EventBus.on("test", (gameStore: GameStore) => {
      console.log("From Svelte", gameStore);
      this.gameStore = gameStore;
      if (!this.gameStore) {
        throw new Error("No game store");
      }
      if (!this.gameStore.room) {
        throw new Error("No room");
      }
      this.playerId = this.gameStore.room?.sessionId!;
      if (!this.playerId) {
        throw new Error("No player ID");
      }
      this.createServerListeners();
    });
  }

  // Set up listeners for events from Colyseus server
  //https://docs.colyseus.io/state/schema-callbacks/#schema-callbacks
  createServerListeners() {
    this.gameStore.room?.state.listen("timer", (timer: number) => {
      console.log("Timer updated", timer);
      EventBus.emit("updateTimer", timer);
    });

    this.gameStore.room?.state.listen("dataHealth", (dataHealth: number) => {
      console.log("Data health updated", dataHealth);
      EventBus.emit("updateHealth", dataHealth);
    });

    this.gameStore.room?.state.listen("round", (round: number) => {
      console.log("Round updated", round);
      EventBus.emit("updateRound", round);
    });

    // https://docs.colyseus.io/state/schema-callbacks/#on-collections-of-items

    // Add only tasks assigned to the player
    this.gameStore.room?.state.activeTasks.onAdd((task: TaskState, key: string) => {
      if (this.playerId !== task.assignedTo) {
        return;
      }
      console.log("New task created for you", task);

      // task.type will be used by Phaser to display whatever task to the player
      console.log("Task type", task.type);

      // Add it to the current tasks
      // NOTE: the player's current tasks map the task id to the actual task
      this.currentTasks.set(task.id, task);
      EventBus.emit("newTask", task);

      // NOTE: Detect changes made in the task's properties if needed
      // task.listen("completed", (completed: boolean) => {});
    });

    // Remove only tasks assigned to the player
    this.gameStore.room?.state.activeTasks.onRemove((task: TaskState, key: string) => {
      if (this.playerId !== task.assignedTo) {
        return;
      }
      console.log("Task completed", task);
      // Remove it from the current tasks
      this.currentTasks.delete(task.id);
      EventBus.emit("taskCompleted", task); // maybe instead of task completed, it should be task failed?
    });

    this.gameStore.room?.onMessage("gameOver", () => {
      // Switch to game over scene or something
      console.log("Game over");
    });
  }
}
