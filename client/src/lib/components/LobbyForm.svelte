<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let isJoining = false;

  const MAX_NAME_LENGTH_CHARS = 10;
  const MIN_NAME_LENGTH_CHARS = 1;
  const MAX_CODE_LENGTH_CHARS = 4;

  const dispatch = createEventDispatcher<{
    submit: { name: string; code?: string };
  }>();

  let playerName = "";
  let joinCode = "";

  function handleSubmit() {
    // if people somehow bypass the max length set in the form,
    // trim the input
    const trimmedName = playerName.slice(0, MAX_NAME_LENGTH_CHARS);
    const trimmedCode = joinCode.slice(0, MAX_CODE_LENGTH_CHARS);
    dispatch("submit", {
      name: trimmedName,
      ...(isJoining ? { code: trimmedCode } : {}),
    });
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input
    type="text"
    bind:value={playerName}
    placeholder="Enter your name"
    required
    minlength={MIN_NAME_LENGTH_CHARS}
    maxlength={MAX_NAME_LENGTH_CHARS}
  />

  {#if isJoining}
    <input
      type="text"
      bind:value={joinCode}
      placeholder="Enter lobby code"
      required
      maxlength={MAX_CODE_LENGTH_CHARS}
    />
  {/if}

  <button type="submit">
    {isJoining ? "Join" : "Confirm"}
  </button>
</form>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Audiowide&display=swap");

  body {
    margin: 0;
    padding: 0;
    font-family: "Audiowide", sans-serif;
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
    font-family: "Audiowide", sans-serif;
  }

  input {
    margin: 10px 0;
    padding: 10px;
    font-size: 24px;
    font-family: "Audiowide", sans-serif;
    border: none;
    border-radius: 10px;
    background-color: #030303;
    color: rgb(255, 250, 250);
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
    font-family: "Audiowide", sans-serif;
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
