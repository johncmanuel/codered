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

  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
    // TODO: adjust number of IPs to generate based on number of rounds
    // or through something that makes the game harder
    this.trustedIPs = this.generateRandomIPs(5);
    this.ipQueue = this.generateIPQueue(10);
    this.totalIPs = this.ipQueue.length;
    this.mistakes = 0;
    this.currentIP = "";
  }

  start() {
    console.log("Starting FIREWALL_CONFIG task");
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
      },
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
      },
    ).setOrigin(0.5); 
  }

  private nextIP() {
    if (this.whitelistBtn) this.whitelistBtn.destroy();
    if (this.blacklistBtn) this.blacklistBtn.destroy();
    if (this.statusText) this.statusText.destroy();

    // the player won if there are no more left
    if (this.ipQueue.length === 0) {
      this.complete();
      return;
    }

    this.currentIP = this.ipQueue.shift()!;

    if (this.currentIPText) this.currentIPText.destroy();
    this.currentIPText = this.scene.add.text(400, 300, `IP Address: ${this.currentIP}`, {
      fontSize: "24px",
      color: "#ffffff",
    });

    this.whitelistBtn = this.scene.add
      .text(400, 400, "Whitelist", { fontSize: "24px", color: "#00ff00" })
      .setInteractive()
      .on("pointerdown", () => this.handleDecision(true));

    this.blacklistBtn = this.scene.add
      .text(600, 400, "Blacklist", { fontSize: "24px", color: "#ff0000" })
      .setInteractive()
      .on("pointerdown", () => this.handleDecision(false));

    // (e.g., "1/10 IPs")
    this.ipCountText = this.scene.add.text(
      400,
      200,
      `IPs Remaining: ${this.ipQueue.length + 1}/${this.totalIPs}`,
      {
        fontSize: "24px",
        color: "#ffffff",
      },
    );
  }

  private handleDecision(isWhitelist: boolean) {
    const isTrusted = this.trustedIPs.includes(this.currentIP);
    let isCorrect = false;

    if (isWhitelist && isTrusted) {
      isCorrect = true;
    } else if (!isWhitelist && !isTrusted) {
      isCorrect = true;
    }

    // could play a sound here that indicates if the decision was correct or not
    if (!isCorrect) {
      this.mistakes++;
      console.log("Mistake made! Mistakes: ", this.mistakes);
      if (this.mistakes >= this.mistakesAllowed) {
        this.fail();
        return;
      }
    } else {
      // play a sound here or something
      console.log("Correct decision!");
    }

    this.whitelistBtn.disableInteractive();
    this.blacklistBtn.disableInteractive();

    this.ipCountText.destroy();

    this.scene.time.delayedCall(200, () => {
      this.nextIP();
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