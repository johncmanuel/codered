import { Room, Client, Delayed } from "@colyseus/core";
import {
  GameState,
  Tasks,
  TaskState,
  initRoundTimeLimitSecs,
  TaskToControls,
} from "./CodeRedState";
import { Dispatcher } from "@colyseus/command";
import { OnTaskFailureCommand } from "./cmds/onTaskFailureCommand";
import { OnJoinCommand } from "./cmds/onJoinCommand";
import { OnLeaveCommand } from "./cmds/onLeaveCommand";
import { StartNewRoundCommand } from "./cmds/startNewRoundCommand";
import { OnTaskCompletionCommand } from "./cmds/onTaskCompletionCommand";
import { OnStartGameCommand } from "./cmds/onStartGameCommand";
import { EndGameCommand } from "./cmds/endGameCommand";
import { generateRoomCode } from "./utils";
import { AssignPlayerControlsCommand } from "./cmds/assignPlayerControlsCommand";
import { AssignTaskToRandomPlayerCommand } from "./cmds/assignTaskToRandomPlayerCommand";
import { ArraySchema } from "@colyseus/schema";
import { AssignTaskToPlayerCommand } from "./cmds/assignTaskToPlayer";
import { SendControlsToClient } from "./cmds/sendControlsToClient";
import { SendTaskToClient } from "./cmds/sendTaskToClient";

export class CodeRedRoom extends Room<GameState> {
  // Allow up to 6 players per room
  maxClients = 6;

  gameInterval!: Delayed;

  TIMER_INTERVAL_MS = 1 * 1000;

  // i think
  maxNumRounds = 6;
  numTotalTasksRequiredPerRound = 5; // default value if not modified yet
  baseTasksPerPlayer = 3; // defines how many tasks each player gets per round
  roundTimeLimitSecs = initRoundTimeLimitSecs;

  // all controls currently assigned to players
  lobbyControls: Set<string> = new Set();
  numPlayersReady: number = 0;

  // controls assigned to each player
  // send each client their controls when asked
  lobbyControlsByPlayer: Map<string, ArraySchema<string>> = new Map();

  // stores the tasks for the current round
  tasksArrCurrRound: TaskState[] = [];

  dispatcher = new Dispatcher(this);

  actualTasks: Array<TaskState> = new Array<TaskState>();

  LOBBY_CHANNEL = "coderedlobby";

  async onCreate(options: any) {
    this.setState(new GameState());
    this.roomId = await this.generateRoomId();

    // Create all our event handlers down below
    // This is where most of our multiplayer logic will be

    // Handle starting the game
    this.onMessage("startGame", (client) => {
      this.dispatcher.dispatch(new OnStartGameCommand(), {
        client,
      });
      this.broadcast("startGame");
    });

    // handle stuff once all players are properly connected
    this.onMessage("playerReady", () => {
      this.numPlayersReady++;
      if (this.numPlayersReady !== this.state.players.size) return;

      this.numTotalTasksRequiredPerRound = this.setRequiredTasksPerRound(
        this.state.players.size,
        this.baseTasksPerPlayer,
      );
      console.log("this.numRequiredTasksCompletedPerRound", this.numTotalTasksRequiredPerRound);

      // start the game once all players are in
      this.broadcast("allPlayersReady");
      this.dispatcher.dispatch(new AssignPlayerControlsCommand());
      this.tasksArrCurrRound = this.batchCreateTasks(this.numTotalTasksRequiredPerRound);
      this.assignInitialTasks();

      this.startClock();
      this.gameLoop();
      this.numPlayersReady = 0;
    });

    // Handle stuff once a player finishs a task
    this.onMessage("taskCompleted", (client, taskId: string) => {
      this.dispatcher.dispatch(new OnTaskCompletionCommand(), {
        client,
        taskId,
      });
      if (this.state.tasksDone >= this.numTotalTasksRequiredPerRound) {
        this.dispatcher.dispatch(new StartNewRoundCommand());
      }
    });

    // Handle stuff once a player fails a task
    this.onMessage("taskFailed", (client, taskId: string) => {
      const healthDiff = this.computeHealthDiff(this.state.round);
      this.dispatcher.dispatch(new OnTaskFailureCommand(), {
        client,
        taskId,
        healthDiff: healthDiff,
      });
      if (this.state.tasksDone >= this.numTotalTasksRequiredPerRound) {
        this.dispatcher.dispatch(new StartNewRoundCommand());
      }
    });

    this.onMessage("giveMeControlsPls", (client) => {
      this.dispatcher.dispatch(new SendControlsToClient(), { client });
    });

    // check if player can do it, if so, let them perform the task
    this.onMessage("taskForControl", (client, control: string) => {
      this.dispatcher.dispatch(new SendTaskToClient(), { client, control });
    });

    // handle task request from a player
    this.onMessage("giveMeTaskPls", (client) => {
      if (this.tasksArrCurrRound.length === 0) {
        console.log("tasksArrCurrRound is empty", this.tasksArrCurrRound, this.actualTasks);
        client.send("noMoreTasks");
        return;
      }
      const newTask = this.tasksArrCurrRound.shift()!;
      console.log("newTask", newTask);
      if (!newTask) {
        console.log("No more tasks to assign!", this.tasksArrCurrRound, this.actualTasks);
        client.send("noMoreTasks");
        return;
      }
      this.dispatcher.dispatch(new AssignTaskToPlayerCommand(), {
        client,
        task: newTask,
      });
    });

    this.onMessage("trackAdsClicked", (client) => {
      this.state.totalAdsClicked++;
    });
  }

