import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { EndGameCommand } from "./endGameCommand";
import { AssignPlayerControlsCommand } from "./assignPlayerControlsCommand";

export class StartNewRoundCommand extends Command<CodeRedRoom> {
  execute() {
    if (this.state.round >= this.room.maxNumRounds) {
      return [new EndGameCommand()];
    }
    this.state.round++;
    console.log("Starting new round", this.state.round);
    this.state.tasksDone = 0;
    this.state.timer = this.room.roundTimeLimitSecs;
    this.state.activeTasks.clear();
    this.room.lobbyControls.clear();
    this.room.lobbyControlsByPlayer.clear();
    this.state.players.forEach((player) => {
      player.controls.clear();
      player.activeTaskId = null;
      player.numTasksTodo = this.room.baseTasksPerPlayer;
    });
    this.room.dispatcher.dispatch(new AssignPlayerControlsCommand());
    this.room.tasksArrCurrRound = this.room.batchCreateTasks(
      this.room.numTotalTasksRequiredPerRound,
    );
    this.room.assignInitialTasks();
  }
}
