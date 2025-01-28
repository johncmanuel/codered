import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";

export class EndGameCommand extends Command<CodeRedRoom> {
  execute() {
    this.state.isGameOver = true;
    this.room.broadcast("gameOver");

    this.room.timerInterval?.clear();

    this.clock.stop();
    this.state.activeTasks.clear();
  }
}
