import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { Room } from "colyseus.js";

export class CodeRed extends Scene {
  room: Room;

  constructor() {
    super("Game");
  }

  // Order of execution: init, preload, create, update
  // Update runs continuously

  init() {}

  preload() {
    // Load all assets here first!!!!
  }

  create() {
    EventBus.emit("current-scene-ready", this);
  }

  update() {}
}
