import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { shuffleArray } from "../utils";
import { TaskToControls } from "../CodeRedState";

export class AssignPlayerControlsCommand extends Command<CodeRedRoom> {
  execute() {
    const controls = Array.from(TaskToControls.values());
    if (controls.length < this.state.players.size) {
      console.warn("there are more players than controls");
    }
    const shuffledControls = shuffleArray(controls);
    const controlsPerPlayer = Math.floor(shuffledControls.length / this.state.players.size);
    const remainingControls = shuffledControls.length % this.state.players.size;
    let index = 0;

    // Ensure 1 type of each control exists and each player receives a fair amount of controls
    this.state.players.forEach((player) => {
      const controlsToAssign = controlsPerPlayer + (index < remainingControls ? 1 : 0);
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
      index++;
    });
  }
}
