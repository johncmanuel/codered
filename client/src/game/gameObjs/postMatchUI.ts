import { Scene, GameObjects } from "phaser";
import { EventBus } from "../EventBus";
import { type GameState } from "../types/room";

export class PostMatchUI {
  private scene: Scene;
  private postMatchPanel: GameObjects.Container;
  private gameOverText: GameObjects.Text;
  private postMatchButton: GameObjects.Text;
  private exitButton: GameObjects.Text;
  private gameState: GameState | null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.postMatchPanel = this.scene.add.container(0, 0).setVisible(false);
    this.gameOverText = this.createGameOverText();
    this.postMatchButton = this.createPostMatchButton();
    this.exitButton = this.createExitButton();
    this.gameState = null;
  }

  public setGameState(gameState: GameState) {
    this.gameState = gameState;
  }

  private createExitButton(): GameObjects.Text {
    const button = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2 + 160,
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
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2 - 100,
        "Game Over",
        {
          fontFamily: "Arial",
          fontSize: "64px",
          color: "#ff0000",
          align: "center",
        },
      )
      .setOrigin(0.5, 0.5)
      .setVisible(false);
  }

  private createPostMatchButton(): GameObjects.Text {
    const button = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2 + 80,
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

  private handleExitGame() {
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

    // const background = this.scene.add
    //   .rectangle(
    //     this.scene.cameras.main.width / 2,
    //     this.scene.cameras.main.height / 2,
    //     450,
    //     300,
    //     0x000000,
    //     0.8,
    //   )
    //   .setOrigin(0.5, 0.5)
    //   .setDepth(0);

    const title = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2 - 120,
        "Post-Match Statistics",
        {
          fontFamily: "Arial",
          fontSize: "32px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 2,
            stroke: true,
            fill: true
          }
        },
      )
      .setDepth(1)
      .setOrigin(0.5, 0.5);

    const stats = [
      `Remaining Health: ${this.scene.registry.get("dataHealth")}`,
      `Highest Round Reached: ${this.scene.registry.get("round")}`,
      `Total Tasks Completed: ${this.gameState?.totalTasksDone}`,
      `Total Time Spent: ${this.gameState?.totalTimeSecs} sec`,
      `Total Tasks Failed: ${this.gameState?.totalTasksFailed}`,
      `Total Ads Clicked: ${this.gameState?.totalAdsClicked}`,
    ];

    stats.forEach((text, index) => {
      const statTextItem = this.scene.add
        .text(
          this.scene.cameras.main.width / 2,
          this.scene.cameras.main.height / 2 - 60 + index * 30,
          text,
          {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#ffffff",
            stroke: "#000000",      // Add black stroke around text
            strokeThickness: 4,     // Make stroke thick enough to be visible
            shadow: {              // Add text shadow
              offsetX: 2,
              offsetY: 2,
              color: '#000000',
              blur: 2,
              stroke: true,
              fill: true
            }
          },
        )
        .setDepth(1)
        .setOrigin(0.5, 0.5);
      this.postMatchPanel.add(statTextItem);
    });

    const closeButton = this.scene.add
      .text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 + 140, "Close", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#ff0000",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(1);

    closeButton.setInteractive({ useHandCursor: true });
    closeButton.on("pointerdown", () => {
      this.postMatchPanel.setVisible(false);
      this.show();
    });

    this.postMatchPanel.add([title, closeButton]);
    this.postMatchPanel.setVisible(true);
  }
}
