import { Scene, GameObjects } from "phaser";

export class GameplayScreen {
  private scene: Scene;
  private headerBar: GameObjects.Rectangle;
  private wifiIcon: GameObjects.Image;
  private dateText: GameObjects.Text;
  private timeText: GameObjects.Text;
  private powerButton: GameObjects.Image;
  private calender: GameObjects.Image;
  private volume: GameObjects.Image;
  private clock: GameObjects.Image;
  private batteryOutline: GameObjects.Image;
  private batteryFill: GameObjects.Rectangle;
  private batteryContainer: GameObjects.Container;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createHeaderBar();
  }

  private createHeaderBar(): void {
    const headerHeight = 50;
    this.headerBar = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      headerHeight / 2,
      this.scene.cameras.main.width,
      headerHeight,
      0x333333,
      1,
    );
    this.headerBar.setDepth(0);

    this.wifiIcon = this.scene.add.image(
      this.scene.cameras.main.width - 495,
      headerHeight / 2,
      "wifiIcon",
    );
    this.wifiIcon.setOrigin(0, 0.5).setScale(0.1).setDepth(0);

    this.calender = this.scene.add.image(
      this.scene.cameras.main.width - 390,
      headerHeight / 2,
      "calender",
    );
    this.calender.setOrigin(0, 0.5).setScale(0.09).setDepth(0);

    const currentDate = new Date().toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
    this.dateText = this.scene.add.text(
      this.scene.cameras.main.width - 340,
      headerHeight / 2,
      currentDate,
      {
        fontFamily: "Audiowide",
        fontSize: "20px",
        color: "#000000",
      },
    );
    this.dateText.setOrigin(0, 0.4).setDepth(0);

    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    this.timeText = this.scene.add.text(
      this.scene.cameras.main.width - 105,
      headerHeight / 2,
      currentTime,
      {
        fontFamily: "Audiowide",
        fontSize: "20px",
        color: "#000000",
      },
    );
    this.timeText.setOrigin(0.5, 0.4).setDepth(0);

    this.clock = this.scene.add.image(
      this.scene.cameras.main.width - 185,
      headerHeight / 2,
      "clock",
    );
    this.clock.setOrigin(0.5, 0.5).setScale(0.09).setDepth(0);

    this.volume = this.scene.add.image(
      this.scene.cameras.main.width - 415,
      headerHeight / 2,
      "volume",
    );
    this.volume.setOrigin(0.5, 0.5).setScale(0.09).setDepth(0);

    this.powerButton = this.scene.add.image(
      this.scene.cameras.main.width - 15,
      headerHeight / 2,
      "powerIcon",
    );
    this.powerButton.setOrigin(0.7, 0.5).setScale(0.09).setDepth(0);

    this.batteryOutline = this.scene.add.image(
      this.scene.cameras.main.width - 1250,
      headerHeight / 2,
      "batteryOutline",
    );
    this.batteryOutline.setOrigin(0.5, 0.5).setScale(0.1).setDepth(0);
    const fillWidth = 30;
    const fillHeight = 15;
    const fillX = this.scene.cameras.main.width - 1250 - fillWidth / 2 + 1;
    const fillY = headerHeight / 2;

    this.batteryFill = this.scene.add.rectangle(fillX - 3, fillY, fillWidth, fillHeight, 0x00ff00);
    this.batteryFill.setOrigin(0, 0.5).setDepth(0);
  }

  public show(): void {
    this.headerBar.setVisible(true);
    this.wifiIcon.setVisible(true);
    this.dateText.setVisible(true);
    this.timeText.setVisible(true);
    this.powerButton.setVisible(true);
    this.calender.setVisible(true);
    this.volume.setVisible(true);
    this.clock.setVisible(true);
    this.batteryOutline.setVisible(true);
    this.batteryFill.setVisible(true);
  }

  public hide(): void {
    this.headerBar.setVisible(false);
    this.wifiIcon.setVisible(false);
    this.dateText.setVisible(false);
    this.timeText.setVisible(false);
    this.powerButton.setVisible(false);
    this.calender.setVisible(false);
    this.volume.setVisible(false);
    this.clock.setVisible(false);
    this.batteryOutline.setVisible(false);
    this.batteryFill.setVisible(false);
  }

  // updates time on the header
  public startUpdatingTime(delayMs: number = 1000): void {
    this.scene.time.addEvent({
      delay: delayMs,
      loop: true,
      callback: () => {
        const currentTime = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        this.timeText.setText(currentTime);
      },
    });
  }

  public updateBattery(health: number): void {
    if (!this.batteryFill) return;

    const healthPercent = Math.max(0, Math.min(100, health)) / 100;

    const maxWidth = 30;
    const newWidth = maxWidth * healthPercent;

    this.batteryFill.width = newWidth;

    let fillColor = 0x00ff00;
    if (healthPercent <= 0.25) {
      fillColor = 0xff0000;
    } else if (healthPercent <= 0.5) {
      fillColor = 0xffff00;
    }

    this.batteryFill.fillColor = fillColor;
  }
}
