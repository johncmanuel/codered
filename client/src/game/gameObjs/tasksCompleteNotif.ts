import { Scene, GameObjects } from "phaser";

export class TasksCompleteNotif {
  private scene: Scene;
  private allTasksCompleteNotif: GameObjects.Text | null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public show(): void {
    if (this.allTasksCompleteNotif) {
      this.allTasksCompleteNotif.destroy();
    }

    this.allTasksCompleteNotif = this.scene.add
      .text(
        // this.cameras.main.width / 2,
        // this.cameras.main.height / 2 - 100,
        this.scene.cameras.main.width / 2,
        50,
        "ALL TASKS COMPLETE!",
        {
          fontFamily: "Arial",
          fontSize: "48px",
          color: "#00ff00",
          backgroundColor: "#000000",
          padding: { x: 20, y: 10 },
        },
      )
      .setOrigin(0.5, 0.5);

    // add an interesting effect...
    this.scene.tweens.add({
      targets: this.allTasksCompleteNotif,
      scale: { from: 1, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // remove after 5 seconds
    this.scene.time.delayedCall(5000, () => {
      if (this.allTasksCompleteNotif) {
        this.allTasksCompleteNotif.destroy();
        this.allTasksCompleteNotif = null;
      }
    });
  }

  public hide(): void {
    if (this.allTasksCompleteNotif) {
      this.allTasksCompleteNotif.destroy();
      this.allTasksCompleteNotif = null;
    }
  }
}
