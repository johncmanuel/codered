<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Client } from "colyseus.js";
  import { gameStore } from "@/game/stores/gameStore";
  import LobbyForm from "$lib/components/LobbyForm.svelte";
  import PlayerList from "$lib/components/PlayerList.svelte";
  import type { LobbyRoom, Player } from "@/game/types/room";
  import { BACKEND_URL } from "@/game/lib/backend";

  let isJoining = false;

  onMount(() => {
    initializeClient();
  });

  onDestroy(() => {
    $gameStore.room?.leave();
    gameStore.reset();
  });

  async function initializeClient() {
    try {
      const client = new Client(BACKEND_URL);
      gameStore.setClient(client);
    } catch (error) {
      gameStore.setError("Failed to connect to server");
    }
  }

  async function handleLobbySubmit(event: CustomEvent<{ name: string; code?: string }>) {
    if (!$gameStore.client) return;

    try {
      const room = isJoining
        ? await $gameStore.client.joinById<LobbyRoom>(event.detail.code!, {
            name: event.detail.name,
          })
        : await $gameStore.client.create<LobbyRoom>("lobby", { name: event.detail.name });
      setupRoom(room);
    } catch (error) {
      gameStore.setError(isJoining ? "Failed to join lobby" : "Failed to create lobby");
      console.error("error in handleLobbySubmit", error);
    }
  }

  function setupRoom(room: LobbyRoom) {
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
  }
  function handleLeaveLobby() {
    gameStore.leaveLobby();
    isJoining = false; // Reset the joining state
  }
</script>

<main>
  {#if !$gameStore.room}
    <div class="lobby-creation">
      <div class="tabs">
        <button class:active={!isJoining} on:click={() => (isJoining = false)}>
          Create Lobby
        </button>
        <button class:active={isJoining} on:click={() => (isJoining = true)}> Join Lobby </button>
      </div>

      <LobbyForm {isJoining} on:submit={handleLobbySubmit} />

      {#if $gameStore.error}
        <p class="error">{$gameStore.error}</p>
      {/if}
    </div>
  {:else}
    <div class="lobby">
      <h2>Lobby Code: {$gameStore.joinCode}</h2>

      <PlayerList players={$gameStore.players} currentPlayerId={$gameStore.room.sessionId} />
      <button class="leave-button" on:click={handleLeaveLobby}> Leave Lobby </button>
    </div>
  {/if}
</main>

<style>
  .lobby-creation {
    max-width: 400px;
    margin: 0 auto;
  }

  .tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .error {
    color: red;
    margin-top: 1rem;
  }

  .lobby {
    max-width: 600px;
    margin: 0 auto;
  }
</style>
