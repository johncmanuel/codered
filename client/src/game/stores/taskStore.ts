import { writable } from "svelte/store";
import { TaskState } from "../types/room";

// Debugging purposes only
export function createTaskStore() {
  const { subscribe, set, update } = writable<Map<string, TaskState>>(new Map());
  return {
    subscribe,
    addTask: (key: string, task: TaskState) =>
      update((map) => {
        map.set(key, task);
        return new Map(map);
      }),
    deleteTask: (key: string) =>
      update((map) => {
        map.delete(key);
        return new Map(map);
      }),
    clear: () => set(new Map()),
  };
}

export const taskStore = createTaskStore();
