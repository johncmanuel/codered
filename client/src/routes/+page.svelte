<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { gameStore } from "@/game/stores/gameStore";
  import LobbyForm from "$lib/components/LobbyForm.svelte";
  import PlayerList from "$lib/components/PlayerList.svelte";
  import type { GameRoom, Player } from "@/game/types/room";
  import GameComponent from "$lib/components/GameComponent.svelte";
  import HostControls from "@/lib/components/HostControls.svelte";
  import About from "@/lib/components/about.svelte";
  import { EventBus } from "@/game/EventBus";
  import initClient from "@/lib/multiplayer/initClient";

  let isJoining = false;
  $: hasStarted = false;
  let showAbout = false;

  onMount(() => {
    initClient();
    // listen for events from phaser side
    EventBus.on("exitGame", () => {
      gameStore.leaveLobby();
      hasStarted = false;
    });
  });

  onDestroy(() => {
    $gameStore.room?.leave();
  });

  async function handleLobbySubmit(event: CustomEvent<{ name: string; code?: string }>) {
    if (!$gameStore.client) return;

    const colyseusRoom = "lobby";

    try {
      const room = isJoining
        ? await $gameStore.client.joinById<GameRoom>(event.detail.code!, {
            name: event.detail.name,
          })
        : await $gameStore.client.create<GameRoom>(colyseusRoom, { name: event.detail.name });
      // @ts-ignore: ignore type checking here for now
      handleRoomEvents(room);
    } catch (error) {
      gameStore.setError(isJoining ? "Failed to join lobby" : "Failed to create lobby");
      console.error("error in handleLobbySubmit", error);
    }
  }

  function handleRoomEvents(room: GameRoom) {
    gameStore.setRoom(room);
    gameStore.setJoinCode(room.roomId);

    room.onStateChange((state) => {
      const players: Player[] = Array.from(state.players.entries()).map(([id, data]) => ({
        id,
        name: data.name,
      }));

      gameStore.setPlayers(players);
      gameStore.setIsHost(room.sessionId === state.hostId);
    });

    // Start the game once Colyseus sends the signal
    room.onMessage("startGame", () => {
      console.log("Game start, apt apt apt");
      console.log("GameStore", $gameStore);
      hasStarted = true;
      // EventBus.emit("startGame", $gameStore);
    });

    // Handle errors
    room.onError((error) => {
      gameStore.setError(`Room error: ${error}`);
    });
  }

  function handleLeaveLobby() {
    gameStore.leaveLobby();
    isJoining = false; // Reset the joining state
  }

  function handleStartGame() {
    // Check conditions first
    if (!$gameStore.room || !$gameStore.isHost) return;
    if ($gameStore.players.length < 3) {
      gameStore.setError("You need at least 3 players to start the game");
      return;
    }

    // Send the start game signal to Colyseus
    try {
      $gameStore.room.send("startGame");
    } catch (error) {
      gameStore.setError("Failed to start game");
      console.error("Failed to start game", error);
    }
  }

  function toggleAbout() {
    showAbout = !showAbout;
  }

  function copyToClipboard() {
    navigator.clipboard
      .writeText($gameStore.joinCode)
      .then(() => {
        alert("Lobby code copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }
</script>

<main>
  <!-- <button class="about-us" on:click={toggleAbout}>About Us</button> -->
  <!-- {#if showAbout}
    <About closePopup={toggleAbout} />
  {/if} -->

  {#if $gameStore.room && hasStarted}
    <GameComponent />
  {:else if !$gameStore.room}
    <div class="lobby-creation">
      <div class="tabs">
        <button class:active={!isJoining} on:click={() => (isJoining = false)}>
          Create Lobby
        </button>
        <button class:active={isJoining} on:click={() => (isJoining = true)}> Join Lobby </button>
      </div>

      <LobbyForm {isJoining} on:submit={handleLobbySubmit} />

      {#if $gameStore.error}
        <div class="error-message">
          {$gameStore.error}
        </div>
      {/if}
    </div>
  {:else}
    <div class="lobby">
      <h2
        style="font-size: 34px; font-weight: normal; letter-spacing: 2px;"
        class="clickable"
        on:click={copyToClipboard}
      >
        Lobby Code: <span class="underline">{$gameStore.joinCode}</span>
      </h2>

      <PlayerList players={$gameStore.players} currentPlayerId={$gameStore.room.sessionId} />
      <button class="leave-button" on:click={handleLeaveLobby} style="font-weight: strong;">
        Leave Lobby
      </button>
      {#if $gameStore.isHost}
        <HostControls players={$gameStore.players} onStart={handleStartGame} />
      {/if}

      {#if $gameStore.error}
        <div class="error-message">
          {$gameStore.error}
        </div>
      {/if}
    </div>
  {/if}
</main>

<style>
  button {
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 24px;
    font-family: "Audiowide", sans-serif;
    border: none;
    border-radius: 5px;
    background-color: #222222;
    color: rgb(255, 255, 255);
    cursor: pointer;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: rgb(190, 10, 10);
  }
  .lobby-creation {
    max-width: 400px;
    margin: 0 auto;
  }

  .tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .lobby {
    max-width: 600px;
    margin: 0 auto;
  }

  .ready-button {
    width: 100%;
    padding: 0.5rem;
    margin: 1rem 0;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .ready-button:hover {
    background: #1976d2;
  }

  .about-us {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: none;
    border: none;
    color: rgb(255, 255, 255);
    cursor: pointer;
    text-decoration: underline;
    font: inherit;
    font-size: 20px;
  }

  .about-us:focus {
    outline: 2px solid rgb(255, 255, 255);
  }

  .clickable {
    cursor: pointer;
  }

  .underline {
    text-decoration: underline;
  }

  .error-message {
    animation-delay: 5s;
    animation: fade-inout 10s infinite; 
    opacity: 1;
    color: red;
    margin-top: 1rem;
    padding: 0.75rem;
    text-align: center;
    font-size: 25px;
  }

  .error-message:empty {
    opacity: 0;
  }
  
  @keyframes fade-inout {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
</style>
