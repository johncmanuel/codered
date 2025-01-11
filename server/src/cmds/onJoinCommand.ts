import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { PlayerState } from "../CodeRedState";

export class OnJoinCommand extends Command<
  CodeRedRoom,
  { sessionId: string; clientsLength: number; roomId: string; options: any }
> {
  // @ts-ignore: ignore weird typing errors here
  execute({ sessionId, clientsLength, options, roomId }) {
    const player = new PlayerState();
    player.name = options.name || `Player ${clientsLength}`;
    this.state.players.set(sessionId, player);

    // Set host to be the first player
    if (clientsLength === 1) this.state.hostId = sessionId;

    console.log(sessionId, "joined lobby roomId:", roomId);
  }
}
