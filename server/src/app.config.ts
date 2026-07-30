import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import cors from "cors";

/**
 * Import your Room files
 */
import { CodeRedRoom } from "./Game";

export default config({
  options: {
    devMode: process.env.NODE_ENV !== "production",
  },

  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define("lobby", CodeRedRoom);
  },

  initializeExpress: (app) => {
    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */

    const allowedOrigins =
      process.env.NODE_ENV !== "production"
        ? [
            "http://localhost:8080",
            "http://localhost:5173",
            "http://127.0.0.1:8080",
            "http://127.0.0.1:5173",
          ]
        : // hardcoding this for now lol
          ["https://codered-snowy.vercel.app"];

    app.use(
      cors({
        origin: allowedOrigins,
        credentials: true,
      }),
    );

    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (process.env.NODE_ENV !== "production") {
      app.use("/", playground);
    }

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    if (process.env.NODE_ENV !== "production") {
      app.use("/colyseus", monitor());
    }
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
});
