import { Scene, GameObjects, Tweens } from "phaser";

export class ActiveTaskNotification {
  private scene: Scene;
  private notifications: Map<string, GameObjects.Text> = new Map();
  private tweens: Tweens.TweenManager;

  constructor(scene: Scene) {
    this.scene = scene;
    this.tweens = scene.tweens;
  }

  show(taskId: string, message: string) {
    const notificationText = this.scene.add
      .text(this.scene.cameras.main.width / 2, 50, message, {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 10 },
      })
      .setOrigin(0.5, 0.5)
      .setVisible(true);

    this.notifications.set(taskId, notificationText);
  }

  fade(taskId: string) {
    const notificationText = this.notifications.get(taskId);
    if (!notificationText) return;

    this.tweens.add({
      targets: notificationText,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        notificationText.destroy();
        this.notifications.delete(taskId);
      },
    });
  }
}
