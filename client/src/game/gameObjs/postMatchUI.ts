import { Scene, GameObjects } from "phaser";
import type { GameRoom } from "../types/room";
import { EventBus } from "../EventBus";

export class PostMatchUI {
  private scene: Scene;
  private postMatchPanel: GameObjects.Container;
  private gameOverText: GameObjects.Text;
  private postMatchButton: GameObjects.Text;
  private exitButton: GameObjects.Text;

  constructor(scene: Scene) {
    this.scene = scene;
    this.postMatchPanel = this.scene.add.container(0, 0).setVisible(false);
    this.gameOverText = this.createGameOverText();
    this.postMatchButton = this.createPostMatchButton();
    this.exitButton = this.createExitButton();
  }

  private createExitButton(): GameObjects.Text {
    const button = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2 + 120,
        "Exit Game",
        {
          fontFamily: "Arial",
          fontSize: "32px",
          color: "#ffffff",
          backgroundColor: "#ff0000",
          padding: { x: 20, y: 10 },
        },
      )
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    button.setInteractive({ useHandCursor: true });
    button.on("pointerdown", () => this.handleExitGame());
    return button;
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

  // disconnect the user from the server room and go back to the home screen
  // the actual disconnection is done in the root +page.svelte
  private handleExitGame() {
    // const room = this.scene.registry.get("room") as GameRoom;
    // if (!room) return;
    // room.leave();
    this.scene.scene.stop();
    EventBus.emit("exitGame");
  }

  public show() {
    this.gameOverText.setVisible(true);
    this.postMatchButton.setVisible(true);
    this.exitButton.setVisible(true);
  }

  public hide() {
    this.gameOverText.setVisible(false);
    this.postMatchButton.setVisible(false);
    this.exitButton.setVisible(false);
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

    // TODO: too lazy to fix the spacing
    const roundText = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2 + 10,
        `Round: ${this.scene.registry.get("round")}`,
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

    this.postMatchPanel.add([background, title, healthText, roundText, closeButton]);
    this.postMatchPanel.setVisible(true);
  }
}
