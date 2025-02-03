import { Client } from "colyseus.js";
import { BACKEND_URL } from "@/game/lib/backend";
import { gameStore } from "@/game/stores/gameStore";

export default function initClient(): Client | null {
  try {
    const client = new Client(BACKEND_URL);
    gameStore.setClient(client);
    return client;
  } catch (error) {
    gameStore.setError("Failed to connect to server");
    return null;
  }
}
