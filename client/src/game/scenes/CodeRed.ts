import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { type GameStore } from "../stores/gameStore";
import {
  type TaskState,
  Tasks,
  type GameState,
  FillerTasks,
  type TaskCompletedData,
  getTaskMessage,
} from "../types/room";
import { PostMatchUI } from "../gameObjs/postMatchUI";
import { AssignedTaskNotification } from "../gameObjs/activeTaskNotification";
import { ControlButtons } from "../gameObjs/controlButtons";
import { TaskManager } from "../gameObjs/tasks/taskManager";
import { createTask } from "../gameObjs/tasks/taskFactory";
import { ControlButtonDisabler } from "../gameObjs/buttonDisabler";
import { SpamAds } from "../gameObjs/spamAds";
import { type IRoundTimer, type IDataHealth } from "../types/eventBusTypes";
import { ObstacleTimer } from "../gameObjs/obstacleTimer";
import { GameplayScreen } from "../gameObjs/gameplayScreen";
import { TimeLimitBar } from "../gameObjs/taskTimeLimitBar";
import { TasksCompleteNotif } from "../gameObjs/tasksCompleteNotif";

export const GAME_NAME = "CodeRed";

// Order of execution in scene: init, preload, create, update
// update runs continuously
export class CodeRed extends Scene {
  // btw this is temporary, we wouldn't need to track this much data
  private gameplayScreen: GameplayScreen;
  gameStore: GameStore | null;

  playerId: string | null;
  playerControls: Set<string>;
  currentTaskTypeNum: number | null;

  // setup game objects here
  controlBtns: ControlButtons;
  assignedTaskNotifs: AssignedTaskNotification;
  loadingText: Phaser.GameObjects.Text;
  postMatchUI: PostMatchUI;
  taskManager: TaskManager;

  adsSpammer: SpamAds;

  controlBtnDisabler: ControlButtonDisabler;

  hideInformation: boolean;

  obstacleTimer: ObstacleTimer;
  timeLimitBar: TimeLimitBar | null;
  allTasksCompleteNotif: TasksCompleteNotif;

  constructor() {
    super(GAME_NAME);
  }

  init() {
    this.gameStore = null;
    this.playerId = null;
    this.playerControls = new Set();
    this.assignedTaskNotifs = new AssignedTaskNotification(this);
    this.controlBtns = new ControlButtons(this);
    this.taskManager = new TaskManager();
    this.adsSpammer = new SpamAds(this);
    this.hideInformation = false;
    this.timeLimitBar = null;
    this.allTasksCompleteNotif = new TasksCompleteNotif(this);

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
  preload() {
    this.load.image("exe", "/assets/exe.png");
    this.load.image("wifiIcon", "/assets/wifi.png");
    this.load.image("powerIcon", "/assets/power.png");
    this.load.image("calender", "/assets/calender.png");
    this.load.image("volume", "/assets/volume-up.png");
    this.load.image("clock", "/assets/clock.png");
  }

  // load the game objects stuff here
  create() {
    this.loadingText = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 2, "Assigning Controls...", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    this.gameplayScreen = new GameplayScreen(this);
    this.gameplayScreen.show();
    this.gameplayScreen.startUpdatingTime();

    this.postMatchUI = new PostMatchUI(this);
    this.controlBtnDisabler = new ControlButtonDisabler(this, this.controlBtns);
    this.obstacleTimer = new ObstacleTimer(
      this,
      this.controlBtns,
      this.adsSpammer,
      this.controlBtnDisabler,
    );

    // keep this at the end
    EventBus.emit("current-scene-ready", this);
  }

  update(time: number, delta: number): void {
    this.taskManager.update();
  }

  // Set up listeners for events from Colyseus server
  //https://docs.colyseus.io/state/schema-callbacks/#schema-callbacks
  createServerListeners() {
    this.gameStore?.room?.state.listen("timer", (timer: number) => {
      const roundTimer: IRoundTimer = { timer, hideInfo: this.hideInformation };
      EventBus.emit("updateTimer", roundTimer);
      // ensure registry keeps actual timer
      this.registry.set("timer", timer);
    });

    this.gameStore?.room?.state.listen("dataHealth", (dataHealth: number) => {
      const dataHealthObj: IDataHealth = { health: dataHealth, hideInfo: this.hideInformation };
      EventBus.emit("updateHealth", dataHealthObj);
      // ensure registry keeps actual data health
      this.registry.set("dataHealth", dataHealth);
    });

    // prep for start of new round
    this.gameStore?.room?.state.listen("round", (round: number) => {
      console.log("new round", round);
      EventBus.emit("updateRound", round);
      this.registry.set("round", round);

      // this.assignedTaskNotifs.clear();
      this.taskManager.cleanup();

      this.loadingText.setVisible(true);
      this.controlBtns.hide();
      this.allTasksCompleteNotif.hide();

      this.gameStore?.room?.send("giveMeControlsPls");
    });

    // this can either be a task they can do or a task they have to tell another player to do
    // this is where the cooperative aspect of the game comes in
    this.gameStore?.room?.onMessage("newTask", (task: TaskState) => {
      const taskMessage = getTaskMessage(task.type);
      this.assignedTaskNotifs.add(`New Task: ${taskMessage}`, task.id);
      console.log("New task assigned:", task.type, task);

      // TODO: set time limit dynamically based on number of rounds
      // const taskTimeLimitSec = 10;
      // if (this.timeLimitBar) {
      //   console.warn("old time limit bar still exists, removing");
      //   // return;
      // }
      // this.timeLimitBar = new TimeLimitBar({
      //   scene: this,
      //   maxTimeSec: taskTimeLimitSec,
      //   labelText: "Task Time Limit",
      //   // if timer runs out before player clicks on controls,
      //   // task is failed
      //   onCompleteCallback: (bar) => {
      //     bar.destroy();
      //     this.assignedTaskNotifs.fade();
      //     this.events.emit("taskFailed", task.id);
      //   },
      // });
      // this.timeLimitBar.startTimer();
    });

    // receive updates on time limit once received
    // this.gameStore?.room?.onMessage("updateTaskTimeLimit", (taskTimeLimitSec: number) => {});

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
      this.events.emit("newRound");
    });

