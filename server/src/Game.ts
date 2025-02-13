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

export class CodeRedRoom extends Room<GameState> {
  // Allow up to 6 players per room
  maxClients = 6;

  gameInterval!: Delayed;

  TIMER_INTERVAL_MS = 1 * 1000;

  // i think
  maxNumRounds = 6;
  numRequiredTasksCompletedPerRound = 2; // temporary
  roundTimeLimitSecs = initRoundTimeLimitSecs; // 30s for testing, adjust later
  lobbyControls: Set<string> = new Set(); // all controls currently assigned to players
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

      // start the game once all players are in
      this.broadcast("allPlayersReady");
      this.dispatcher.dispatch(new AssignPlayerControlsCommand());
      this.tasksArrCurrRound = this.batchCreateTasks(this.numRequiredTasksCompletedPerRound);
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
    });

    // Handle stuff once a player fails a task
    this.onMessage("taskFailed", (client, taskId: string) => {
      this.dispatcher.dispatch(new OnTaskFailureCommand(), {
        client,
        taskId,
        healthDiff: 5,
      });
    });

    // Send the game over stats to the clients
    this.onMessage("gameOverStats", (client) => {
      // TODO: Just sending the state data for now. in the future, send relevant data listed in
      // the proposal.
      this.broadcast("gameOverStats", this.state);
    });

    this.onMessage("giveMeControlsPls", (client) => {
      const playerId = client.sessionId;
      const controls = this.lobbyControlsByPlayer.get(playerId)!;
      const controlsArr = new Array<string>();
      if (!controls) {
        console.error("Player", playerId, "does not have any controls assigned to them.");
        console.log("controls", controls);
        return;
      }
      controls.forEach((control) => {
        controlsArr.push(control);
      });
      console.log("Sending controls to player", playerId, controlsArr);
      client.send("controls", controlsArr);
      // then send tasks? if sync issues still exist
    });

    // check if player can do it, if so, let them perform the task
    this.onMessage("taskForControl", (client, control: string) => {
      const playerId = client.sessionId;
      const playerControls = this.lobbyControlsByPlayer.get(playerId);

      // Check if the player has the control
      if (!playerControls || !playerControls.includes(control)) {
        console.log("Player", playerId, "does not have control", control);
        client.send("noTaskForControl", { control });
        return;
      }

      // Find a task that matches the control
      const task = this.actualTasks.find((t) => t.control === control);

      if (task) {
        client.send("hasTaskForControl", task);
      } else {
        console.log("No task found for control", control);
        client.send("noTaskForControl", control);
      }
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
    this.state.players.forEach((player, sessionId) => {
      if (player.activeTaskId === null && this.tasksArrCurrRound.length > 0) {
        const task = this.tasksArrCurrRound.shift()!;
        const client = this.clients.find((c) => c.sessionId === sessionId);
        this.dispatcher.dispatch(new AssignTaskToPlayerCommand(), { client, task });
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
    }
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
    task.timeLimit = 30; // Can be adjusted as players get further in the rounds
    task.control = TaskToControls.get(taskType) || "";
    return task;
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
}
