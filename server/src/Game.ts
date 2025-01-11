import { Room, Client, Delayed } from "@colyseus/core";
import { GameState, Tasks, TaskState, initRoundTimeLimitSecs } from "./CodeRedState";
import { Dispatcher } from "@colyseus/command";
import { OnTaskFailureCommand } from "./cmds/onTaskFailureCommand";
import { OnJoinCommand } from "./cmds/onJoinCommand";
import { OnLeaveCommand } from "./cmds/onLeaveCommand";
import { StartNewRoundCommand } from "./cmds/startNewRoundCommand";
import { EndGameCommand } from "./cmds/endGameCommand";
import { OnTaskCompletionCommand } from "./cmds/onTaskCompletionCommand";

export class CodeRedRoom extends Room<GameState> {
  // Allow up to 6 players per room
  maxClients = 6;

  timerInterval!: Delayed;
  taskGenerationInterval!: Delayed;

  // i think
  maxNumRounds = 6;
  numRequiredTasksCompleted = 15;
  roundTimeLimitSecs = initRoundTimeLimitSecs; // 30s for testing, adjust later

  dispatcher = new Dispatcher(this);

  onCreate(options: any) {
    this.setState(new GameState());
    this.state.roomCode = this.generateRoomCode();

    // Create all our event handlers down below
    // This is where most of our multiplayer logic will be

    // Handle starting the game
    this.onMessage("startGame", (client) => {
      if (client.sessionId !== this.state.hostId) {
        return;
      }

      if (this.clients.length < 3) {
        console.log("Cannot start game with less than 3 players");
        return;
      }

      console.log("Starting game for lobby roomid", this.roomId);

      // Let everyone know the game begins now!
      this.broadcast("startGame");

      // Start timer immediately, but ideally should do so once everyone is properly connected
      this.startClock();
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
  }

  startClock() {
    this.clock.start();
    console.log("Timer started!");
  }

  // Technically the game loop
  gameLoop() {
    const TIMER_INTERVAL_MS = 1 * 1000;
    const TASK_GENERATION_INTERVAL_MS = 5 * 1000;

    // Keep track of the current round's timer
    this.timerInterval = this.clock.setInterval(() => {
      this.state.timer--;
      if (this.state.timer === 0) {
        this.dispatcher.dispatch(new StartNewRoundCommand());
      }
      // Create task here randomly between some range
    }, TIMER_INTERVAL_MS);

    // Generate a new task periodically
    // this.taskGenerationInterval = this.clock.setInterval(() => {
    //   if (this.state.isGameOver) return;
    //
    //   const task = this.createNewTask();
    //   this.broadcast("newTask", task);
    //   console.log("New task created for", task.assignedTo);
    //
    //   // Reduce data health if too many active tasks
    //   if (this.state.activeTasks.size > this.clients.length * 2) {
    //     this.state.dataHealth -= 5;
    //     if (this.state.dataHealth <= 0) {
    //       this.state.isGameOver = true;
    //       this.broadcast("gameOver");
    //     }
    //   }
    // }, TASK_GENERATION_INTERVAL_MS);
  }

  // Randomly select a task
  // Randomly select a player to assign the task to
  // Set the time limit for the task
  // Add the task to the list of tasks
  createNewTask() {
    const taskTypes = Object.values(Tasks).filter((t) => typeof t === "number");
    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)] as Tasks;

    // Assign the task once player who has correct controls does the task
    // const playerIds = Array.from(this.state.players.keys());
    // const randomPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];

    const task = new TaskState();
    task.id = Math.random().toString(36).substring(2, 9);
    task.type = Tasks[taskType];
    // task.assignedTo = randomPlayerId;
    task.timeCreated = this.clock.currentTime;
    task.timeLimit = 30; // Can be adjusted as players get further in the rounds

    this.state.activeTasks.set(task.id, task);
    return task;
  }

  // Generates a random, unique 6-character room code
  generateRoomCode(): string {
    const numChars = 6;
    return Math.random().toString(36).substring(2, numChars).toUpperCase();
  }
}
