import { Task } from "./task";
import { Scene } from "phaser";

export class SocialEngagementTask extends Task {
  constructor(scene: Scene, id: string) {
    super(scene, id);
  }
  start() {
    console.log("Starting social engagement task");
  }
  update() {}
  complete() {
    super.complete();
  }
}
