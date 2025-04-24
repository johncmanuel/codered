import { Scene, GameObjects } from "phaser";
import { Task } from "./task";

export class SocialEng extends Task {
  private loginDetails: GameObjects.Text;
  private legitimateButton: GameObjects.Rectangle;
  private legitimateText: GameObjects.Text;

  private impostorButton: GameObjects.Rectangle;
  private impostorText: GameObjects.Text;

  private isLegitimate: boolean;
  private clues: string[] = [];
  private employeeName: string;
  private header: GameObjects.Text;

  private correctSound: Phaser.Sound.BaseSound;
  private incorrectSound: Phaser.Sound.BaseSound;

  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
    this.createBlockingOverlay();
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
    await this.preload();
    this.correctSound = this.scene.sound.add("correct");
    this.incorrectSound = this.scene.sound.add("incorrect");

    this.isLegitimate = Phaser.Math.Between(0, 1) === 1;
    this.employeeName = this.generateEmployeeName();
    this.generateLoginDetails();

    this.header = this.scene.add
      .text(
        this.scene.cameras.main.centerX,
        this.scene.cameras.main.centerY - 150,
        `Login Attempt from employee: ${this.employeeName}`,
        { color: "#ffffff", fontSize: "24px", fontStyle: "bold" },
      )
      .setOrigin(0.5);

    this.loginDetails = this.scene.add.text(
      this.scene.cameras.main.centerX - 150,
      this.scene.cameras.main.centerY - 80,
      this.clues.join("\n"),
      {
        color: "#000000",
        fontSize: "16px",
        backgroundColor: "#ffffff",
        padding: { x: 10, y: 10 },
      },
    );

