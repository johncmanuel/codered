import { writable } from "svelte/store";
import type { Client } from "colyseus.js";
import type { GameRoom, Player } from "../types/room";

export interface GameStore {
  client: Client | null;
  room: GameRoom | null;
  error: string | null;
  players: Player[];
  isHost: boolean;
  joinCode: string;
}

const initialState: GameStore = {
  client: null,
  room: null,
  error: null,
  players: [],
  isHost: false,
  joinCode: "",
};

function createGameStore() {
  const { subscribe, set, update } = writable<GameStore>(initialState);

  return {
    subscribe,
    setClient: (client: Client) => update((state) => ({ ...state, client })),
    setRoom: (room: GameRoom) => update((state) => ({ ...state, room })),
    setError: (error: string) => {
      update((state) => ({ ...state, error }));
      setTimeout(() => update((state) => ({ ...state, error: null})), 2000);
    },
    setPlayers: (players: Player[]) => update((state) => ({ ...state, players })),
    setIsHost: (isHost: boolean) => update((state) => ({ ...state, isHost })),
    setJoinCode: (joinCode: string) => update((state) => ({ ...state, joinCode })),
    leaveLobby: () => {
      update((state) => {
        state.room?.leave();
        return { ...initialState, client: state.client };
      });
    },
    reset: () => set(initialState),
  };
}

export const gameStore = createGameStore();
