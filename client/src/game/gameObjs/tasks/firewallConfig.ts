import { Task } from "./task";
import { Scene } from "phaser";
import { type GameRoom } from "@/game/types/room";

export class FirewallConfig extends Task {
  constructor(scene: Scene, room: GameRoom, taskId: string) {
    super(scene, room, taskId);
  }

  start() {}

  update() {}
}
