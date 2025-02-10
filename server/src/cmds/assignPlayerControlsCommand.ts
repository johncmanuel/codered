import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { shuffleArray } from "../utils";
import { TaskToControls } from "../CodeRedState";

export class AssignPlayerControlsCommand extends Command<CodeRedRoom> {
  execute() {
    // if there are already controls, clear it
    if (this.room.lobbyControls.size > 0) {
      console.log("Clearing controls for this round");
      this.room.lobbyControls.clear();
    }
    const controls = Array.from(TaskToControls.values());
    if (controls.length < this.state.players.size) {
      console.warn("there are more players than controls");
    }
    const shuffledControls = shuffleArray(controls);
    const controlsPerPlayer = Math.floor(shuffledControls.length / this.state.players.size);
    const remainingControls = shuffledControls.length % this.state.players.size;
    let index = 0;

    console.log("Assigning controls to players");

    // Ensure 1 type of each control exists and each player receives a fair amount of controls
    // It might be better to send the controls individually to each player, idk
    this.state.players.forEach((player, playerId) => {
      const controlsToAssign = controlsPerPlayer + (index < remainingControls ? 1 : 0);
      // const client = this.room.clients.find((c) => c.sessionId === playerId);
      // if (!client) {
      //   console.error("Client not found for player", playerId);
      // }
      for (let i = 0; i < controlsToAssign; i++) {
        if (shuffledControls.length > 0) {
          const control = shuffledControls.shift()!;
          player.controls.push(control);
          if (!this.room.lobbyControls.has(control)) this.room.lobbyControls.add(control);
        } else {
          console.error("Not enough controls to assign to all players.");
        }
        console.log("Player", player.name, "assigned control", player.controls[i]);
      }
      // client.send("controls", player.controls);'
      this.room.lobbyControlsByPlayer.set(playerId, player.controls);
      index++;
    });
  }
}