    this.createDecisionButtons();
  }

  update() {}

  private generateEmployeeName(): string {
    const firstNames = [
      "Alex",
      "Jamie",
      "Taylor",
      "Morgan",
      "Casey",
      "Jordan",
      "John",
      "Bruce",
      "Brandy",
    ];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Davis", "Miller"];
    return `${firstNames[Phaser.Math.Between(0, firstNames.length - 1)]} ${
      lastNames[Phaser.Math.Between(0, lastNames.length - 1)]
    }`;
  }

  private generateLoginDetails() {
    const username = `employee_${Phaser.Math.Between(1000, 9999)}`;
    const time = new Date().toLocaleTimeString();
    const location = this.getRandomLocation();
    const device = this.getRandomDevice();
    // const lastLogin = this.getRandomLastLogin();

    // basic details
    // this.clues.push(`Employee: ${this.employeeName}`);
    this.clues.push(`Username: ${username}`);
    this.clues.push(`Time: ${time}`);
    this.clues.push(`Location: ${location}`);
    this.clues.push(`Device: ${device}`);
    // this.clues.push(`Last Login: ${lastLogin}`);

    // const numClues = Phaser.Math.Between(2, 4);
    const round = (this.scene.registry.get("round") as number) || 1;
    const { real: numReal, neutral: numNeutral } = this.getScaledClueCounts(round);
    // console.log("numReal, numNeutral", numReal, numNeutral);

    if (!this.isLegitimate) {
      this.addRandomClues(this.getImpostorClues(), numReal);
    } else {
      this.addRandomClues(this.getLegitClues(), numReal);
    }
    this.addRandomClues(this.getNeutralClues(), numNeutral);
  }

  private addRandomClues(cluePool: string[], count: number) {
    const availableClues = [...cluePool];

    for (let i = 0; i < count && availableClues.length > 0; i++) {
      const randomIndex = Phaser.Math.Between(0, availableClues.length - 1);
      this.clues.push(availableClues[randomIndex]);
      // Avoid duplicate clues
      availableClues.splice(randomIndex, 1);
    }
  }

  // number of clues increases as number of rounds increase
  private getScaledClueCounts(round: number): { real: number; neutral: number } {
    const clueMultiplierLimit = 2;
    const baseClueCount = Phaser.Math.Between(2, 4);
    const clueMultiplier = Math.min(1 + round / 5, clueMultiplierLimit);
    const totalClues = Math.floor(baseClueCount * clueMultiplier);

    const maxDecoyRatio = 0.5;
    const neutralRatio = Math.min(round / 10, maxDecoyRatio);
    const numNeutral = Math.floor(totalClues * neutralRatio);
    const numReal = totalClues - numNeutral;

    return { real: numReal, neutral: numNeutral };
  }

  private getRandomLocation(): string {
    const locations = [
      "Corporate HQ",
      "Home Office",
      "Remote Workspace",
      "Coffee Shop",
      "Airport Lounge",
      "Co-working Space",
      "Client Site",
    ];
    return locations[Phaser.Math.Between(0, locations.length - 1)];
  }

  private getRandomDevice(): string {
    const devices = [
      "Company Laptop",
      "Personal Desktop",
      "Personal Mobile Device",
      "Work Mobile Device",
      "Tablet",
      "Virtual Machine",
    ];
    return devices[Phaser.Math.Between(0, devices.length - 1)];
  }

  // private getRandomLastLogin(): string {
  //   const times = [
  //     "2 hours ago",
  //     "yesterday",
  //     "this morning",
  //     "4 days ago",
  //     "1 week ago",
  //     "30 minutes ago",
  //     "just now",
  //   ];
  //   return times[Phaser.Math.Between(0, times.length - 1)];
  // }

  private getImpostorClues(): string[] {
    return [
      `VPN detected (unusual for this employee)`,
      `Typing speed unusually ${Phaser.Math.Between(0, 1) ? "fast" : "slow"}`,
      `Failed biometric scan`,
      `Unusual mouse movement patterns`,
      // `Login from ${this.getRandomLocation()} just 5 minutes ago`,
      `Using ${this.getRandomDevice()} which they don't normally use`,
      `Password entered with ${Phaser.Math.Between(0, 1) ? "no" : "many"} typos`,
      `Accessing unusual resources for this role`,
      `Login attempt during non-working hours`,
    ];
  }

  private getLegitClues(): string[] {
    return [
      `Matches typical login behavior`,
      `Biometric verification passed`,
      `Using known device fingerprint`,
      `Typing patterns match employee profile`,
      `Following normal work schedule`,
      `Accessing expected resources for role`,
      `Login during regular working hours`,
    ];
  }

  // add these clues just to throw players off more
  private getNeutralClues(): string[] {
    return [
      "Email client opened after login",
      "Used approved browser",
      "No recent password change",
      "MFA token verified",
    ];
  }

  private createDecisionButtons() {
    this.legitimateButton = this.scene.add
      .rectangle(
        this.scene.cameras.main.centerX - 100,
        this.scene.cameras.main.centerY + 150,
        150,
        50,
        0x00aa00,
      )
      .setInteractive();

    this.legitimateText = this.scene.add
      .text(
        this.scene.cameras.main.centerX - 100,
        this.scene.cameras.main.centerY + 150,
        "Legitimate",
        { color: "#ffffff", fontSize: "18px" },
      )
      .setOrigin(0.5);

    this.legitimateButton.on("pointerdown", () => {
      if (this.isLegitimate) {
        if (this.correctSound) {
          this.correctSound.play();
        }
        this.complete();
      } else {
        if (this.incorrectSound) {
          this.incorrectSound.play();
        }
        this.fail();
      }
    });

    this.impostorButton = this.scene.add
      .rectangle(
        this.scene.cameras.main.centerX + 100,
        this.scene.cameras.main.centerY + 150,
        150,
        50,
        0xaa0000,
      )
      .setInteractive();

    this.impostorText = this.scene.add
      .text(
        this.scene.cameras.main.centerX + 100,
        this.scene.cameras.main.centerY + 150,
        "Impostor!",
        { color: "#ffffff", fontSize: "18px" },
      )
      .setOrigin(0.5);

    this.impostorButton.on("pointerdown", () => {
      if (!this.isLegitimate) {
        if (this.correctSound) {
          this.correctSound.play();
        }
        this.complete();
      } else {
        if (this.incorrectSound) {
          this.incorrectSound.play();
        }
        this.fail();
      }
    });
  }

  cleanup() {
    this.loginDetails?.destroy();
    this.legitimateButton?.destroy();
    this.impostorButton?.destroy();
    this.legitimateText?.destroy();
    this.impostorText?.destroy();
    this.header?.destroy();

    super.cleanup();
  }
}
