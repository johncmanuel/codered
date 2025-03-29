import { Task } from "./task";
import { Scene } from "phaser";

export class SystemRebootSequence extends Task {
  private tiles: Phaser.GameObjects.Rectangle[];
  private colors: string[] = ["red", "blue", "green", "yellow"];
  private sequence: string[] = [];
  private playerSequence: string[] = [];
  private currentRound: number = 1;
  private maxRounds: number = 4;
  private maxFails: number = 2;
  private fails: number = 0;
  private isShowingSequence: boolean = false;
  private isPlayerInputEnabled: boolean = false;
  private numColorsPerSequence: number = 4;
  private instructionsText: Phaser.GameObjects.Text;
  private sequenceText: Phaser.GameObjects.Text;
  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
    this.tiles = [];
  }

  start() {
    console.log("Starting SYSTEM_REBOOT_SEQUENCE task");
    this.createBlockingOverlay();
    this.createInstructions();
    this.createSequenceText();
    this.createTiles();
    this.startRound();
  }

  update() {}

  cleanup() {
    super.cleanup();
    this.tiles.forEach((tile) => tile.destroy());
    this.instructionsText.destroy();
    this.sequenceText.destroy();
  }

  private createInstructions() {
    this.instructionsText = this.scene.add
      .text(
        this.scene.cameras.main.centerX,
        50,
        "Instructions: Memorize the given pattern and repeat it back in order to reboot the company's system!",
        {
          fontFamily: "Audiowide",
          fontSize: "22px",
          color: "#ffffff",
          align: "center",
          backgroundColor: "#000000",
          padding: { x: 10, y: 5 },
        },
      )
      .setOrigin(0.5, 0);
  }

  private createSequenceText() {
    this.sequenceText = this.scene.add
      .text(
        this.scene.cameras.main.centerX,
        120,
        `Sequence ${this.currentRound}/${this.maxRounds}`,
        {
          fontFamily: "Audiowide",
          fontSize: "24px",
          color: "#ffffff",
          align: "center",
        },
      )
      .setOrigin(0.5, 0);
  }

  private updateSequenceText() {
    this.sequenceText.setText(`Sequence ${this.currentRound}/${this.maxRounds}`);
  }

  private createTiles() {
    const tileSize = 200;
    const startX = this.scene.cameras.main.centerX - tileSize / 2;
    const startY = this.scene.cameras.main.centerY - tileSize / 2;

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const tile = this.scene.add.rectangle(
          startX + i * tileSize,
          startY + j * tileSize,
          tileSize,
          tileSize,
          0xffffff,
        );
        // Add a black border
        tile.setStrokeStyle(2, 0x000000);
        tile.setInteractive();
        tile.on("pointerdown", () => this.handleTileClick(tile));
        this.tiles.push(tile);
      }
    }

    this.assignColorsToTiles();
  }

  private assignColorsToTiles() {
    this.tiles.forEach((tile, index) => {
      tile.setFillStyle(this.getColorValue(this.colors[index]));
    });
  }

  private getColorValue(color: string): number {
    switch (color) {
      case "red":
        return 0xff0000;
      case "blue":
        return 0x0000ff;
      case "green":
        return 0x00ff00;
      case "yellow":
        return 0xffff00;
      default:
        // Default to white
        return 0xffffff;
    }
  }

  private startRound() {
    console.log(`Starting Round ${this.currentRound}`);
    this.updateSequenceText();
    this.generateSequence();
    this.showSequence();
  }

  private generateSequence() {
    this.sequence = [];
    for (let i = 0; i < this.numColorsPerSequence; i++) {
      const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.sequence.push(randomColor);
    }
    console.log("Generated Sequence:", this.sequence);
  }

  private showSequence() {
    this.isShowingSequence = true;
    this.isPlayerInputEnabled = false;

    let delay = 0;
    this.sequence.forEach((color, index) => {
      this.scene.time.delayedCall(delay, () => {
        const tile = this.tiles[this.colors.indexOf(color)];
        this.flashTile(tile);
      });
      delay += 700;
    });

    this.scene.time.delayedCall(delay, () => {
      this.isShowingSequence = false;
      this.isPlayerInputEnabled = true;
      console.log("Player input enabled");
    });
  }

  private flashTile(tile: Phaser.GameObjects.Rectangle) {
    this.scene.tweens.add({
      targets: tile,
      alpha: 0.5,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        tile.setAlpha(1);
      },
    });
  }

  private handleTileClick(tile: Phaser.GameObjects.Rectangle) {
    if (!this.isPlayerInputEnabled || this.isShowingSequence) return;

    this.flashTile(tile);
    const clickedColor = this.colors[this.tiles.indexOf(tile)];

    this.playerSequence.push(clickedColor);
    console.log("Player Sequence:", this.playerSequence);

    if (
      this.playerSequence[this.playerSequence.length - 1] !==
      this.sequence[this.playerSequence.length - 1]
    ) {
      this.handleIncorrectInput();
      return;
    }

    if (this.playerSequence.length === this.sequence.length) {
      this.handleCorrectInput();
    }
  }

  private handleCorrectInput() {
    console.log("Correct sequence!");
    this.playerSequence = [];

    this.currentRound++;
    if (this.currentRound > this.maxRounds) {
      this.complete();
    } else {
      this.scene.time.delayedCall(1000, () => {
        this.startRound();
      });
    }
  }

  private handleIncorrectInput() {
    console.log("Incorrect sequence!");
    this.fails++;
    this.playerSequence = [];

    if (this.fails >= this.maxFails) {
      this.fail();
    } else {
      this.startRound();
    }
  }
}

