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
  import { taskStore } from "@/game/stores/taskStore";
  import { type IRoundTimer, type IDataHealth } from "@/game/types/eventBusTypes";

  let phaserRef: TPhaserRef = { game: null, scene: null };

  $: timer = $gameStore.room?.state.timer ?? 0;
  $: hideInfo = false;
  $: health = $gameStore.room?.state.dataHealth ?? 100;
  $: currRound = $gameStore.room?.state.round ?? 0;
  $: maxRounds = 6; // TODO: hard code for now, get it from server later

  onDestroy(() => {
    EventBus.off("updateTimer");
    EventBus.off("updateHealth");
    EventBus.off("updateRound");
    EventBus.off("newTask");
    EventBus.off("test");
    if (phaserRef.scene?.scene.isActive) {
      phaserRef.scene?.scene.stop();
    }
  });

  // Do stuff once scene is ready to go from the Phaser side
  const onCurrentActiveScene = (scene: Scene) => {
    console.log("onCurrentActiveScene triggered");

    // EventBus.emit("test", $gameStore);
    if ($gameStore && $gameStore.room) {
      console.log("Emitting gameStore to Phaser:", $gameStore);
      EventBus.emit("test", $gameStore);
    } else {
      console.error("Invalid gameStore state:", $gameStore);
    }

    setupEventBusListeners();
  };

  // Listen for events from the Phaser side
  function setupEventBusListeners() {
    EventBus.on("updateTimer", (roundTimer: IRoundTimer) => {
      timer = roundTimer.timer;
      hideInfo = roundTimer.hideInfo;
    });
    EventBus.on("updateHealth", (dataHealth: IDataHealth) => {
      health = dataHealth.health;
      hideInfo = dataHealth.hideInfo;
    });
    EventBus.on("updateRound", (newRound: number) => {
      currRound = newRound;
    });
    EventBus.on("newTask", (task: TaskState) => {
      taskStore.addTask(task.id, task);
    });
    EventBus.on("taskCompleted", (task: TaskState) => {
      taskStore.deleteTask(task.id);
    });
  }
</script>

<div id="app">
  {#if $gameStore.room}
    <PlayerList players={$gameStore.players} currentPlayerId={$gameStore.room.sessionId} />
    <Timer {timer} {hideInfo} />
    <DataHealth {health} {hideInfo} />
    <CurrentRound currentRound={currRound} {maxRounds} />
    <PhaserGame bind:phaserRef currentActiveScene={onCurrentActiveScene} />
  {/if}
</div>
