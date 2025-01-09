import { Room, Client, Delayed } from "@colyseus/core";
import { PlayerState, GameState, Tasks, TaskState } from "./CodeRedState";

export class CodeRedRoom extends Room<GameState> {
  // Allow up to 6 players per room
  maxClients = 6;

  timerInterval!: Delayed;
  taskGenerationInterval!: Delayed;

  // i think
  maxNumRounds = 6;
  numRequiredTasksCompleted = 15;
  roundTimeLimitSecs = 30; // 30s for testing, adjust later

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
      this.startTimer();
      this.gameLoop();
    });

    // Handle stuff once a player finishs a task
    this.onMessage("taskCompleted", (client, taskId: string) => {
      const task = this.state.activeTasks.get(taskId);
      if (!task || task.assignedTo !== client.sessionId || task.completed) {
        console.error("Invalid task completion", taskId, client.sessionId);
        return;
      }
      task.completed = true;
      this.state.tasksDone++;
      // Send it back to the client
      // If want to send to all clients, use this.broadcast()
      client.send("taskCompleted", taskId);
      this.state.activeTasks.delete(taskId);

      if (this.state.tasksDone >= this.numRequiredTasksCompleted) {
        this.startNewRound();
      }
    });

    // Handle stuff once a player fails a task
    this.onMessage("taskFailed", (client, taskId: string) => {
      const task = this.state.activeTasks.get(taskId);
      if (!task || task.assignedTo !== client.sessionId || task.completed) {
        console.error("Invalid task failure", taskId, client.sessionId);
        return;
      }
      this.subtractDataHealth(5);
      this.state.activeTasks.delete(taskId);
    });

    // Send the game over stats to the clients
    this.onMessage("gameOverStats", (client) => {});
  }

  onJoin(client: Client, options: any) {
    const player = new PlayerState();
    player.name = options.name || `Player ${this.clients.length}`;
    this.state.players.set(client.sessionId, player);

    // Set host to be the first player
    if (this.clients.length === 1) this.state.hostId = client.sessionId;

    console.log(client.sessionId, "joined lobby roomId:", this.roomId);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);

    // If host leaves, assign new host
    if (client.sessionId === this.state.hostId && this.clients.length > 0) {
      this.state.hostId = this.clients[0].sessionId;
    }

    console.log(client.sessionId, "left lobby lobby roomId:", this.roomId);
  }

  onDispose() {
    console.log("lobby", this.roomId, "disposing...");
  }

  startTimer() {
    this.state.timer = 0;
    this.clock.start();
    console.log("Timer started!");
  }

  // Technically the game loop
  gameLoop() {
    const TIMER_INTERVAL_MS = 1 * 1000;
    const TASK_GENERATION_INTERVAL_MS = 5 * 1000;

    // Keep track of the current round's timer
    this.timerInterval = this.clock.setInterval(() => {
      this.state.timer++;
      if (this.state.timer === this.roundTimeLimitSecs) {
        this.startNewRound();
      }
    }, TIMER_INTERVAL_MS);

    console.log("timer outside of interval", this.state.timer);

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

  subtractDataHealth(healthDiff: number) {
    this.state.dataHealth -= healthDiff;
    if (this.state.dataHealth <= 0) {
      this.endGame();
    }
  }

  startNewRound() {
    this.state.round++;
    this.state.tasksDone = 0;
    this.state.timer = 0;
    if (this.state.round > this.maxNumRounds) {
      this.endGame();
    }
  }

  // Randomly select a task
  // Randomly select a player to assign the task to
  // Set the time limit for the task
  // Add the task to the list of tasks
  createNewTask() {
    const taskTypes = Object.values(Tasks).filter((t) => typeof t === "number");
    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)] as Tasks;

    const playerIds = Array.from(this.state.players.keys());
    const randomPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];

    const task = new TaskState();
    task.id = Math.random().toString(36).substring(2, 9);
    task.type = Tasks[taskType];
    task.assignedTo = randomPlayerId;
    task.timeCreated = this.clock.currentTime;
    task.timeLimit = 30; // Can be adjusted as players get further in the rounds

    this.state.activeTasks.set(task.id, task);
    return task;
  }

  endGame() {
    this.state.isGameOver = true;
    this.broadcast("gameOver");

    // Clear intervals
    this.timerInterval?.clear();
    this.taskGenerationInterval?.clear();

    this.clock.stop();
    this.state.activeTasks.clear();
  }

  // Generates a random, unique 6-character room code
  generateRoomCode(): string {
    const numChars = 6;
    return Math.random().toString(36).substring(2, numChars).toUpperCase();
  }
}