    // do stuff once all players connected
    this.gameStore?.room?.onMessage("allPlayersReady", () => {});

    // do stuff right before the game begins
    this.gameStore?.room?.onMessage("beforeGameLoop", () => {
      this.gameStore?.room?.send("giveMeControlsPls");
    });

    // start the task
    this.gameStore?.room?.onMessage("hasTaskForControl", (task: TaskState) => {
      console.log("Task assigned:", task.type, task);

      // if (this.timeLimitBar) this.timeLimitBar.destroy();

      const taskTypeNum = Tasks[task.type as keyof typeof Tasks];
      this.taskManager.addTask(task.id, createTask(this, task.id, taskTypeNum));
      this.taskManager.startTask(task.id);

      // only stop the timer if it's not a filler task
      // @ts-ignore: this still works despite strings being compared (when it's actually numbers)
      if (!Object.values(FillerTasks).includes(taskTypeNum)) {
        this.currentTaskTypeNum = taskTypeNum;
        console.log("Task is not a filler task, stopping it", taskTypeNum);
        this.obstacleTimer.stopAll();
      }
    });

    // handle things if there isn't a task for the player's specific control
    this.gameStore?.room?.onMessage("noTaskForControl", (control: string) => {
      console.log("No task available for control:", control);
      // do something else like notify the player (e.g., display a message or play a sound)
    });

    this.gameStore?.room?.onMessage("taskCompleted", (data: TaskCompletedData) => {
      console.log("task completed", data.taskId);
      this.handleTaskNotifs(data.taskId);
    });

    this.gameStore?.room?.onMessage("taskFailed", (data: TaskCompletedData) => {
      console.log("task failed", data.taskId);
      this.handleTaskNotifs(data.taskId);
    });

    this.gameStore?.room?.onMessage("gameOverStats", (gameState: GameState) => {
      this.postMatchUI.setGameState(gameState);
      this.loadingText.setVisible(false);
      this.controlBtns.clear();
      this.assignedTaskNotifs.hide();
      this.taskManager.cleanup();
      this.adsSpammer.clearAds();
      this.obstacleTimer.stopAll();
      this.allTasksCompleteNotif.hide();

      this.postMatchUI.show();
    });

    this.gameStore?.room?.onMessage("noMoreTasks", () => {
      console.log("all tasks complete");
      this.allTasksCompleteNotif.show();
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
    this.controlBtnDisabler.setControlButtons(this.controlBtns);
    this.obstacleTimer.setControlButtonDisabler(this.controlBtnDisabler);
  }

  // Set up listeners between Phaser events
  createLocalListeners() {
    // send to server to validate if player can do the task
    this.events.on("controlButtonClicked", (control: string) => {
      this.gameStore?.room?.send("taskForControl", control);
    });
    this.events.on("taskCompleted", (taskId: string) => {
      this.gameStore?.room?.send("taskCompleted", taskId);
      this.handleTaskOutcome(taskId);
    });
    this.events.on("taskFailed", (taskId: string) => {
      this.gameStore?.room?.send("taskFailed", taskId);
      this.handleTaskOutcome(taskId);
    });
    // triggers after controls are assigned, which is a must need before anything else
    this.events.on("newRound", () => {
      const round = this.registry.get("round") as number;
      this.obstacleTimer.stopAll();
      // stop any ongoing events and start a new one
      if (round > 1) {
        this.hideInformation = this.canHideInformation();
        this.adsSpammer.clearAds();
        this.obstacleTimer.startAll();
      }
    });

    this.events.on("adClicked", () => {
      this.gameStore?.room?.send("trackAdsClicked");
      console.log("Ad clicked, sending to server");
    });
  }

  // hide information from the player, forcing them to rely on other players
  // NOTE: probabily of all players having hidden information is (0.3)^n,
  // so it's not likely that all players will have hidden information
  private canHideInformation(hideProb: number = 0.3): boolean {
    return Math.random() < hideProb;
  }

  private handleTaskOutcome(taskId: string) {
    if ((this.registry.get("round") as number) > 1 && this.currentTaskTypeNum !== null) {
      console.log("starting obstacle timer again");
      this.currentTaskTypeNum = null;
      this.obstacleTimer.startAll();
    }
    this.taskManager.removeTask(taskId);
  }

  private handleTaskNotifs(taskId: string) {
    console.log(
      "taskId",
      taskId,
      "this.assignedTaskNotifs.getCurrentTaskId()",
      this.assignedTaskNotifs.getCurrentTaskId(),
    );
    if (this.assignedTaskNotifs.getCurrentTaskId() === taskId) {
      this.assignedTaskNotifs.fade();
    } else {
      console.error("Task finished but the notification is still there");
    }

    this.gameStore?.room?.send("giveMeTaskPls", taskId);
  }
}
