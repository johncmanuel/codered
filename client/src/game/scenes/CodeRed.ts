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
  playerControls: Set<string>;

  // setup game objects here
  gameOverText: Phaser.GameObjects.Text;
  postMatchButton: Phaser.GameObjects.Text;
  postMatchPanel: Phaser.GameObjects.Container;

  constructor() {
    super("Game");
  }

  init() {
    this.currentTasks = new Map();
    this.createEventBusListeners();
  }

  // Load all assets here first and other stuff
  preload() {}

  // load the game objects stuff here
  create() {
    this.gameOverText = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 2, "Game Over", {
        fontFamily: "Arial",
        fontSize: "64px",
        color: "#ff0000",
        align: "center",
      })
      .setOrigin(0.5, 0.5);

    this.postMatchButton = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 50, // position below the "Game Over" text
        "View Post-Match Statistics",
        {
          fontFamily: "Arial",
          fontSize: "32px",
          color: "#ffffff",
          backgroundColor: "#0000ff",
          padding: { x: 20, y: 10 },
        },
      )
      .setOrigin(0.5, 0.5);

    this.postMatchButton.setInteractive({ useHandCursor: true });
    this.postMatchButton.on("pointerdown", () => {
      this.showPostMatchStatistics();
    });

    // only show once game is over
    this.postMatchPanel = this.add.container(0, 0).setVisible(false);
    this.postMatchButton.setVisible(false);
    this.gameOverText.setVisible(false);

    // keep this at the end
    EventBus.emit("current-scene-ready", this);
  }

  update() {}

  // Set up listeners for events from Svelte
  createEventBusListeners() {
    EventBus.on("test", (gameStore: GameStore) => {
      // console.log("From Svelte", gameStore);
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

    this.gameStore.room?.state.activeTasks.onAdd((task: TaskState, key: string) => {
      if (task.control === "") {
        console.error("No control found for task type", task.type);
        return;
      }

      // task.type will be used by Phaser to display whatever task to the player
      console.log("Task type for you", task.type);

      // Add it to the current tasks
      // NOTE: the player's current tasks map the task id to the actual task
      this.currentTasks.set(task.id, task);
      EventBus.emit("newTask", task);

      // NOTE: Detect changes made in the task's properties if needed
      // task.listen("completed", (completed: boolean) => {});
    });

    this.gameStore.room?.state.activeTasks.onRemove((task: TaskState, key: string) => {
      if (!this.currentTasks.has(task.id)) {
        console.error("Task not found in current tasks", task);
        return;
      }
      console.log("Task completed", task.type);

      // Remove it from the current tasks
      this.currentTasks.delete(task.id);

      EventBus.emit("taskCompleted", task); // maybe instead of task completed, it should be task failed?
    });

    this.gameStore.room?.state.players.onChange((player, playerId) => {
      if (playerId === this.playerId) {
        console.log("Controls updated", player.controls);
        player.controls.forEach((control) => {
          this.playerControls.add(control);
        });
        EventBus.emit("updateControls", this.playerControls);
      }
    });

    this.gameStore.room?.onMessage("gameOver", () => {
      if (this.gameOverText) {
        this.gameOverText.setVisible(true);
      }
      if (this.postMatchButton) {
        this.postMatchButton.setVisible(true);
      }
    });
  }

  showPostMatchStatistics() {
    if (!this.postMatchPanel) return;

    if (this.gameOverText) this.gameOverText.setVisible(false);
    if (this.postMatchButton) this.postMatchButton.setVisible(false);

    this.postMatchPanel.removeAll(true);

    const background = this.add
      .rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 400, 200, 0x000000, 0.8)
      .setOrigin(0.5, 0.5);

    const title = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 60,
        "Post-Match Statistics",
        {
          fontFamily: "Arial",
          fontSize: "32px",
          color: "#ffffff",
        },
      )
      .setOrigin(0.5, 0.5);

    const healthText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        `Data Health: ${this.gameStore.room?.state.dataHealth}`,
        {
          fontFamily: "Arial",
          fontSize: "24px",
          color: "#ffffff",
        },
      )
      .setOrigin(0.5, 0.5);

    const closeButton = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 60, "Close", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#ff0000",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5, 0.5);

    closeButton.setInteractive({ useHandCursor: true });
    closeButton.on("pointerdown", () => {
      this.postMatchPanel?.setVisible(false);
      if (this.gameOverText) this.gameOverText.setVisible(true);
      if (this.postMatchButton) this.postMatchButton.setVisible(true);
    });

    this.postMatchPanel.add([background, title, healthText, closeButton]);
    this.postMatchPanel.setVisible(true);
  }
}
