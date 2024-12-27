<script lang="ts">
  import type { Player } from "@/game/types/room";

  export let players: Player[];
  export let onStart: () => void;
</script>

<div class="host-controls">
  <button class="start-button" on:click={onStart}> Start Game </button>
</div>
