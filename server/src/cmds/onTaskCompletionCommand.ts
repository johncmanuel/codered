import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { Client } from "colyseus";
import { StartNewRoundCommand } from "./startNewRoundCommand";

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

    this.room.clients.forEach((client) => {
      const player = this.room.state.players.get(client.sessionId);
      if (player.activeTaskId === taskId) {
        this.room.state.players.get(client.sessionId).activeTaskId = null;
        return;
      }
    });

    this.state.activeTasks.delete(taskId);

    console.log("Task completed by", client.sessionId, "Task ID:", taskId);

    if (this.state.tasksDone >= this.room.numRequiredTasksCompleted) {
      return [new StartNewRoundCommand()];
    }
  }
}
