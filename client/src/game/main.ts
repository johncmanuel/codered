import { CodeRed as MainGame } from "./scenes/CodeRed";
import { AUTO, Game, type Types } from "phaser";
import { PUBLIC_NODE_ENV } from "$env/static/public";
import { Sandbox } from "./scenes/Sandbox";

export const IS_DEV = PUBLIC_NODE_ENV === "development";

export const CONFIG_WIDTH = 1280;
export const CONFIG_HEIGHT = 720;
export const CONFIG_PARENT_CONTAINER = "game-container";
export const CONFIG_BACKGROUND_COLOR = "#028af8";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: CONFIG_WIDTH,
  height: CONFIG_HEIGHT,
  parent: CONFIG_PARENT_CONTAINER,
  backgroundColor: CONFIG_BACKGROUND_COLOR,
  // make sandbox first scene to load
  scene: IS_DEV ? [Sandbox, MainGame] : [MainGame],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
