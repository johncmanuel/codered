<script lang="ts">
  import PhaserGame, { type TPhaserRef } from "@/game/PhaserGame.svelte";
  import { gameStore, type GameStore } from "@/game/stores/gameStore";
  import { EventBus } from "@/game/EventBus";
  import { Scene } from "phaser";
  import PlayerList from "./PlayerList.svelte";
  import { onMount } from "svelte";
  let phaserRef: TPhaserRef = { game: null, scene: null };

  onMount(() => {
    console.log("emitting test event");
    EventBus.emit("test", $gameStore);
  });

  const onCurrentActiveScene = (scene: Scene) => {
    console.log("onCurrentActiveScene triggered");
    // EventBus.emit("test", $gameStore);
  };
</script>

<div id="app">
  {#if $gameStore.room}
    <PlayerList players={$gameStore.players} currentPlayerId={$gameStore.room.sessionId} />
    <PhaserGame bind:phaserRef currentActiveScene={onCurrentActiveScene} />
  {/if}
</div>
