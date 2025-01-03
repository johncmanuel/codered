import { Scene } from "phaser";
import { EventBus } from "../EventBus";
// import { Room } from "colyseus.js";
import { type GameStore } from "../stores/gameStore";
import { type GameState } from "../types/room";

// Order of execution in scene: init, preload, create, update
// update runs continuously
export class CodeRed extends Scene {
  // btw this is temporary, we wouldn't need to track this much data
  gameStore: GameStore;

  // Variables that must be shared with Colyseus and UI in Svelte
  gameState: GameState;

  constructor() {
    super("Game");
  }

  init() {
    console.log("Initializing");
  }

  preload() {
    // Load all assets here first and other stuff
    EventBus.on("test", (gameStore: GameStore) => {
      console.log("Preloading");
      console.log("From Svelte", gameStore);
      this.gameStore = gameStore;
    });
    if (!this.gameStore) {
      console.log("No game store");
    }
    EventBus.on("init", (gameState: GameState) => {
      this.gameState = gameState;
    });
  }

  create() {
    console.log("Creating");
    EventBus.emit("current-scene-ready", this);
  }

  // Gameplay loop (psuedocode)
  // while data health > 0 and current round > 7(?):
  //    assign random task to player A
  //    player A does task or someone else who has controls does it
  //    display task to player A and use Colyseus to let everyone in lobby know player A is doing task
  //    if task completed, increment number of tasks done
  //    if task not completed, decrement health
  //    if number of tasks exceeds 15(?), go to next round
  update() {}
}
