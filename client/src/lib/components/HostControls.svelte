<script lang="ts">
  import type { Player } from "@/game/types/room";

  export let players: Player[];
  export let onStart: () => void;
</script>

<div class="host-controls">
  <button class="start-button" on:click={onStart}> Start Game </button>
</div>

<style>
  .host-controls {
    display: flex;
    justify-content: left;
    margin-top: 20px;
    margin-left: 100px;
  }

  .start-button {
    padding: 10px 20px;
    font-size: 24px;
    font-family: "Audiowide", sans-serif;
    border: none;
    border-radius: 10px;
    background-color: #222222;
    color: white;
    cursor: pointer;
  }

  .start-button:hover {
    background-color: rgb(190, 10, 10);
  }
</style>
