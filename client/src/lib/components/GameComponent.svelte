<script lang="ts">
  import PhaserGame, { type TPhaserRef } from "@/game/PhaserGame.svelte";
  import { gameStore, type GameStore } from "@/game/stores/gameStore";
  import { EventBus } from "@/game/EventBus";
  import { Scene } from "phaser";
  import PlayerList from "./PlayerList.svelte";
  import { onMount, onDestroy } from "svelte";
  import Timer from "./Timer.svelte";
  import DataHealth from "./DataHealth.svelte";

  let phaserRef: TPhaserRef = { game: null, scene: null };

  // Variables for showing UI changes
  $: timer = $gameStore.room?.state.timer ?? 0;
  $: health = $gameStore.room?.state.dataHealth ?? 100;
  $: currRound = $gameStore.room?.state.round ?? 0;

  onMount(() => {
    // EventBus.emit("test", $gameStore);
  });

  onDestroy(() => {
    EventBus.off("updateTimer");
  });

  // Do stuff once scene is ready to go from the Phaser side
  const onCurrentActiveScene = (scene: Scene) => {
    console.log("onCurrentActiveScene triggered");
    EventBus.emit("test", $gameStore);
    setupEventBusListeners();
  };

  // Listen for events from the Phaser side
  function setupEventBusListeners() {
    EventBus.on("updateTimer", (newTimer: number) => {
      timer = newTimer;
    });
    EventBus.on("updateHealth", (newHealth: number) => {
      health = newHealth;
    });
  }
</script>

<div id="app">
  {#if $gameStore.room}
    <Timer {timer} />
    <PlayerList players={$gameStore.players} currentPlayerId={$gameStore.room.sessionId} />
    <DataHealth {health} />
    <PhaserGame bind:phaserRef currentActiveScene={onCurrentActiveScene} />
  {/if}
</div>
