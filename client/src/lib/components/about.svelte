<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  export let show = false; // Start with the popup hidden
  const close = () => dispatch('close');
  const open = () => dispatch('open');
</script>

<style>
  .about-us {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: none;
    border: none;
    color: rgb(254, 254, 255);
    cursor: pointer;
    text-decoration: underline;
    font: inherit;
    font-size: 20px;
  }

  .about-us:focus {
    outline: 2px solid rgb(255, 255, 255);
  }

  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .popup-content {
    background-color: rgb(7, 7, 7);
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    z-index: 1001;
    font-size: 25px;
    font-family: 'Courier New', Courier, monospace;
  }

  .close-button {
    margin-top: 10px;
    background: none;
    border: none;
    color: rgb(255, 8, 8);
    cursor: pointer;
    font-size: 20px;
  }
</style>

<button class="about-us" on:click={open}>About Us</button>

{#if show}
  <div class="popup-overlay" on:click={close}>
    <div class="popup-content" on:click|stopPropagation>
      <p>
        Two students from California State University Fullerton passionate about software and game development. 
        Code Red is designed for icebreaker activities in large social gatherings. It addresses the lack of inclusivity for remote users 
        by fostering team dynamics and improving productivity in virtual settings.
      </p>
      <button class="close-button" on:click={close}>Close</button>
    </div>
  </div>
{/if}
