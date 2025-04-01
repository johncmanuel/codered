import { Task } from "./task";
import { Scene } from "phaser";

export class FirewallConfig extends Task {
  private trustedIPs: string[];
  private ipQueue: string[];
  private currentIP: string;
  private totalIPs: number;

  private mistakes: number;
  private mistakesAllowed: number = 3;
  private percentageOfTrustedIPs: number = 0.3;

  private whitelistBtn: Phaser.GameObjects.Text;
  private blacklistBtn: Phaser.GameObjects.Text;
  private statusText: Phaser.GameObjects.Text;
  private ipCountText: Phaser.GameObjects.Text;
  private currentIPText: Phaser.GameObjects.Text;
  private trustedIPsText: Phaser.GameObjects.Text;
  private instructionsText: Phaser.GameObjects.Text;

  private whitelistImage: Phaser.GameObjects.Image;
  private blacklistImage: Phaser.GameObjects.Image;
  private cloudImage: Phaser.GameObjects.Image;

  private whitelistGlow: Phaser.GameObjects.Graphics;
  private blacklistGlow: Phaser.GameObjects.Graphics;

  private correctSound: Phaser.Sound.BaseSound;
  private incorrectSound: Phaser.Sound.BaseSound;

  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
    // TODO: adjust number of IPs to generate based on number of rounds
    // or through something that makes the game harder
    this.trustedIPs = this.generateRandomIPs(5);
    this.ipQueue = this.generateIPQueue(10);
    this.totalIPs = this.ipQueue.length;
    this.mistakes = 0;
    this.currentIP = "";
    this.createBlockingOverlay();
  }

  // Load assets
  async preload(): Promise<void> {
    return new Promise((resolve) => {
      if (this.scene.textures.exists("folder")) {
        console.log("Images already loaded");
        resolve();
        return;
      }

      this.scene.load.image("folder", "/assets/folder.png");
      this.scene.load.image("cloudImage", "/assets/cloud2.png");
      this.scene.load.audio("correct", "/assets/correctsoundeffect.mp3");
      this.scene.load.audio("incorrect", "/assets/wrongsoundeffect.mp3");

      this.scene.load.on("complete", () => {
        console.log("All images loaded successfully");
        resolve();
      });

      this.scene.load.on("loaderror", (file: any) => {
        console.error("Error loading image:", file.src);
        resolve();
      });

      this.scene.load.start();
    });
  }

  async start() {
    console.log("Starting FIREWALL_CONFIG task");
    await this.preload();
    this.correctSound = this.scene.sound.add("correct");
    this.incorrectSound = this.scene.sound.add("incorrect");
    this.showTrustedIPs();
    this.showInstructions();
    this.nextIP();
  }

  update() {}

  cleanup() {
    super.cleanup();
    if (this.whitelistBtn) this.whitelistBtn.destroy();
    if (this.blacklistBtn) this.blacklistBtn.destroy();
    if (this.statusText) this.statusText.destroy();
    if (this.ipCountText) this.ipCountText.destroy();
    if (this.currentIPText) this.currentIPText.destroy();
    if (this.trustedIPsText) this.trustedIPsText.destroy();
    if (this.instructionsText) this.instructionsText.destroy();
    if (this.whitelistImage) this.whitelistImage.destroy();
    if (this.blacklistImage) this.blacklistImage.destroy();
    if (this.cloudImage) this.cloudImage.destroy();
    if (this.whitelistGlow) this.whitelistGlow.destroy();
    if (this.blacklistGlow) this.blacklistGlow.destroy();
  }

  private showTrustedIPs() {
    this.trustedIPsText = this.scene.add.text(
      900,
      200,
      "Trusted IPs:\n" + this.trustedIPs.join("\n"),
      {
        fontSize: "20px",
        color: "#ffffff",
        align: "left",
      }
    );
  }

  private showInstructions() {
    this.instructionsText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2 - 300,
      "Instructions: Determine if the IP address is in the trust IPs list",
      {
        fontSize: "24px",
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
      }
    ).setOrigin(0.5);
  }
  
  private nextIP() {
    if (this.whitelistBtn) this.whitelistBtn.destroy();
    if (this.blacklistBtn) this.blacklistBtn.destroy();
    if (this.statusText) this.statusText.destroy();
    if (this.whitelistImage) this.whitelistImage.destroy();
    if (this.blacklistImage) this.blacklistImage.destroy();
    if (this.cloudImage) this.cloudImage.destroy();
    if (this.whitelistGlow) this.whitelistGlow.destroy();
    if (this.blacklistGlow) this.blacklistGlow.destroy();

    // the player won if there are no more left
    if (this.ipQueue.length === 0) {
      this.complete();
      return;
    }

    this.currentIP = this.ipQueue.shift()!;

    this.cloudImage = this.scene.add.image(600, 290, "cloudImage").setScale(2);

    this.currentIPText = this.scene.add.text(420, 350, `IP Address: ${this.currentIP}`, {
      fontSize: "24px",
      color: "black",
      fontStyle: "bold",
    }).setDepth(1);

    this.whitelistImage = this.scene.add.image(400, 600, "folder").setScale(0.7);
    this.whitelistBtn = this.scene.add
      .text(335, 600, "Whitelist", { fontSize: "24px", color: "black", fontStyle: "bold" })
      .setInteractive()
      .setDepth(1)
      .on("pointerdown", () => this.handleDecision(true));

    this.blacklistImage = this.scene.add.image(805, 600, "folder").setScale(0.7);
    this.blacklistBtn = this.scene.add
      .text(740, 600, "Blacklist", { fontSize: "24px", color: "black", fontStyle: "bold" })
      .setInteractive()
      .setDepth(1)
      .on("pointerdown", () => this.handleDecision(false));

    // Display remaining IPs
    this.ipCountText = this.scene.add.text(
      450,
      150,
      `IPs Remaining: ${this.ipQueue.length + 1}/${this.totalIPs}`,
      {
        fontSize: "24px",
        color: "#ffffff",
      }
    );
  }

  private handleDecision(isWhitelist: boolean) {
    this.whitelistBtn.disableInteractive();
    this.blacklistBtn.disableInteractive();
  
    if (isWhitelist) {
      this.addCorrectGlowEffect(this.whitelistBtn, 0x00ff00);
    } else {
      this.addIncorrectGlowEffect(this.blacklistBtn, 0xff0000);
    }
  
    const isTrusted = this.trustedIPs.includes(this.currentIP);
    let isCorrect = false;
  
    if (isWhitelist && isTrusted) {
      isCorrect = true;
    } else if (!isWhitelist && !isTrusted) {
      isCorrect = true;
    }
  
    if (!isCorrect) {
      this.mistakes++;
      console.log("Mistake made! Mistakes: ", this.mistakes);
      if (this.incorrectSound) {
        this.incorrectSound.play();
      }
      if (this.mistakes >= this.mistakesAllowed) {
        this.fail();
        return;
      }
    } else {
      if (this.correctSound) {
        this.correctSound.play();
      }
      console.log("Correct decision!");
    }
  
    if (this.currentIPText) {
      this.currentIPText.destroy();
    }
  
    if (this.ipCountText) {
      this.ipCountText.destroy();
    }
  
    this.scene.time.delayedCall(200, () => {
      this.nextIP();
    });
  }

  private addCorrectGlowEffect(button: Phaser.GameObjects.Text, color: number) {
    const glow = this.scene.add.graphics();
    glow.fillStyle(color, 0.5); 
    glow.fillRoundedRect( 330, 595, 140, 30, 10 );
    glow.setDepth(0); 

    this.scene.tweens.add({
      targets: glow,
      alpha: 0, 
      duration: 700,
      ease: "Linear",
      onComplete: () => {
        glow.destroy(); 
      },
    });
  }

  private addIncorrectGlowEffect(button: Phaser.GameObjects.Text, color: number) {
    const glow = this.scene.add.graphics();
    glow.fillStyle(color, 0.5); 
    glow.fillRoundedRect( 735, 595, 140, 30, 10 );
    glow.setDepth(0); 

    this.scene.tweens.add({
      targets: glow,
      alpha: 0, 
      duration: 700,
      ease: "Linear",
      onComplete: () => {
        glow.destroy(); 
      },
    });
  }

  private generateIPQueue(totalIPs: number): string[] {
    const ipQueue: string[] = [];
    const trustedIPsToInclude = Math.ceil(totalIPs * this.percentageOfTrustedIPs);
    // ensure the number of trusted IPs not exceeded
    const trustedIPsInQueue = Math.min(trustedIPsToInclude, this.trustedIPs.length);

    for (let i = 0; i < trustedIPsInQueue; i++) {
      ipQueue.push(this.trustedIPs[i]);
    }

    const remainingIPs = totalIPs - trustedIPsInQueue;
    for (let i = 0; i < remainingIPs; i++) {
      let randomIP = this.generateRandomIP();
      // ensure the random IP is not already in the trusted IPs list
      while (this.trustedIPs.includes(randomIP)) {
        randomIP = this.generateRandomIP();
      }
      ipQueue.push(randomIP);
    }

    return this.shuffleArray(ipQueue);
  }

  private generateRandomIPs(count: number): string[] {
    const ips: string[] = [];
    for (let i = 0; i < count; i++) {
      ips.push(this.generateRandomIP());
    }
    return ips;
  }

  private generateRandomIP(): string {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(
      Math.random() * 256,
    )}.${Math.floor(Math.random() * 256)}`;
  }

  private shuffleArray(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}