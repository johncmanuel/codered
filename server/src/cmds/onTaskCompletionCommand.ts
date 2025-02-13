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
    return this.state.activeTasks.has(taskId);
  }
  execute({ client, taskId } = this.payload) {
    const task = this.room.actualTasks.find((t) => t.id === taskId);
    this.state.tasksDone++;

    let playerClientWithTask: Client = null;

    // set activeTaskId to null for player who was assigned that task
    this.state.players.forEach((player, sessionId) => {
      if (player.activeTaskId === taskId) {
        player.activeTaskId = null;
        playerClientWithTask = this.room.clients.find((c) => c.sessionId === sessionId);
        return;
      }
    });

    if (!playerClientWithTask) {
      console.error("Client not found for player with task ID:", taskId);
      return;
    }

    this.state.activeTasks.delete(taskId);
    this.room.actualTasks = this.room.actualTasks.filter((t) => t.id !== taskId);

    console.log("Task completed by", client.sessionId, "Task type:", task.type);
    console.log("Player that task", task.type, "was assigned to:", playerClientWithTask.sessionId);
    console.log(
      "Tasks done:",
      this.state.tasksDone,
      "/",
      this.room.numRequiredTasksCompletedPerRound,
    );

    // assign new task to player who was assigned that task
    if (this.room.tasksArrCurrRound.length > 0) {
      console.log("begin to assign new task to player with task ", task.type);
      const newTask = this.room.tasksArrCurrRound.shift()!;
      this.room.dispatcher.dispatch(new AssignTaskToPlayerCommand(), {
        client: playerClientWithTask,
        task: newTask,
      });
    } else {
      console.error("No more tasks to assign!", this.room.tasksArrCurrRound, this.room.actualTasks);
    }

    if (this.state.tasksDone >= this.room.numRequiredTasksCompletedPerRound) {
      return [new StartNewRoundCommand()];
    }
  }
}
