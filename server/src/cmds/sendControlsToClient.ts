import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { Client } from "colyseus";

export class SendControlsToClient extends Command<CodeRedRoom, { client: Client }> {
  execute({ client } = this.payload) {
    const playerId = client.sessionId;
    const controls = this.room.lobbyControlsByPlayer.get(playerId)!;
    const controlsArr = new Array<string>();
    if (!controls) {
      console.error("Player", playerId, "does not have any controls assigned to them.");
      console.log("controls", controls);
      return;
    }
    controls.forEach((control) => {
      controlsArr.push(control);
    });
    console.log("Sending controls to player", playerId, controlsArr);
    client.send("controls", controlsArr);
    // then send tasks? if sync issues still exist
  }
}
