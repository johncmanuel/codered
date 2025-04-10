<script lang="ts">
  import Sandbox from "@/lib/components/Sandbox.svelte";
  import { PUBLIC_NODE_ENV } from "$env/static/public";
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

  const mainMenuSong = new Audio("/assets/mainmenu.wav");
  let isMuted = false;
  let isPlaying = false;
  let showVolumeSlider = false;

  onMount(() => {
    initClient();

    // Listen for events from Phaser side
    EventBus.on("exitGame", () => {
      gameStore.leaveLobby();
      hasStarted = false;
    });

    // Start music after user interaction
    const startMusic = () => {
      mainMenuSong.loop = true;
      mainMenuSong.volume = 0.3;
      mainMenuSong
        .play()
        .then(() => {
          isPlaying = true;
        })
        .catch((err) => {
          console.log("Audio autoplay blocked - waiting for user interaction");
          isPlaying = false;
        });
    };

    document.addEventListener("click", startMusic, { once: true });
  });

  onDestroy(() => {
    $gameStore.room?.leave();
    mainMenuSong.pause();
    mainMenuSong.currentTime = 0;
    mainMenuSong.removeEventListener("ended", () => {}); // Clean up event listeners
  });

  function toggleMute() {
    isMuted = !isMuted;
    mainMenuSong.muted = isMuted;
  }

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

  function handleVolumeChange(event: InputEvent) {
    const target = event.target as HTMLInputElement;
    mainMenuSong.volume = parseFloat(target.value);
  }
</script>

<main>
  <div
    class="audio-controls"
    on:mouseenter={() => (showVolumeSlider = true)}
    on:mouseleave={() => (showVolumeSlider = false)}
    role="group"
    aria-label="Audio controls"
  >
    <button on:click={toggleMute} class="mute-button" aria-label={isMuted ? "Unmute" : "Mute"}>
      {#if !isPlaying}
        ▶️
      {:else if !isMuted}
        🔊
      {:else}
        🔇
      {/if}
    </button>
    {#if showVolumeSlider && isPlaying}
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={mainMenuSong.volume}
        on:input={handleVolumeChange}
        class="volume-slider"
        aria-label="Volume control"
        aria-valuemin="0"
        aria-valuemax="1"
        aria-valuenow={mainMenuSong.volume}
      />
    {/if}
  </div>

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
      <div class="lobby-code-container">
        <h2 style="font-size: 34px; font-weight: normal; letter-spacing: 2px;">Lobby Code:</h2>
        <button
          style="font-size: 34px; font-weight: normal; letter-spacing: 2px"
          class="clickable no-style no-hover"
          on:click={copyToClipboard}
          aria-label="Copy lobby code to clipboard"
        >
          <span class="underline">{$gameStore.joinCode}</span>
        </button>
      </div>
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
  {#if PUBLIC_NODE_ENV === "development" && !hasStarted}
    <Sandbox />
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

  button.no-style {
    all: unset;
  }

  button.no-hover:hover {
    background-color: initial;
    transform: none;
    cursor: pointer;
  }

  button:hover {
    background-color: rgb(190, 10, 10);
  }

  .lobby-creation {
    max-width: 400px;
    margin: 0 auto;
  }

  .lobby-code-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  .audio-controls {
    position: fixed;
    top: 0.25rem;
    right: 2rem;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
  }

  .mute-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
  }

  .mute-button:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }

  .volume-slider {
    width: 100px;
    height: 5px;
    -webkit-appearance: none;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 5px;
    transition: all 0.3s ease;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
  }

  .volume-slider::-moz-range-thumb {
    width: 15px;
    height: 10px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    border: none;
  }
</style>
