import { Task } from "./task";
import { Scene } from "phaser";

// Game objects below are just placeholders for now
export class FirewallConfig extends Task {
  private firewallConfigBtn: Phaser.GameObjects.Text;

  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
  }

  start() {
    console.log("Starting FIREWALL_CONFIG task");
    this.firewallConfigBtn = this.scene.add
      .text(500, 500, "Configure Firewall")
      .setInteractive()
      .on("pointerdown", () => {
        this.complete();
      });
  }

  update() {}

  cleanup() {
    super.cleanup();
    this.firewallConfigBtn.destroy();
  }
}
