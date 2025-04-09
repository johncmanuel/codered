import { Scene, GameObjects, Tweens } from "phaser";

interface TaskNotification {
  message: string;
  taskId: string;
}

export class AssignedTaskNotification {
  private scene: Scene;
  private notificationText: GameObjects.Text | null;
  private tweens: Tweens.TweenManager;
  private notificationQueue: TaskNotification[];
  private currentTaskId: string | null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.tweens = scene.tweens;
    this.notificationText = null;
    this.notificationQueue = [];
    this.currentTaskId = null;
  }

  add(message: string, taskId: string) {
    this.notificationQueue.push({ message, taskId });

    if (!this.notificationText) {
      this.showNextNotification();
    }
  }

  private showNextNotification() {
    if (this.notificationQueue.length === 0) return;

    const nextNotification = this.notificationQueue.shift()!;
    this.currentTaskId = nextNotification.taskId;
    if (!nextNotification) return;

    this.notificationText = this.scene.add
      .text(this.scene.cameras.main.width / 2, 80, nextNotification.message, {
        fontFamily: "Audiowide",
        fontSize: "24px",
        color: "#000000",
        stroke: "#ffffff",
        strokeThickness: 1,
        backgroundColor: "#EEFF00",
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

        this.showNextNotification();
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
    this.notificationQueue = [];
  }

  show() {
    if (this.notificationText) {
      this.notificationText.setVisible(true);
    }
  }

  getCurrentTaskId() {
    return this.currentTaskId;
  }
}
