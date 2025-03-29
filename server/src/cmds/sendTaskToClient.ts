import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { Client } from "colyseus";

export class SendTaskToClient extends Command<CodeRedRoom, { client: Client; control: string }> {
  execute({ client, control } = this.payload) {
    const playerId = client.sessionId;
    const playerControls = this.room.lobbyControlsByPlayer.get(playerId);

    // Check if the player has the control
    if (!playerControls || !playerControls.includes(control)) {
      console.log("Player", playerId, "does not have control", control);
      client.send("noTaskForControl", { control });
      return;
    }

    // Find a task that matches the control
    const task = this.room.actualTasks.find((t) => t.control === control);

    if (task) {
      client.send("hasTaskForControl", task);
    } else {
      console.log("No task found for control", control);
      client.send("noTaskForControl", control);
    }
  }
}
