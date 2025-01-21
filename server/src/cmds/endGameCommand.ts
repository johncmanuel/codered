import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";

export class EndGameCommand extends Command<CodeRedRoom> {
  execute() {
    this.state.isGameOver = true;
    this.room.broadcast("gameOver");

    // Clear intervals
    this.room.timerInterval?.clear();
    this.room.taskGenerationInterval?.clear();

    this.clock.stop();
    this.state.activeTasks.clear();
  }
}
