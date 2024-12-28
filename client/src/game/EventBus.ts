import { Events } from "phaser";

// Used to emit events between Svelte components and Phaser scenes
// https://github.com/phaserjs/template-svelte?tab=readme-ov-file#svelte-bridge
export const EventBus = new Events.EventEmitter();
