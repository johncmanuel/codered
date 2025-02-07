import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { EndGameCommand } from "./endGameCommand";

export class StartNewRoundCommand extends Command<CodeRedRoom> {
  execute() {
    console.log("Starting new round");
    this.state.round++;
    this.state.tasksDone = 0;
    this.state.timer = this.room.roundTimeLimitSecs;
    this.state.activeTasks.clear();
    if (this.state.round > this.room.maxNumRounds) {
      return [new EndGameCommand()];
    }
  }
}
