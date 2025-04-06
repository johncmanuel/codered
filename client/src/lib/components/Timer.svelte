<script lang="ts">
  export let timer: number;
  export let hideInfo: boolean;

  function formatTimer(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
</script>

<div class="timer">
  {#if hideInfo}
    <span>Time: ERROR! FAILED TO RETRIEVE TIMER STATUS, PLEASE WAIT FOR A FIX!</span>
  {:else}
    <span>Time: {formatTimer(timer)}</span>
  {/if}
</div>
