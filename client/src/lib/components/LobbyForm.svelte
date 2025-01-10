<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let isJoining = false;

  const dispatch = createEventDispatcher<{
    submit: { name: string; code?: string };
  }>();

  let playerName = "";
  let joinCode = "";

  function handleSubmit() {
    dispatch("submit", {
      name: playerName,
      ...(isJoining ? { code: joinCode } : {}),
    });
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');

  body {
    margin: 0;
    padding: 0;
    font-family: 'Audiowide', sans-serif;
    color: rgb(83, 54, 54);
    height: 100vh; 
    display: flex;
    justify-content: center;
    align-items: center;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Audiowide', sans-serif;
  }

  input {
    margin: 10px 0;
    padding: 10px;
    font-size: 24px;
    font-family: 'Audiowide', sans-serif;
    border: none;
    border-radius: 10px;
    background-color: #222222;
    color: white;
    outline: none;
    width: 250px;
    text-align: center;
  }

  input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  button {
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 24px;
    font-family: 'Audiowide', sans-serif;
    border: none;
    border-radius: 5px;
    background-color: #222222;
    color: rgb(223, 223, 223);
    cursor: pointer;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: rgb(190, 10, 10);
  }
</style>

<form on:submit|preventDefault={handleSubmit}>
  <input type="text" bind:value={playerName} placeholder="Enter your name" required />

  {#if isJoining}
    <input type="text" bind:value={joinCode} placeholder="Enter lobby code" required />
  {/if}

  <button type="submit">
    {isJoining ? "Join Lobby" : "Create Lobby"}
  </button>
</form>
