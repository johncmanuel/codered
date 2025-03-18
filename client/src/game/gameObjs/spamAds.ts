import { Scene } from "phaser";

export class SpamAds {
  private scene: Scene;
  private ads: Phaser.GameObjects.Rectangle[];
  private maxAds: number;

  constructor(scene: Scene) {
    this.scene = scene;
    this.ads = [];
    this.maxAds = 10;
  }

  private createAd() {
    const adWidth = 300;
    const adHeight = 200;
    const canvasWidth = this.scene.sys.game.config.width as number;
    const canvasHeight = this.scene.sys.game.config.height as number;

    const x = Phaser.Math.Between(0, canvasWidth - adWidth);
    const y = Phaser.Math.Between(0, canvasHeight - adHeight);

    const adBackground = this.scene.add
      .rectangle(x + adWidth / 2, y + adHeight / 2, adWidth, adHeight, 0xffffff)
      .setStrokeStyle(2, 0x000000)
      .setInteractive();

    const title = this.scene.add.text(x + 10, y + 10, "Advertisement", {
      font: "16px Arial",
      color: "#000000",
    });

    const closeButton = this.scene.add
      .circle(x + adWidth - 20, y + 20, 10, 0xff0000)
      .setInteractive();
    const closeText = this.scene.add.text(closeButton.x - 5, closeButton.y - 10, "X", {
      font: "16px Arial",
      color: "#ffffff",
    });

    closeButton.on("pointerdown", () => {
      adBackground.destroy();
      title.destroy();
      closeButton.destroy();
      closeText.destroy();
      this.ads = this.ads.filter((ad) => ad !== adBackground);
    });

    // track mainly the background rectangle
    this.ads.push(adBackground);
  }

  public spawnAds() {
    if (this.ads.length > this.maxAds) {
      console.warn("Max ads reached, current length of ads", this.ads.length);
    }
    // spawn ads in a burst
    const numAds = Phaser.Math.Between(7, 8);
    const spawnDelayMs = 100;
    for (let i = 0; i < numAds; i++) {
      this.scene.time.delayedCall(i * spawnDelayMs, () => {
        this.createAd();
      });
    }
  }

  public getAds() {
    return this.ads;
  }

  public clearAds() {
    for (const ad of this.ads) {
      ad.destroy();
    }
    this.ads = [];
  }
}
