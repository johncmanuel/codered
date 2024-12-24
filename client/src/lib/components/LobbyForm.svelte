<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let isJoining = false;
  
  const dispatch = createEventDispatcher<{
    submit: { name: string; code?: string };
  }>();
  
  let playerName = '';
  let joinCode = '';
  
  function handleSubmit() {
    dispatch('submit', {
      name: playerName,
      ...(isJoining ? { code: joinCode } : {})
    });
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input
    type="text"
    bind:value={playerName}
    placeholder="Enter your name"
    required
  />
  
  {#if isJoining}
    <input
      type="text"
      bind:value={joinCode}
      placeholder="Enter lobby code"
      required
    />
  {/if}
  
  <button type="submit">
    {isJoining ? 'Join Lobby' : 'Create Lobby'}
  </button>
</form>
