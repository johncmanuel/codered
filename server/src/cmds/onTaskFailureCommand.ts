import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { Client } from "colyseus";
import { SubtractHealthCommand } from "./subtractHealthCommand";

export class OnTaskFailureCommand extends Command<
  CodeRedRoom,
  { client: Client; taskId: string; healthDiff: number }
> {
  validate({ client, taskId } = this.payload) {
    return this.state.activeTasks.has(taskId) && !this.state.activeTasks.get(taskId).completed;
  }

  execute({ client, taskId, healthDiff } = this.payload) {
    this.room.clients.forEach((client) => {
      const player = this.room.state.players.get(client.sessionId);
      if (player.activeTaskId === taskId) {
        this.room.state.players.get(client.sessionId).activeTaskId = null;
        return;
      }
    });

    this.state.activeTasks.delete(taskId);
    return [
      new SubtractHealthCommand().setPayload({
        healthDiff,
      }),
    ];
  }
}
