// https://svelte.dev/tutorial/kit/env-static-public
import { PUBLIC_BACKEND_URL } from "$env/static/public";

// note that the env var will be publicly exposed in the client
export const BACKEND_URL = PUBLIC_BACKEND_URL || "ws://localhost:2567";
console.log(`BACKEND_URL: ${BACKEND_URL}, PUBLIC_BACKEND_URL: ${PUBLIC_BACKEND_URL}`);
export const BACKEND_HTTP_URL = BACKEND_URL.replace("ws", "http");
