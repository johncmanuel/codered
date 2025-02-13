import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { TaskState } from "../CodeRedState";
import { Client } from "colyseus";

export class AssignTaskToPlayerCommand extends Command<
  CodeRedRoom,
  { client: Client; task: TaskState }
> {
  execute({ client, task } = this.payload) {
    const player = this.state.players.get(client.sessionId);

    if (!player) {
      console.error("Player not found for sessionId:", client.sessionId);
      return;
    }

    if (player.activeTaskId !== null) {
      console.warn("Player already has an active task:", client.sessionId);
      return;
    }

    player.activeTaskId = task.id;
    this.state.activeTasks.set(task.id, task);
    this.room.actualTasks.push(task);

    client.send("newTask", task);

    console.log("Task assigned to player:", client.sessionId, "task type:", task.type);
  }
}
