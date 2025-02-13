import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { TaskState } from "../CodeRedState";

export class AssignTaskToRandomPlayerCommand extends Command<CodeRedRoom, { task: TaskState }> {
  execute({ task } = this.payload) {
    const playersWithoutActiveTasks = Array.from(this.state.players.entries())
      .filter(([sessionId, player]) => player.activeTaskId === null)
      .map(([sessionId, player]) => ({ sessionId, player }));

    if (playersWithoutActiveTasks.length === 0) {
      console.log("No players available to assign task to");
      return;
    }

    const randomPlayerEntry =
      playersWithoutActiveTasks[Math.floor(Math.random() * playersWithoutActiveTasks.length)];
    if (!randomPlayerEntry) {
      console.error("No player found to assign task to.");
      return;
    }

    const { sessionId, player: randomPlayer } = randomPlayerEntry;
    const playerClient = this.room.clients.find((c) => c.sessionId === sessionId);

    if (!playerClient) {
      console.error("Client not found for player with sessionId:", sessionId);
      return;
    }

    this.state.players.get(sessionId)!.activeTaskId = task.id;
    this.state.activeTasks.set(task.id, task);

    // send the assigned task to the player
    // remember: they won't know if they have the task or not,
    // so other players will have to verbally tell them if they're
    // sent one.
    playerClient.send("newTask", task);
    this.room.actualTasks.push(task);

    console.log("Task sent to player:", sessionId, "task type:", task.type);
  }
}
