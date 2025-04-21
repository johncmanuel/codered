import { Task } from "./task";
import { Scene } from "phaser";

export class SystemRebootSequence extends Task {
  private tiles: Phaser.GameObjects.Rectangle[];
  private colors: string[] = ["red", "blue", "green", "yellow"];
  private sequence: string[] = [];
  private playerSequence: string[] = [];
  private currentRound: number = 1;
  private maxRounds: number = 2;
  private maxFails: number = 2;
  private fails: number = 0;
  private isShowingSequence: boolean = false;
  private isPlayerInputEnabled: boolean = false;
  private numColorsPerSequence: number = 4;
  private instructionsText: Phaser.GameObjects.Text;
  private sequenceText: Phaser.GameObjects.Text;
  private correctSound: Phaser.Sound.BaseSound;
  private incorrectSound: Phaser.Sound.BaseSound;

  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
    this.tiles = [];
  }

  async preload(): Promise<void> {
    return new Promise((resolve) => {
      if (this.scene.textures.exists("correct")) {
        console.log("Audio already loaded");
        resolve();
        return;
      }

      this.scene.load.audio("correct", "/assets/correctsoundeffect.mp3");
      this.scene.load.audio("incorrect", "/assets/wrongsoundeffect.mp3");

      this.scene.load.on("complete", () => {
        console.log("All audios loaded successfully");
        resolve();
      });

      this.scene.load.on("loaderror", (file: any) => {
        console.error("Error loading audio:", file.src);
        resolve();
      });

      this.scene.load.start();
    });
  }

  async start() {
    console.log("Starting SYSTEM_REBOOT_SEQUENCE task");
    this.createBlockingOverlay();
    await this.preload();
    this.correctSound = this.scene.sound.add("correct");
    this.incorrectSound = this.scene.sound.add("incorrect");
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
        return 0x0022ff;
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
      delay += 800;
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
      if (this.incorrectSound) {
        this.incorrectSound.play();
      }
      this.handleIncorrectInput();
      return;
    }

    if (this.playerSequence.length === this.sequence.length) {
      if (this.correctSound) {
        this.correctSound.play();
      }
      this.handleCorrectInput();
    }
  }

  private handleCorrectInput() {
    console.log("Correct sequence!");
    this.playerSequence = [];

    this.showCorrectFeedback();

    this.currentRound++;
    if (this.currentRound > this.maxRounds) {
      this.scene.time.delayedCall(900, () => {
        this.complete();
      });
    } else {
      this.scene.time.delayedCall(1000, () => {
        this.updateSequenceText();
        this.startRound();
      });
    }
  }

  private handleIncorrectInput() {
    console.log("Incorrect sequence!");
    this.fails++;
    this.playerSequence = [];

    this.showErrorFeedback();

    this.currentRound++;

    if (this.fails >= this.maxFails) {
      this.fail();
    } else if (this.currentRound > this.maxRounds) {
      this.complete();
    } else {
      this.updateSequenceText();
      this.startRound();
    }
  }

  private showErrorFeedback() {
    const errorFlash = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0xff0000,
      0.3,
    );

    const errorText = this.scene.add
      .text(
        this.scene.cameras.main.centerX,
        this.scene.cameras.main.centerY,
        "Incorrect sequence!",
        {
          fontFamily: "Audiowide",
          fontSize: "32px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5);

    this.scene.time.delayedCall(500, () => {
      errorFlash.destroy();
      errorText.destroy();
    });
  }

  private showCorrectFeedback() {
    const successFlash = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x00ff00,
      0.3,
    );

    const successText = this.scene.add
      .text(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, "Correct sequence!", {
        fontFamily: "Audiowide",
        fontSize: "32px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.scene.time.delayedCall(500, () => {
      successFlash.destroy();
      successText.destroy();
    });
  }
}
