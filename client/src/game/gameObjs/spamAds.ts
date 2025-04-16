import { Scene } from "phaser";

export interface Ad {
  adBackground: Phaser.GameObjects.Rectangle;
  title: Phaser.GameObjects.Text;
  closeButton: Phaser.GameObjects.Arc;
  closeText: Phaser.GameObjects.Text;
  container?: Phaser.GameObjects.Container; // container to group ad elements in
}

export class SpamAds {
  private scene: Scene;
  private ads: Array<Ad>;
  private maxAdsShowed: number;
  private maxAdsSpawned: number;
  private minAdsSpawned: number;

  // for dragging ads around
  private dragOffsetX: number = 0;
  private dragOffsetY: number = 0;

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

    const isMaliciousCloseBtn = Math.random() < this.probabilityMaliciousCloseBtn();

    const container = this.scene.add.container(x, y);

    const adBackground = this.scene.add
      .rectangle(adWidthPx / 2, adHeightPx / 2, adWidthPx, adHeightPx, 0xffffff)
      .setStrokeStyle(2, 0x000000)
      .setInteractive();

    const title = this.scene.add.text(10, 10, "Advertisement", {
      font: "16px Arial",
      color: "#000000",
    });

    const closeButton = this.scene.add.circle(adWidthPx - 20, 20, 10, 0xff0000).setInteractive();
    const closeText = this.scene.add.text(closeButton.x - 5, closeButton.y - 10, "X", {
      font: "16px Arial",
      color: "#ffffff",
    });

    container.add([adBackground, title, closeButton, closeText]);

    adBackground.setInteractive({ cursor: "move" });
    this.scene.input.setDraggable(adBackground);

    adBackground.on("dragstart", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      const parentContainer = adBackground.parentContainer;
      if (parentContainer) {
        this.dragOffsetX = pointer.x - parentContainer.x;
        this.dragOffsetY = pointer.y - parentContainer.y;
      }
    });

    this.scene.input.on(
      "drag",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dragX: number,
        dragY: number,
      ) => {
        const parentContainer = gameObject.parentContainer;
        if (parentContainer) {
          parentContainer.x = pointer.x - this.dragOffsetX;
          parentContainer.y = pointer.y - this.dragOffsetY;
        }
      },
    );

    closeButton.on("pointerdown", () => {
      if (isMaliciousCloseBtn) {
        console.log(
          "Malicious close button triggered! More ads coming! 😈 (sorry not sorry btw -john)",
        );
        this.spawnAds();
        // shake the camera!
        this.scene.cameras.main.shake(100, 0.01);
      }
      container.destroy();
      this.ads = this.ads.filter((ad) => ad.adBackground !== adBackground);
      this.scene.events.emit("adClicked");
      console.log("current ads length", this.ads.length);
    });

    const ad: Ad = {
      adBackground,
      title,
      closeButton,
      closeText,
      container,
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
      if (ad.container) {
        ad.container.destroy();
      } else {
        ad.adBackground.destroy();
        ad.title.destroy();
        ad.closeButton.destroy();
        ad.closeText.destroy();
      }
    }
    console.log("Ads cleared");
    this.ads = [];
  }

  private probabilityMaliciousCloseBtn(
    multiplier: number = 0.1,
    roundLimitBeforeMaliciousStarts: number = 2,
  ) {
    // if not available, use default value of 3
    const currentRound = (this.scene.registry.get("round") as number) || 3;

    const maxFakeChance = 0.6;
    const fakeChance = Math.min(
      (currentRound - roundLimitBeforeMaliciousStarts) * multiplier,
      maxFakeChance,
    );
    return fakeChance;
  }
}
