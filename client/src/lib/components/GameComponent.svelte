<script lang="ts">
  import PhaserGame, { type TPhaserRef } from "@/game/PhaserGame.svelte";
  import { gameStore } from "@/game/stores/gameStore";
  import { EventBus } from "@/game/EventBus";
  import { Scene } from "phaser";
  import PlayerList from "./PlayerList.svelte";
  import { onDestroy } from "svelte";
  import Timer from "./Timer.svelte";
  import DataHealth from "./DataHealth.svelte";
  import CurrentRound from "./CurrentRound.svelte";
  import { type TaskState } from "@/game/types/room";
  import DebugTaskButtons from "./DebugTaskButtons.svelte";

  let phaserRef: TPhaserRef = { game: null, scene: null };

  // Variables for showing UI changes
  $: timer = $gameStore.room?.state.timer ?? 0;
  $: health = $gameStore.room?.state.dataHealth ?? 100;
  $: currRound = $gameStore.room?.state.round ?? 0;
  $: maxRounds = 6; // hard code for now, get it from server later
  $: currentTasks = new Map<string, TaskState>();

  onDestroy(() => {
    EventBus.off("updateTimer");
    EventBus.off("updateHealth");
    EventBus.off("updateRound");
    EventBus.off("newTask");
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
    EventBus.on("updateRound", (newRound: number) => {
      currRound = newRound;
    });
    EventBus.on("newTask", (task: TaskState) => {
      currentTasks.set(task.id, task);
      currentTasks = currentTasks;
    });
    EventBus.on("taskCompleted", (task: TaskState) => {
      currentTasks.delete(task.id);
      currentTasks = currentTasks;
    });
  }
</script>

<div id="app">
  {#if $gameStore.room}
    <Timer {timer} />
    <PlayerList players={$gameStore.players} currentPlayerId={$gameStore.room.sessionId} />
    <DataHealth {health} />
    <CurrentRound currentRound={currRound} {maxRounds} />
    <!-- Display debug buttons for each active task -->
    {#each Array.from(currentTasks.values()) as task}
      <DebugTaskButtons {task} />
    {/each}
    <PhaserGame bind:phaserRef currentActiveScene={onCurrentActiveScene} />
  {/if}
</div>
