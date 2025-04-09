import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { shuffleArray } from "../utils";
import { TaskToControls } from "../CodeRedState";

export const MAX_CONTROLS_PER_PLAYER = 5;

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
    let controlsPerPlayer = Math.min(
      Math.floor(shuffledControls.length / this.state.players.size),
      MAX_CONTROLS_PER_PLAYER,
    );
    // const remainingControls = shuffledControls.length % this.state.players.size;
    let remainingControls = shuffledControls.length - controlsPerPlayer * this.state.players.size;
    let index = 0;

    console.log("Assigning controls to players, number of controls", controlsPerPlayer);

    // Ensure 1 type of each control exists and each player receives a fair amount of controls
    // It might be better to send the controls individually to each player, idk
    this.state.players.forEach((player, playerId) => {
      // const controlsToAssign = controlsPerPlayer + (index < remainingControls ? 1 : 0);
      let controlsToAssign = controlsPerPlayer;
      if (remainingControls > 0 && controlsToAssign < MAX_CONTROLS_PER_PLAYER) {
        controlsToAssign++;
        remainingControls--;
      }
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
