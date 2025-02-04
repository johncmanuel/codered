import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { type GameStore } from "../stores/gameStore";
import { type TaskState } from "../types/room";
import { PostMatchUI } from "../gameObjs/postMatchUI";
import { ActiveTaskNotification } from "../gameObjs/activeTaskNotification";
import { ControlButtons } from "../gameObjs/controlButtons";

export const GAME_NAME = "CodeRed";

// Order of execution in scene: init, preload, create, update
// update runs continuously
export class CodeRed extends Scene {
  // btw this is temporary, we wouldn't need to track this much data
  gameStore: GameStore | null;

  playerId: string | null;
  // Client side data structure for holding all of a player's active tasks
  controlToTaskId: Map<string, string>; // Map<control, taskId>
  playerControls: Set<string>;

  // setup game objects here
  controlBtns: ControlButtons;
  activeTaskNotifications: ActiveTaskNotification;
  loadingText: Phaser.GameObjects.Text;
  postMatchUI: PostMatchUI;

  constructor() {
    super(GAME_NAME);
  }

  init() {
    this.gameStore = null;
    this.playerId = null;
    this.controlToTaskId = new Map();
    this.playerControls = new Set();
    this.activeTaskNotifications = new ActiveTaskNotification(this);
    this.controlBtns = new ControlButtons(this);

    EventBus.on("test", (gameStore: GameStore) => {
      this.gameStore = gameStore;
      if (!this.gameStore) {
        throw new Error("No game store");
      }
      if (!this.gameStore.room) {
        console.log(this.gameStore);
        throw new Error("No room");
      }
      this.playerId = this.gameStore.room?.sessionId!;
      if (!this.playerId) {
        throw new Error("No player ID");
      }
      this.createLocalListeners();
      this.createServerListeners();
      this.gameStore.room?.send("playerReady");
      // this.registry.set("room", this.gameStore.room);
    });
  }

  // Load all assets here first and other stuff
  preload() {}

  // load the game objects stuff here
  create() {
    this.loadingText = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 2, "Assigning Controls...", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    this.postMatchUI = new PostMatchUI(this);

    // keep this at the end
    EventBus.emit("current-scene-ready", this);
  }

  update() {}

  // Set up listeners for events from Colyseus server
  //https://docs.colyseus.io/state/schema-callbacks/#schema-callbacks
  createServerListeners() {
    this.gameStore?.room?.state.listen("timer", (timer: number) => {
      EventBus.emit("updateTimer", timer);
    });

    this.gameStore?.room?.state.listen("dataHealth", (dataHealth: number) => {
      EventBus.emit("updateHealth", dataHealth);
      this.registry.set("dataHealth", dataHealth);
    });

    this.gameStore?.room?.state.listen("round", (round: number) => {
      EventBus.emit("updateRound", round);
      this.loadingText.setVisible(true);
      this.registry.set("round", round);
    });

    // Mainly used for notifying the players, this enables the player to verbally cooperate with others
    this.gameStore?.room?.onMessage("newTask", (task: TaskState) => {
      this.activeTaskNotifications.show(task.id, `New Task: ${task.type}`);
    });

    this.gameStore?.room?.onMessage("controls", (controls) => {
      controls.forEach((control: any) => {
        this.playerControls.add(control);
      });
      this.loadingText.setVisible(false);
      this.controlBtns.setPlayerControls(this.playerControls);
      this.controlBtns.show();
    });

    // do stuff once all players connected
    this.gameStore?.room?.onMessage("allPlayersReady", () => {});

    // https://docs.colyseus.io/state/schema-callbacks/#on-collections-of-items

    // Add tasks only for the player with the appropiate controls
    // They won't know if they have the task or not, so other players will have to verbally tell them if they're
    // sent one. It's just like Space Team!
    this.gameStore?.room?.state.activeTasks.onAdd((task: TaskState, key: string) => {
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
        // task.type or task.controls can be used by Phaser to display whatever task to the player
        console.log("Task assigned to you:", task.type);
      }
    });

    // Remove tasks that players have controls for
    this.gameStore?.room?.state.activeTasks.onRemove((task: TaskState, key: string) => {
      if (this.controlToTaskId.get(task.control) === task.id) {
        this.controlToTaskId.delete(task.control);
        console.log("Task removed from you:", task.type);
      }
      // EventBus.emit("taskCompleted", task); // maybe instead of task completed, it should be task failed?
    });

    this.gameStore?.room?.onMessage("gameOver", () => {
      this.postMatchUI.show();
    });

    // handle stuff once the player leaves the game
    //https://docs.colyseus.io/client/#onleave
    this.gameStore?.room?.onLeave((code) => {
      console.log("Left room with code", code);
      this.scene.stop(GAME_NAME);
    });
  }

  // Set up listeners between Phaser events
  createLocalListeners() {
    this.events.on("controlButtonClicked", (control: string) => {
      const taskId = this.handleControlButtonClick(control);

      // Show minigame or w/e here
      // Then depending if player is successful, send the results to the server

      if (!taskId) {
        console.error("No task found for control", control);
        return;
      }
      this.gameStore?.room?.send("taskCompleted", taskId); // only if player is successful in finishgin the game
      this.activeTaskNotifications.fade(taskId);
    });
  }

  handleControlButtonClick(control: string): string | null {
    if (!this.playerControls.has(control)) {
      console.error("Player does not have control", control);
      return null;
    }

    const taskId = this.controlToTaskId.get(control);
    if (!taskId) {
      console.error("No task found for control", control);
      return null;
    }

    return taskId;
  }
}
