import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { Client } from "colyseus";
import { type TaskCompletedData } from "../CodeRedState";

export class OnTaskCompletionCommand extends Command<
  CodeRedRoom,
  { client: Client; taskId: string }
> {
  validate({ client, taskId } = this.payload) {
    return this.state.activeTasks.has(taskId);
  }
  execute({ client, taskId } = this.payload) {
    const task = this.room.actualTasks.find((t) => t.id === taskId);

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

    const data: TaskCompletedData = {
      taskId: taskId,
    };

    this.state.activeTasks.delete(taskId);
    this.room.actualTasks = this.room.actualTasks.filter((t) => t.id !== taskId);
    playerClientWithTask.send("taskCompleted", data);
    this.state.tasksDone++;
    this.state.totalTasksDone++;

    console.log("Task completed by", client.sessionId, "Task type:", task.type);
    console.log("Player that task", task.type, "was assigned to:", playerClientWithTask.sessionId);
    console.log("Tasks done:", this.state.tasksDone, "/", this.room.numTotalTasksRequiredPerRound);
  }
}
