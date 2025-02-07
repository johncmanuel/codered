import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
// import { EndGameCommand } from "./endGameCommand";
import { AssignPlayerControlsCommand } from "./assignPlayerControlsCommand";

export class StartNewRoundCommand extends Command<CodeRedRoom> {
  execute() {
    this.state.round++;
    console.log("Starting new round", this.state.round);
    this.state.tasksDone = 0;
    this.state.timer = this.room.roundTimeLimitSecs;
    this.state.activeTasks.clear();
    this.room.lobbyControls.clear();
    this.state.players.forEach((player) => {
      player.controls.clear();
    });
    this.room.dispatcher.dispatch(new AssignPlayerControlsCommand());
    // if (this.state.round > this.room.maxNumRounds) {
    //   return [new EndGameCommand()];
    // }
  }
}
