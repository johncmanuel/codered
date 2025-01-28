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
  // Client side data structure for holding all of a player's active tasks
  controlToTaskId: Map<string, string> = new Map(); // Map<control, taskId>
  playerControls: Set<string> = new Set();
  currentAssignedTask: string | null = null;

  // setup game objects here
  gameOverText: Phaser.GameObjects.Text;
  postMatchButton: Phaser.GameObjects.Text;
  postMatchPanel: Phaser.GameObjects.Container;
  controlBtns: Phaser.GameObjects.Text[] = [];
  activeTaskNotifications: Map<string, Phaser.GameObjects.Text> = new Map();
  loadingText: Phaser.GameObjects.Text;

  constructor() {
    super("Game");
  }

  init() {
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
      this.gameStore.room?.send("playerReady");
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

    this.loadingText = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 2, "Assigning Controls...", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#ffffff",
      })
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

  // Set up listeners for events from Colyseus server
  //https://docs.colyseus.io/state/schema-callbacks/#schema-callbacks
  createServerListeners() {
    this.gameStore.room?.state.listen("timer", (timer: number) => {
      EventBus.emit("updateTimer", timer);
    });

    this.gameStore.room?.state.listen("dataHealth", (dataHealth: number) => {
      EventBus.emit("updateHealth", dataHealth);
    });

    this.gameStore.room?.state.listen("round", (round: number) => {
      EventBus.emit("updateRound", round);
      this.loadingText.setVisible(true);
    });

    // Mainly used for notifying the players, this enables the player to verbally cooperate with others
    this.gameStore.room?.onMessage("newTask", (task: TaskState) => {
      this.currentAssignedTask = task.id;
      this.showTaskNotificationText(this.currentAssignedTask, `New Task: ${task.type}`);
    });

    this.gameStore.room?.onMessage("controls", (controls) => {
      controls.forEach((control: any) => {
        this.playerControls.add(control);
      });
      this.loadingText.setVisible(false);
      this.renderControlButtons();
    });

    // do stuff once all players connected
    this.gameStore.room?.onMessage("allPlayersReady", () => {});

    // https://docs.colyseus.io/state/schema-callbacks/#on-collections-of-items

    // Add tasks only for the player with the appropiate controls
    // They won't know if they have the task or not, so other players will have to verbally tell them if they're
    // sent one. It's just like Space Team!
    this.gameStore.room?.state.activeTasks.onAdd((task: TaskState, key: string) => {
      if (
        task.control === "" ||
        !task.control ||
        !this.playerControls.has(task.control) ||
        this.controlToTaskId.has(task.control)
      ) {
        return;
      }

      if (this.playerControls.has(task.control)) {
        this.controlToTaskId.set(task.control, task.id);
        console.log("Task assigned to you:", task.type);
      }

      // task.type will be used by Phaser to display whatever task to the player
      // console.log("Task type for you", task.type);
    });

    // Remove tasks that players have controls for
    this.gameStore.room?.state.activeTasks.onRemove((task: TaskState, key: string) => {
      if (this.controlToTaskId.get(task.control) === task.id) {
        this.controlToTaskId.delete(task.control);
        console.log("Task removed from you:", task.type);
      }
      // EventBus.emit("taskCompleted", task); // maybe instead of task completed, it should be task failed?
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

  renderControlButtons() {
    console.log("Rendering control buttons");
    const buttonWidth = 150;
    const buttonHeight = 50;
    const padding = 20;
    const columns = 2;

    // get the number of rows needed based on the number of controls and columns
    const numControls = this.playerControls.size;
    const rows = Math.ceil(numControls / columns);

    // center buttons horizontally
    const startX = (this.cameras.main.width - columns * (buttonWidth + padding)) / 2;
    // position buttons at the bottom of the screen
    const startY = this.cameras.main.height - rows * (buttonHeight + padding) - 20;

    let index = 0;
    this.playerControls.forEach((control) => {
      const row = Math.floor(index / columns);
      const col = index % columns;

      const button = this.add
        .text(
          startX + col * (buttonWidth + padding),
          startY + row * (buttonHeight + padding),
          control,
          {
            fontFamily: "Arial",
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#0000ff",
            padding: { x: 10, y: 10 },
          },
        )
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

  handleControlButtonClick(control: string) {
    if (!this.playerControls.has(control)) {
      console.error("Player does not have control", control);
      return;
    }

    const taskId = this.controlToTaskId.get(control);
    if (!taskId) {
      console.error("No task found for control", control);
      return;
    }

    // Show minigame or w/e here
    // Then depending if player is successful, send the results to the server
    this.gameStore.room?.send("taskCompleted", taskId); // only if player is successful in finishgin the game
    this.fadeTaskNotification(taskId);
  }

  showTaskNotificationText(taskId: string, message: string) {
    const notificationText = this.add
      .text(this.cameras.main.width / 2, 50, message, {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 10 },
      })
      .setOrigin(0.5, 0.5)
      .setVisible(true);
    this.activeTaskNotifications.set(taskId, notificationText);
  }

  fadeTaskNotification(taskId: string) {
    const notificationText = this.activeTaskNotifications.get(taskId);
    if (!notificationText) return;
    this.tweens.add({
      targets: notificationText,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        notificationText.destroy();
        this.activeTaskNotifications.delete(taskId);
      },
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
