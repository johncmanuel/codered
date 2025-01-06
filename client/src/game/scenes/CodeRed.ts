import { Scene } from "phaser";
import { EventBus } from "../EventBus";
// import { Room } from "colyseus.js";
import { type GameStore } from "../stores/gameStore";
import { GameState } from "../types/room";

// Order of execution in scene: init, preload, create, update
// update runs continuously
export class CodeRed extends Scene {
  // btw this is temporary, we wouldn't need to track this much data
  gameStore: GameStore;
  //
  // Variables that must be shared with Colyseus and UI in Svelte
  gameState: GameState;

  constructor() {
    super("Game");
  }

  init() {
    console.log("Initializing");
    this.gameState = new GameState();
  }

  // Load all assets here first and other stuff
  preload() {
    console.log("Preloading");
  }

  create() {
    console.log("Creating");
    EventBus.on("test", (gameStore: GameStore) => {
      console.log("From Svelte", gameStore);
      this.gameStore = gameStore;
      if (!this.gameStore) {
        throw new Error("No game store");
      }
      this.createServerListeners();
      this.createEventBusListeners();
      console.log("sending updateTimer to colysues");
      this.gameStore.room?.send("startTimer");
    });
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

  // Set up event listeners between Svelte and Phaser
  // This helps send any important events or changes to the UI (Svelte) so players can see them
  createEventBusListeners() {
    console.log("Event bus listeners created");
  }

  // Set up listeners for Colyseus messages
  //https://docs.colyseus.io/state/schema-callbacks/#schema-callbacks
  createServerListeners() {
    if (!this.gameStore) {
      throw new Error("No game store");
    }

    this.gameStore.room?.onMessage("updateTimer", (timer: number) => {
      console.log("Timer updated", timer);
      EventBus.emit("updateTimer", timer);
    });

    // Called when the room state has been updated in Colyseus
    // this.gameStore.room?.onStateChange((state) => {
    //   this.gameState = state;
    //   EventBus.emit("updateTimer", state.timer);
    //   // console.log("State changed", state);
    // });
  }
}
