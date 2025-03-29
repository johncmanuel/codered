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
    console.log("Health subtracted by", healthDiff, "New health:", this.room.state.dataHealth);
    if (this.room.state.dataHealth <= 0) {
      return [new EndGameCommand()];
    }
  }
}
