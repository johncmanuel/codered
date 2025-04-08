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
      1
    );
    this.headerBar.setDepth(0);

    this.wifiIcon = this.scene.add.image(this.scene.cameras.main.width - 445, headerHeight / 2, "wifiIcon");
    this.wifiIcon.setOrigin(0, 0.5).setScale(0.1).setDepth(0);

    this.calender = this.scene.add.image(this.scene.cameras.main.width - 335, headerHeight / 2, "calender");
    this.calender.setOrigin(0, 0.5).setScale(0.09).setDepth(0);

    const currentDate = new Date().toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
    this.dateText = this.scene.add.text(this.scene.cameras.main.width - 280, headerHeight / 2, currentDate, {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#000000",
    });
    this.dateText.setOrigin(0, 0.5).setDepth(0);

    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    this.timeText = this.scene.add.text(
      this.scene.cameras.main.width - 110,
      headerHeight / 2,
      currentTime,
      {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#000000",
      }
    );
    this.timeText.setOrigin(0.4, 0.5).setDepth(0);

    this.clock = this.scene.add.image(this.scene.cameras.main.width - 170, headerHeight / 2, "clock");
    this.clock.setOrigin(0.5, 0.5).setScale(0.09).setDepth(0);

    this.volume = this.scene.add.image(this.scene.cameras.main.width - 365, headerHeight / 2, "volume");
    this.volume.setOrigin(0.5, 0.5).setScale(0.09).setDepth(0);

    this.powerButton = this.scene.add.image(this.scene.cameras.main.width - 20, headerHeight / 2, "powerIcon");
    this.powerButton.setOrigin(0.7, 0.5).setScale(0.09).setDepth(0);
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
  }
}