  onJoin(client: Client, options: any) {
    this.dispatcher.dispatch(new OnJoinCommand(), {
      client,
      options,
    });
  }

  onLeave(client: Client, options: any) {
    this.dispatcher.dispatch(new OnLeaveCommand(), {
      client,
      options,
    });
  }

  onDispose() {
    console.log("lobby", this.roomId, "disposing...");
    this.dispatcher.stop();
    this.presence.srem(this.LOBBY_CHANNEL, this.roomId);
  }

  // Assign tasks to all players who don't have an active task
  // This will only be called once at the start of each round
  assignInitialTasks() {
    console.log("Assigning initial tasks to players...");
    console.log("Total players size as of round", this.state.round, ":", this.state.players.size);
    this.state.players.forEach((player, sessionId) => {
      console.log(
        "Checking player",
        player.name,
        sessionId,
        "for initial task assignment",
        "- activeTaskId:",
        player.activeTaskId,
      );
      if (player.activeTaskId === null && this.tasksArrCurrRound.length > 0) {
        const task = this.tasksArrCurrRound.shift()!;
        const client = this.clients.find((c) => c.sessionId === sessionId);
        this.dispatcher.dispatch(new AssignTaskToPlayerCommand(), {
          client,
          task,
        });
      }
    });
  }

  startClock() {
    this.clock.start();
    console.log("Timer started!");
  }

  gameLoop() {
    this.broadcast("beforeGameLoop");
    this.gameInterval = this.clock.setInterval(() => {
      // Keep track of the current round's timer
      this.state.timer--;
      this.state.totalTimeSecs++;
      if (this.state.timer === 0) {
        // If there are still active tasks by the time the round ends, the game is over
        this.state.activeTasks.size > 0
          ? this.dispatcher.dispatch(new EndGameCommand())
          : this.dispatcher.dispatch(new StartNewRoundCommand());
      }
    }, this.TIMER_INTERVAL_MS);
  }

  batchCreateTasks(numTasks: number): TaskState[] {
    const tasks: TaskState[] = [];
    for (let i = 0; i < numTasks; i++) {
      const task = this.createNewTask();
      if (task) {
        tasks.push(task);
      }
      console.log("Task created", task?.type);
    }
    console.log("Tasks created in batchCreateTasks:", tasks);
    return tasks;
  }

  createNewTask(): TaskState | null {
    const taskTypes = Object.values(Tasks).filter((t) => {
      const control = TaskToControls.get(t as Tasks);
      return control && this.lobbyControls.has(control);
    });

    if (taskTypes.length === 0) {
      console.error("No valid task types available (no matching controls in lobbyControls).");
      return null;
    }

    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)] as Tasks;
    const task = new TaskState();

    task.id = Math.random().toString(36).substring(2, 9);
    task.type = Tasks[taskType];
    // task.timeLimit = 30; // Can be adjusted as players get further in the rounds
    task.control = TaskToControls.get(taskType) || "";
    return task;
  }

  // if max number of players is 6 and basetasksPerPlayer is 5, then
  // playerCount*basetasksPerPlayer = 6*5 = 30 tasks in total per round
  setRequiredTasksPerRound(playerCount: number, baseTasksPerPlayer: number = 5): number {
    const minTasks = this.state.players.size;
    return Math.max(minTasks, playerCount * baseTasksPerPlayer);
  }

  // See this guide for generating custom room IDs
  // https://docs.colyseus.io/community/custom-room-id/?h=room+id
  async generateRoomId(): Promise<string> {
    const currentIds = await this.presence.smembers(this.LOBBY_CHANNEL);
    const numChars = 4;
    let id;

    do {
      id = generateRoomCode(numChars);
    } while (currentIds.includes(id));

    await this.presence.sadd(this.LOBBY_CHANNEL, id);
    return id;
  }

  private computeHealthDiff(round: number, baseHealthDiff: number = 5): number {
    const roundMultiplier = Math.max(1, this.state.round);

    // all possible methods of dynamically computing the health diff
    // based on number of rounds
    // 1. Linear increase: baseHealthDiff * roundMultiplier
    // 2. Exponential increase: baseHealthDiff * Math.pow(1.5, this.state.currentRound)
    // 3. Step increase: baseHealthDiff + (10 * this.state.currentRound)
    // 4. Cap the maximum: Math.min(baseHealthDiff * roundMultiplier, 100)
    const newHealthDiff = baseHealthDiff * roundMultiplier;
    return newHealthDiff;
  }
}
