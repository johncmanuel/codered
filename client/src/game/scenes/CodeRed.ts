import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { type GameStore } from "../stores/gameStore";
import { type TaskState } from "../types/room";

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
  controlBtns: Phaser.GameObjects.Text[] = [];

  constructor() {
    super("Game");
  }

  init() {
    this.currentTasks = new Map();
    this.playerControls = new Set();
    EventBus.on("test", (gameStore: GameStore) => {
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
  createEventBusListeners() {}

  // Set up listeners for events from Colyseus server
  //https://docs.colyseus.io/state/schema-callbacks/#schema-callbacks
  createServerListeners() {
    this.getPlayerControls();
    this.renderControlButtons();

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

    this.gameStore.room?.onMessage("gameOver", () => {
      if (this.gameOverText) {
        this.gameOverText.setVisible(true);
      }
      if (this.postMatchButton) {
        this.postMatchButton.setVisible(true);
      }
    });
  }

  getPlayerControls() {
    this.gameStore.room?.state.players.forEach((player, key) => {
      if (key === this.playerId) {
        player.controls.forEach((control) => {
          this.playerControls.add(control);
        });
        console.log("player contorls", this.playerControls);
        return;
      }
    });
  }

  renderControlButtons() {
    const buttonWidth = 150;
    const buttonHeight = 50;
    const padding = 20;
    // Center buttons horizontally
    const startX =
      (this.cameras.main.width - this.playerControls.size * (buttonWidth + padding)) / 2;
    // Position buttons at the bottom of the screen
    const startY = this.cameras.main.height - buttonHeight - 20;

    let index = 0;
    this.playerControls.forEach((control) => {
      const button = this.add
        .text(startX + index * (buttonWidth + padding), startY, control, {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#ffffff",
          backgroundColor: "#0000ff",
          padding: { x: 10, y: 10 },
        })
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true });

      button.on("pointerdown", () => {
        this.handleControlButtonClick(control);
      });
      button.setVisible(true);

      this.controlBtns.push(button);
      index++;
    });
  }

  // Method to handle control button clicks
  handleControlButtonClick(control: string) {
    console.log(`Control button clicked: ${control}`);
    // Add logic to handle the button click (e.g., start a task minigame)
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
