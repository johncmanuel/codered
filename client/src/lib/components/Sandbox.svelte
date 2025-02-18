<script lang="ts">
  import PhaserGame, { type TPhaserRef } from "@/game/PhaserGame.svelte";
  import { Scene } from "phaser";

  let phaserRef: TPhaserRef = { game: null, scene: null };

  const onCurrentActiveScene = (scene: Scene) => {
    console.log("onCurrentActiveScene triggered for sandbox");
  };
</script>

<div>
  <h1>Sandbox</h1>
  <p>do not let me be seen in production! if u do, i'm gonna cry</p>

  <PhaserGame bind:phaserRef currentActiveScene={onCurrentActiveScene} />
</div>
