import { Command } from "@colyseus/command";
import { CodeRedRoom } from "../Game";
import { Tasks, TaskState, MULTIPLAYER_TASKS } from "../CodeRedState";
import { Client } from "colyseus";

export class AssignTaskToPlayerCommand extends Command<
  CodeRedRoom,
  { client: Client; task: TaskState }
> {
  execute({ client, task } = this.payload) {
    const player = this.state.players.get(client.sessionId);
    console.log("running AssignTaskToPlayerCommand for player:", client.sessionId, player.name);

    // if player not found or active task id still not null, send the task back into the task queue

    if (!player) {
      console.error("Player not found for sessionId:", client.sessionId);
      this.room.tasksArrCurrRound.push(task);
      return;
    }

    if (player.activeTaskId !== null) {
      console.warn("Player already has an active task:", client.sessionId);
      console.log("Player activeTaskId:", player.activeTaskId, "task:", task.id);
      this.room.tasksArrCurrRound.push(task);
      return;
    }

    player.activeTaskId = task.id;
    this.state.activeTasks.set(task.id, task);
    this.room.actualTasks.push(task);

    // this.room.lobbyControlsByPlayer.forEach((ctrls, playerId) => {
    //   console.log("Player", playerId, "controls:", ctrls);
    // });
    //
    // Track players assigned to multiplayer tasks, this will be used to keep them in sync
    if (MULTIPLAYER_TASKS.has(Tasks[task.type as keyof typeof Tasks])) {
      console.log("Multiplayer task assigned:", task.type);
      if (this.room.multiplayerTasksByPlayers.has(task.id)) {
        console.warn("Multiplayer task already has players assigned:", task.id);
      }
      // get assigned player and player with appropiate controls
      // if the assigned player and player with controls are same, assign a random player not yet part of the players array to help them out
      // with this task
      const players: Array<string> = [client.sessionId];
      this.room.lobbyControlsByPlayer.forEach((ctrls, playerId) => {
        const ctrlsSet = new Set();
        ctrls.forEach((ctrl) => ctrlsSet.add(ctrl));
        // if player already part of the players arr and has the same controls, assign a random player
        if (players.includes(playerId) && ctrls.includes(task.control)) {
          const availablePlayers = Array.from(this.state.players.keys()).filter(
            (id) => !players.includes(id),
          );
          if (availablePlayers.length > 0) {
            const randomPlayerId =
              availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
            players.push(randomPlayerId);
          }
        } else {
          if (ctrlsSet.has(task.control)) {
            players.push(playerId);
          }
        }
      });
      console.log("Players assigned to multiplayer task:", players);
      this.room.multiplayerTasksByPlayers.set(task.id, players);
    }

    client.send("newTask", task);

    console.log("Task assigned to player:", client.sessionId, "task type:", task.type);
  }
}
