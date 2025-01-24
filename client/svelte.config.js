import adapter from "@sveltejs/adapter-static";
import { enhancedImages } from '@sveltejs/enhanced-img';
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [vitePreprocess(), enhancedImages()],
  kit: {
    adapter: adapter({
      precompress: false,
      fallback: "index.html",
    }),
    alias: {
      "@": "src",
    },
  },
};

export default config;
