<script lang="ts">
  import type { Player } from "@/game/types/room";

  export let players: Player[];
  export let currentPlayerId: string;
</script>
<style>
  .player-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Audiowide', sans-serif;
  }

  .player {
    margin: 10px 0;
    padding: 10px;
    font-size: 24px;
    font-family: 'Audiowide', sans-serif;
    border: none;
    border-radius: 10px;
    background-color: #222222;
    color: white;
    width: 250px;
    text-align: center;
  }
</style>
<div class="player-list">
  <span style="font-size: 30px;">Player Count: {players.length}</span>
  {#each players as player}
    <div class="player">
      <span>{player.name}</span>
      {#if player.id === currentPlayerId}
        <span>(You)</span>
      {/if}
    </div>
  {/each}
</div>
