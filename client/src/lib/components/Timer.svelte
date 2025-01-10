<script lang="ts">
  export let timer: number;

  function formatTimer(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
</script>

<div class="timer">
  <span>Time: {formatTimer(timer)}</span>
</div>
