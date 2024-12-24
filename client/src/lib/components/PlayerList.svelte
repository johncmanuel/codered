<script lang="ts">
  import type { Player } from '@/game/types/room';
  
  export let players: Player[];
  export let currentPlayerId: string;
</script>

<div class="player-list">
  {#each players as player}
    <div class="player">
      <span>{player.name}</span>
      {#if player.id === currentPlayerId}
        <span>(You)</span>
      {/if}
    </div>
  {/each}
</div>
