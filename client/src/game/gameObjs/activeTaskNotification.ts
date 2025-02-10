import { Scene, GameObjects, Tweens } from "phaser";

export class ActiveTaskNotification {
  private scene: Scene;
  private notificationText: GameObjects.Text | null;
  private tweens: Tweens.TweenManager;

  constructor(scene: Scene) {
    this.scene = scene;
    this.tweens = scene.tweens;
    this.notificationText = null;
  }

  add(message: string) {
    // if there's an existing notification, destroy it before adding new one
    if (this.notificationText) {
      this.notificationText.destroy();
    }

    this.notificationText = this.scene.add
      .text(this.scene.cameras.main.width / 2, 50, message, {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 10 },
      })
      .setOrigin(0.5, 0.5)
      .setVisible(true);
  }

  fade() {
    if (!this.notificationText) return;

    this.tweens.add({
      targets: this.notificationText,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.notificationText?.destroy();
        this.notificationText = null;
      },
    });
  }

  hide() {
    if (this.notificationText) {
      this.notificationText.setVisible(false);
    }
  }

  clear() {
    if (this.notificationText) {
      this.notificationText.destroy();
      this.notificationText = null;
    }
  }

  show() {
    if (this.notificationText) {
      this.notificationText.setVisible(true);
    }
  }
}
