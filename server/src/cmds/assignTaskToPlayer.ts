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
    console.log("running AssignTaskToPlayerCommand for player:", client.sessionId, player.name);

    // if player not found or active task id still not null, send the task back into the task queue

    if (!player) {
      console.error("Player not found for sessionId:", client.sessionId);
      this.room.tasksArrCurrRound.push(task);
      return;
    }

    if (player.activeTaskId !== null) {
      console.warn("Player already has an active task:", client.sessionId);
      console.log("Player activeTaskId:", player.activeTaskId, "task:", task.id);
      this.room.tasksArrCurrRound.push(task);
      return;
    }

    player.activeTaskId = task.id;
    this.state.activeTasks.set(task.id, task);
    this.room.actualTasks.push(task);

    client.send("newTask", task);

    console.log("Task assigned to player:", client.sessionId, "task type:", task.type);
  }
}
