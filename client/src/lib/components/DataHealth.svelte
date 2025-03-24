<script lang="ts">
  export let health: number;
  export let hideInfo: boolean;
</script>

<div class="health">
  {#if hideInfo}
    <span>Health status: {health}%</span>
  {:else}
    <span>Health status: Time: ERROR! FAILED TO RETRIEVE HEALTH STATUS, PLEASE WAIT FOR A FIX!</span
    >
  {/if}
</div>
