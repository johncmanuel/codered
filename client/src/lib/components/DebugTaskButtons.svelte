<script lang="ts">
  // only used for debugging tasks, not to be used in production

  import type { TaskState } from "@/game/types/room";
  import { gameStore } from "@/game/stores/gameStore";

  export let task: TaskState;

  function handleTaskSuccess() {
    console.log("Task completed", task.id);
    $gameStore.room?.send("taskCompleted", task.id);
  }
  function handleTaskFail() {
    console.log("Task failed", task.id);
    $gameStore.room?.send("taskFailed", task.id);
  }
</script>

<div class="debug-controls">
  <p class="task-info">Task ID: {task.id} | Type: {task.type}</p>
  <div class="button-group">
    <button class="success" on:click={handleTaskSuccess}> Complete Task </button>
    <button class="fail" on:click={handleTaskFail}> Fail Task </button>
  </div>
</div>
