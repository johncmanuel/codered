import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { Client } from "colyseus";
import { SubtractHealthCommand } from "./subtractHealthCommand";

// haven't tested this yet lol
export class OnTaskFailureCommand extends Command<
  CodeRedRoom,
  { client: Client; taskId: string; healthDiff: number }
> {
  validate({ client, taskId } = this.payload) {
    return (
      this.state.activeTasks.has(taskId) && !this.state.activeTasks.get(taskId).completed //&&
      // client.sessionId === this.state.activeTasks.get(taskId).assignedTo
    );
  }

  execute({ client, taskId, healthDiff } = this.payload) {
    this.state.activeTasks.delete(taskId);
    return [
      new SubtractHealthCommand().setPayload({
        healthDiff,
      }),
    ];
  }
}
