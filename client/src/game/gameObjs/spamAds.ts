import { Scene } from "phaser";

export interface Ad {
  adBackground: Phaser.GameObjects.Rectangle;
  title: Phaser.GameObjects.Text;
  closeButton: Phaser.GameObjects.Arc;
  closeText: Phaser.GameObjects.Text;
}

export class SpamAds {
  private scene: Scene;
  private ads: Array<Ad>;
  private maxAdsShowed: number;
  private maxAdsSpawned: number;
  private minAdsSpawned: number;

  constructor(
    scene: Scene,
    minAdsSpawned: number = 4,
    maxAdsSpawned: number = 5,
    maxAdsShowed: number = 10,
  ) {
    this.scene = scene;
    this.ads = [];
    this.minAdsSpawned = minAdsSpawned;
    this.maxAdsSpawned = maxAdsSpawned;
    this.maxAdsShowed = maxAdsShowed;
  }

  private createAd() {
    const adWidthPx = 300;
    const adHeightPx = 200;
    const canvasWidth = this.scene.sys.game.config.width as number;
    const canvasHeight = this.scene.sys.game.config.height as number;

    // ensure ads don't spawn outside of the canvas
    const x = Phaser.Math.Between(0, canvasWidth - adWidthPx);
    const y = Phaser.Math.Between(0, canvasHeight - adHeightPx);

    const adBackground = this.scene.add
      .rectangle(x + adWidthPx / 2, y + adHeightPx / 2, adWidthPx, adHeightPx, 0xffffff)
      .setStrokeStyle(2, 0x000000)
      .setInteractive();

    const title = this.scene.add.text(x + 10, y + 10, "Advertisement", {
      font: "16px Arial",
      color: "#000000",
    });

    const closeButton = this.scene.add
      .circle(x + adWidthPx - 20, y + 20, 10, 0xff0000)
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
      this.ads = this.ads.filter((ad) => ad.adBackground !== adBackground);
      this.scene.events.emit("adClicked");
      console.log("current ads length", this.ads.length);
    });

    const ad: Ad = {
      adBackground,
      title,
      closeButton,
      closeText,
    };
    this.ads.push(ad);
  }

  public spawnAds() {
    // this isn't realistic but def don't want to overflood the player with ads
    // for sake of gameplay
    if (this.ads.length > this.maxAdsShowed) {
      console.warn("Max ads reached, current length of ads, stopping now", this.ads.length);
      return;
    }
    // spawn ads in a burst
    const numAds = Phaser.Math.Between(this.minAdsSpawned, this.maxAdsSpawned);
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
      // @ts-ignore
      // ad.forEach((obj) => obj.destroy());
      ad.adBackground.destroy();
      ad.title.destroy();
      ad.closeButton.destroy();
      ad.closeText.destroy();
    }
    console.log("Ads cleared");
    this.ads = [];
  }
}
