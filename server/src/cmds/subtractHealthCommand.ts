import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { EndGameCommand } from "./endGameCommand";

export class SubtractHealthCommand extends Command<
  CodeRedRoom,
  {
    healthDiff: number;
  }
> {
  execute({ healthDiff } = this.payload) {
    this.room.state.dataHealth -= healthDiff;
    if (this.room.state.dataHealth <= 0) {
      return [new EndGameCommand()];
    }
  }
}
