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
import { generateRoomCode, shuffleArray } from "./utils";

export class CodeRedRoom extends Room<GameState> {
  // Allow up to 6 players per room
  maxClients = 6;

  timerInterval!: Delayed;
  taskGenerationInterval!: Delayed;

  // i think
  maxNumRounds = 6;
  numRequiredTasksCompleted = 15;
  roundTimeLimitSecs = initRoundTimeLimitSecs; // 30s for testing, adjust later
  lobbyControls: Set<string> = new Set(); // all controls currently assigned to players

  dispatcher = new Dispatcher(this);

  LOBBY_CHANNEL = "coderedlobby";

  async onCreate(options: any) {
    this.setState(new GameState());
    this.roomId = await this.generateRoomId();

    // Create all our event handlers down below
    // This is where most of our multiplayer logic will be

    // Handle starting the game
    this.onMessage("startGame", (client) => {
      this.assignPlayerControls();

      this.dispatcher.dispatch(new OnStartGameCommand(), {
        client,
      });

      // Start timer immediately, but ideally should do so once everyone is properly connected
      this.startClock();
      this.broadcast("controlsReady");
      this.gameLoop();
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
      // Just sending the state data for now. in the future, send relevant data listed in
      // the proposal.
      this.broadcast("gameOverStats", this.state);
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

  startClock() {
    this.clock.start();
    console.log("Timer started!");
  }

  gameLoop() {
    const TIMER_INTERVAL_MS = 1 * 1000;

    // Keep track of the current round's timer
    this.timerInterval = this.clock.setInterval(() => {
      this.state.timer--;
      if (this.state.timer === 0) {
        // If there are still active tasks by the time the round ends, the game is over
        if (this.state.activeTasks.size > 0) {
          this.dispatcher.dispatch(new EndGameCommand());
        } else {
          this.dispatcher.dispatch(new StartNewRoundCommand());
        }
      }
      // TODO: stop sending tasks once it reaches required num of tasks completed
      if (!this.state.isGameOver) {
        const task = this.createNewTask();
        if (task) {
          this.assignTaskToRandomPlayer(task);
        }
      }
    }, TIMER_INTERVAL_MS);
  }

  assignTaskToRandomPlayer(task: TaskState) {
    const playersWithoutActiveTasks = Array.from(this.state.players.entries())
      .filter(([sessionId, player]) => player.activeTaskId === null)
      .map(([sessionId, player]) => ({ sessionId, player }));

    if (playersWithoutActiveTasks.length === 0) {
      console.log("No players available to assign task to");
      return;
    }

    const randomPlayerEntry =
      playersWithoutActiveTasks[Math.floor(Math.random() * playersWithoutActiveTasks.length)];
    if (!randomPlayerEntry) {
      console.error("No player found to assign task to.");
      return;
    }

    const { sessionId, player: randomPlayer } = randomPlayerEntry;
    const playerClient = this.clients.find((c) => c.sessionId === sessionId);

    if (!playerClient) {
      console.error("Client not found for player with sessionId:", sessionId);
      return;
    }

    this.state.players.get(sessionId)!.activeTaskId = task.id;
    this.state.activeTasks.set(task.id, task);
    playerClient.send("newTask", task);
    console.log("Task sent to player:", sessionId, "task type:", task.type);
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

  assignPlayerControls() {
    const controls = Array.from(TaskToControls.values());
    if (controls.length < this.state.players.size) {
      console.warn("there are more players than controls");
    }
    const shuffledControls = shuffleArray(controls);
    const controlsPerPlayer = Math.floor(shuffledControls.length / this.state.players.size);
    const remainingControls = shuffledControls.length % this.state.players.size;
    let index = 0;

    // Ensure 1 type of each control exists and each player receives a fair amount of controls
    this.state.players.forEach((player) => {
      const controlsToAssign = controlsPerPlayer + (index < remainingControls ? 1 : 0);
      for (let i = 0; i < controlsToAssign; i++) {
        if (shuffledControls.length > 0) {
          const control = shuffledControls.shift()!;
          player.controls.push(control);
          if (!this.lobbyControls.has(control)) this.lobbyControls.add(control);
        } else {
          console.error("Not enough controls to assign to all players.");
        }
        console.log("Player", player.name, "assigned control", player.controls[i]);
      }
      index++;
    });
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
