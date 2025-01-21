// https://github.com/colyseus/tutorial-phaser/blob/master/client/src/backend.ts
export const BACKEND_URL = process.env.BACKEND_URL || "ws://localhost:2567";
export const BACKEND_HTTP_URL = BACKEND_URL.replace("ws", "http");
