import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";

export class EndGameCommand extends Command<CodeRedRoom> {
  execute() {
    console.log("Game over");
    this.state.isGameOver = true;
    this.room.broadcast("gameOver");

    this.room.gameInterval?.clear();
    // this.room.taskSendInterval?.clear();

    this.clock.stop();
    this.state.activeTasks.clear();
  }
}
