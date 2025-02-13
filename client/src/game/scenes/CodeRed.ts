import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { type GameStore } from "../stores/gameStore";
import { type TaskState, Tasks } from "../types/room";
import { PostMatchUI } from "../gameObjs/postMatchUI";
import { AssignedTaskNotif } from "../gameObjs/activeTaskNotification";
import { ControlButtons } from "../gameObjs/controlButtons";
import { TaskManager } from "../gameObjs/tasks/taskManager";
import { createTask } from "../gameObjs/tasks/taskFactory";

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
  assignedTaskNotifs: AssignedTaskNotif;
  loadingText: Phaser.GameObjects.Text;
  postMatchUI: PostMatchUI;
  taskManager: TaskManager;

  constructor() {
    super(GAME_NAME);
  }

  init() {
    this.gameStore = null;
    this.playerId = null;
    this.controlToTaskId = new Map();
    this.playerControls = new Set();
    this.assignedTaskNotifs = new AssignedTaskNotif(this);
    this.controlBtns = new ControlButtons(this);
    this.taskManager = new TaskManager();

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
      this.createLocalListeners();
      this.createServerListeners();
      this.gameStore.room?.send("playerReady");
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

  update() {
    this.taskManager.update();
  }

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

    // prep for start of new round
    this.gameStore?.room?.state.listen("round", (round: number) => {
      console.log("new round", round);
      EventBus.emit("updateRound", round);
      this.registry.set("round", round);
      this.assignedTaskNotifs.clear();
      this.taskManager.cleanup();
      this.controlToTaskId.clear();

      this.loadingText.setVisible(true);
      this.controlBtns.hide();

      this.gameStore?.room?.send("giveMeControlsPls");
    });

    // this can either be a task they can do or a task they have to tell another player to do
    // this is where the cooperative aspect of the game comes in
    this.gameStore?.room?.onMessage("newTask", (task: TaskState) => {
      this.assignedTaskNotifs.add(`New Task: ${task.type}`, task.id);
    });

    // handle controls assigned to the player from server
    this.gameStore?.room?.onMessage("controls", (controls) => {
      if (!controls) {
        console.error("No controls received from server");
        return;
      }
      this.applyPlayerControls(controls);
      this.loadingText.setVisible(false);
      this.controlBtns.show();
      this.assignedTaskNotifs.show();
      this.controlBtns.check();
      // request server for tasks they can do
      // this.gameStore?.room?.send("giveMeTasksPls");
    });

    // do stuff once all players connected
    this.gameStore?.room?.onMessage("allPlayersReady", () => {});

    // do stuff right before the game begins
    this.gameStore?.room?.onMessage("beforeGameLoop", () => {
      this.gameStore?.room?.send("giveMeControlsPls");
    });

    // https://docs.colyseus.io/state/schema-callbacks/#on-collections-of-items

    // Add tasks only for the player with the appropiate controls
    // They won't know if they have the task or not, so other players will have to verbally tell them if they're
    // sent one. It's just like Space Team!
    this.gameStore?.room?.state.activeTasks.onAdd((task: TaskState, key: string) => {
      // if (
      //   task.control === "" ||
      //   !task.control ||
      //   !this.playerControls.has(task.control) ||
      //   this.controlToTaskId.has(task.control)
      // ) {
      //   console.log("Task not meant for you:", task.type);
      //   console.log(
      //     task.control,
      //     this.playerControls.has(task.control),
      //     this.controlToTaskId.has(task.control),
      //   );
      //   return;
      // }
      //
      // this.controlToTaskId.set(task.control, task.id);
      // // task.type or task.controls can be used by Phaser to display whatever task to the player
      // console.log("Task that's meant for you:", task.type);
      // const taskTypeNum = Tasks[task.type as keyof typeof Tasks];
      // console.log(taskTypeNum, task.type);
      // this.taskManager.addTask(task.id, createTask(this, task.id, taskTypeNum));
    });

    // Remove tasks that players have controls for
    this.gameStore?.room?.state.activeTasks.onRemove((task: TaskState, key: string) => {
      // if (this.controlToTaskId.get(task.control) === task.id) {
      //   this.controlToTaskId.delete(task.control);
      //   console.log("Task removed from you:", task.type);
      // }
    });

    this.gameStore?.room?.onMessage("hasTaskForControl", (task: TaskState) => {
      console.log("Task assigned:", task.type, task);
      const taskTypeNum = Tasks[task.type as keyof typeof Tasks];
      this.taskManager.addTask(task.id, createTask(this, task.id, taskTypeNum));
      this.taskManager.startTask(task.id);
    });

    this.gameStore?.room?.onMessage("noTaskForControl", (control: string) => {
      console.log("No task available for control:", control);
      // do something else like notify the player (e.g., display a message or play a sound)
    });

    this.gameStore?.room?.onMessage("taskCompleted", (taskId: string) => {
      if (this.assignedTaskNotifs.getTaskId() === taskId) this.assignedTaskNotifs.fade();
      else console.warn("Task completed but the notification is still there");
    });

    this.gameStore?.room?.onMessage("taskFailed", (taskId: string) => {
      if (this.assignedTaskNotifs.getTaskId() === taskId) this.assignedTaskNotifs.fade();
      else console.warn("Task completed but the notification is still there");
    });

    this.gameStore?.room?.onMessage("gameOver", () => {
      this.loadingText.setVisible(false);
      this.controlBtns.hide();
      this.assignedTaskNotifs.hide();
      this.postMatchUI.show();
      this.taskManager.cleanup();
    });

    // handle stuff once the player leaves the game
    //https://docs.colyseus.io/client/#onleave
    this.gameStore?.room?.onLeave((code) => {
      console.log("Left room with code", code);
      this.scene.stop(GAME_NAME);
    });
  }

  applyPlayerControls(controls: any) {
    // check if user already has controls
    if (this.playerControls.size > 0) {
      console.log("Clearing controls");
      this.playerControls.clear();
      this.controlBtns.clear();
    }

    controls.forEach((control: any) => {
      this.playerControls.add(control);
    });
    console.log("Controls received:", this.playerControls);
    this.controlBtns.setPlayerControls(this.playerControls);
  }

  // Set up listeners between Phaser events
  createLocalListeners() {
    this.events.on("controlButtonClicked", (control: string) => {
      // send to server to validate if player can do the task
      this.gameStore?.room?.send("taskForControl", control);

      // const taskId = this.handleControlButtonClick(control);
      // if (!taskId) {
      //   console.error("taskId", taskId, "is null for control", control);
      //   return;
      // }
      //
      // if (!this.taskManager.isTaskStarted()) {
      //   // Show minigame or w/e here
      //   // Then depending if player is successful, send the results to the server
      //   this.taskManager.startTask(taskId);
      // } else {
      //   console.error("Cannot start new task - another task is already active");
      // }
    });
    this.events.on("taskCompleted", (taskId: string) => {
      this.gameStore?.room?.send("taskCompleted", taskId);
      if (this.assignedTaskNotifs.getTaskId() === taskId) this.assignedTaskNotifs.fade();
      this.taskManager.removeTask(taskId);
    });
    this.events.on("taskFailed", (taskId: string) => {
      this.gameStore?.room?.send("taskFailed", taskId);
      if (this.assignedTaskNotifs.getTaskId() === taskId) this.assignedTaskNotifs.fade();
      this.taskManager.removeTask(taskId);
    });
  }

  // handleControlButtonClick(control: string): string | null {
  //   if (!this.playerControls.has(control)) {
  //     console.error("Player does not have control", control);
  //     return null;
  //   }
  //
  //   // const taskId = this.controlToTaskId.get(control);
  //   // if (!taskId) {
  //   //   console.error("No task found for control", control);
  //   //   return null;
  //   // }
  //
  //   return taskId;
  // }
}
