import { Scene, GameObjects } from "phaser";

export class PostMatchUI {
  private scene: Scene;
  private postMatchPanel: GameObjects.Container;
  private gameOverText: GameObjects.Text;
  private postMatchButton: GameObjects.Text;

  constructor(scene: Scene) {
    this.scene = scene;
    this.postMatchPanel = this.scene.add.container(0, 0).setVisible(false);
    this.gameOverText = this.createGameOverText();
    this.postMatchButton = this.createPostMatchButton();
  }

  private createGameOverText(): GameObjects.Text {
    return this.scene.add
      .text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2, "Game Over", {
        fontFamily: "Arial",
        fontSize: "64px",
        color: "#ff0000",
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false);
  }

  private createPostMatchButton(): GameObjects.Text {
    const button = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2 + 50,
        "View Post-Match Statistics",
        {
          fontFamily: "Arial",
          fontSize: "32px",
          color: "#ffffff",
          backgroundColor: "#0000ff",
          padding: { x: 20, y: 10 },
        },
      )
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    button.setInteractive({ useHandCursor: true });
    button.on("pointerdown", () => this.showPostMatchStatistics());
    return button;
  }

  public show() {
    this.gameOverText.setVisible(true);
    this.postMatchButton.setVisible(true);
  }

  public hide() {
    this.gameOverText.setVisible(false);
    this.postMatchButton.setVisible(false);
  }

  public showPostMatchStatistics() {
    this.hide();
    this.postMatchPanel.removeAll(true);

    const background = this.scene.add
      .rectangle(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2,
        400,
        200,
        0x000000,
        0.8,
      )
      .setOrigin(0.5, 0.5);

    const title = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2 - 60,
        "Post-Match Statistics",
        {
          fontFamily: "Arial",
          fontSize: "32px",
          color: "#ffffff",
        },
      )
      .setOrigin(0.5, 0.5);

    const healthText = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2,
        `Data Health: ${this.scene.registry.get("dataHealth")}`,
        {
          fontFamily: "Arial",
          fontSize: "24px",
          color: "#ffffff",
        },
      )
      .setOrigin(0.5, 0.5);

    const closeButton = this.scene.add
      .text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 + 60, "Close", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#ff0000",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5, 0.5);

    closeButton.setInteractive({ useHandCursor: true });
    closeButton.on("pointerdown", () => {
      this.postMatchPanel.setVisible(false);
      this.show();
    });

    this.postMatchPanel.add([background, title, healthText, closeButton]);
    this.postMatchPanel.setVisible(true);
  }
}
