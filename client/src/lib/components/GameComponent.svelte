<script lang="ts">
  import PhaserGame, { type TPhaserRef } from "@/game/PhaserGame.svelte";
  import { gameStore, type GameStore } from "@/game/stores/gameStore";
  import { EventBus } from "@/game/EventBus";
  import { Scene } from "phaser";
  let phaserRef: TPhaserRef = { game: null, scene: null };

  const onCurrentActiveScene = (scene: Scene) => {
    console.log("onCurrentActiveScene", scene);
    EventBus.emit("test", $gameStore);
  };
</script>

<div id="app">
  <PhaserGame bind:phaserRef currentActiveScene={onCurrentActiveScene} />
</div>
