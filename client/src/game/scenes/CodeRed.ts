import { Scene } from "phaser";
import { EventBus } from "../EventBus";
// import { Room } from "colyseus.js";
import { type GameStore } from "../stores/gameStore";

export class CodeRed extends Scene {
  gameStore: GameStore;

  constructor() {
    super("Game");
  }

  // Order of execution: init, preload, create, update
  // Update runs continuously

  init() {
    console.log("Game scene initialized");
  }

  preload() {
    // Load all assets here first!!!!
  }

  create() {
    EventBus.on("test", (gameStore: GameStore) => {
      console.log("what");
      console.log("From Phaser", gameStore);
    });
    EventBus.emit("current-scene-ready", this);
  }

  update() {}
}
