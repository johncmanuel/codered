<script lang="ts">
  import type { Player } from "@/game/types/room";

  export let players: Player[];
  export let onStart: () => void;
</script>

<style>
  .host-controls {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .start-button {
    padding: 10px 20px;
    font-size: 24px;
    font-family: 'Audiowide', sans-serif;
    border: none;
    border-radius: 10px;
    background-color: #222222;
    color: white;
    cursor: pointer;
  }

  .start-button:hover {
    background-color: #333333;
  }
</style>
<div class="host-controls">
  <button class="start-button" on:click={onStart}> Start Game </button>
</div>

