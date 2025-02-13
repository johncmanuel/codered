import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { Client } from "colyseus";
import { StartNewRoundCommand } from "./startNewRoundCommand";
import { AssignTaskToPlayerCommand } from "./assignTaskToPlayer";

export class OnTaskCompletionCommand extends Command<
  CodeRedRoom,
  { client: Client; taskId: string }
> {
  validate({ client, taskId } = this.payload) {
    return this.state.activeTasks.has(taskId) && !this.state.activeTasks.get(taskId).completed;
  }
  execute({ client, taskId } = this.payload) {
    const task = this.state.activeTasks.get(taskId);
    task.completed = true;
    this.state.tasksDone++;

    let playerClientWithTask: Client = null;

    // set activeTaskId to null for player who was assigned that task
    this.room.clients.forEach((client) => {
      const player = this.room.state.players.get(client.sessionId);
      if (player.activeTaskId === taskId) {
        this.room.state.players.get(client.sessionId).activeTaskId = null;
        playerClientWithTask = client;
        return;
      }
    });

    if (!playerClientWithTask) {
      console.error("Client not found for player with task ID:", taskId);
      return;
    }

    this.state.activeTasks.delete(taskId);
    this.room.actualTasks = this.room.actualTasks.filter((t) => t.id !== taskId);

    console.log("Task completed by", client.sessionId, "Task ID:", taskId);
    console.log(
      "Tasks done:",
      this.state.tasksDone,
      "/",
      this.room.numRequiredTasksCompletedPerRound,
    );

    // assign new task to player who was assigned that task
    if (this.room.tasksArrCurrRound.length > 0) {
      const newTask = this.room.tasksArrCurrRound.shift()!;
      this.room.dispatcher.dispatch(new AssignTaskToPlayerCommand(), {
        client: playerClientWithTask,
        task: newTask,
      });
    }

    if (this.state.tasksDone >= this.room.numRequiredTasksCompletedPerRound) {
      return [new StartNewRoundCommand()];
    }
  }
}
