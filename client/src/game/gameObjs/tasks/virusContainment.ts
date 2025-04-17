import { Task } from "./task";
import { Scene } from "phaser";

export class VirusContainment extends Task {
  private files: { name: string; description: string; isInfected: boolean }[];
  private currentFileIndex: number;
  private quarantineBox: Phaser.GameObjects.Sprite;
  private safeArea: Phaser.GameObjects.Sprite;
  private fileObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
  private fileObjectStartingPos = { x: 650, y: 310 };
  private errorCount: number = 0;
  private maxErrors: number = 2;
  private score: number = 0;
  private maxScore: number = 2;
  private fileText: Phaser.GameObjects.Text;
  private quarantineBoxText: Phaser.GameObjects.Text;
  private safeAreaText: Phaser.GameObjects.Text;
  private correctSound: Phaser.Sound.BaseSound;
  private incorrectSound: Phaser.Sound.BaseSound;

  private isObfuscated: boolean;

  private instructionsText: Phaser.GameObjects.Text;

  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
    this.createBlockingOverlay();
    this.files = [
      { name: "File1", description: "High CPU usage detected.", isInfected: true },
      { name: "File2", description: "Routine system log file.", isInfected: false },
      { name: "File3", description: "Unusual network activity observed.", isInfected: true },
      { name: "File4", description: "Backup file created last night.", isInfected: false },
      { name: "File5", description: "Encrypted content, source unknown.", isInfected: true },
      { name: "File6", description: "User-generated document.", isInfected: false },
      { name: "File7", description: "Suspicious file extension.", isInfected: true },
      { name: "File8", description: "System update package.", isInfected: false },
      { name: "File9", description: "Contains macros from an unknown sender.", isInfected: true },
      {
        name: "File10",
        description: "Media file downloaded from a trusted source.",
        isInfected: false,
      },
      {
        name: "File11",
        description: "Executable file with no digital signature.",
        isInfected: true,
      },
      {
        name: "File12",
        description: "Configuration file for a trusted application.",
        isInfected: false,
      },
      { name: "File13", description: "File size has unexpectedly increased.", isInfected: true },
      { name: "File14", description: "Temporary cache file.", isInfected: false },
      {
        name: "File15",
        description: "File accessed by multiple unknown processes.",
        isInfected: true,
      },
      { name: "File16", description: "Readme file from a verified developer.", isInfected: false },
      { name: "File17", description: "File contains obfuscated code.", isInfected: true },
      { name: "File18", description: "Log file from a trusted service.", isInfected: false },
      { name: "File19", description: "File has been flagged by the system.", isInfected: true },
      {
        name: "File20",
        description: "File is part of a verified software package.",
        isInfected: false,
      },
    ];
  }

  async preload(): Promise<void> {
    return new Promise((resolve) => {
      if (this.scene.textures.exists("fileIcon")) {
        resolve();
        return;
      }
      this.scene.load.image("fileIcon", "/assets/file2.png");
      this.scene.load.image("box", "/assets/box.png");
      this.scene.load.image("quarantine", "/assets/trash-can.png");
      this.scene.load.on("complete", () => {
        console.log("File icon loaded successfully");
        resolve();
      });
      this.scene.load.on("loaderror", (fileObj: any) => {
        console.error("Error loading file:", fileObj.src);
        resolve();
      });
      this.scene.load.audio("correct", "/assets/correctsoundeffect.mp3");
      this.scene.load.audio("incorrect", "/assets/wrongsoundeffect.mp3");
      this.scene.load.start();
    });
  }

  async start(): Promise<void> {
    await this.preload();
    this.showInstructions();

    this.correctSound = this.scene.sound.add("correct");
    this.incorrectSound = this.scene.sound.add("incorrect");
    // const blackBox = this.scene.add.rectangle(650, 20, 550, 40, 0x000000).setOrigin(0.5, 0);

    // this.scene.add.text(650, 25, "Your Task: Virus Containment", {
    //   color: "#ffffff",
    //   fontSize: "30px",
    //   fontStyle: "bold",
    // }).setOrigin(0.5, 0);

    // Replace rectangles with images
    this.quarantineBox = this.scene.add
      .sprite(400, 600, "quarantine")
      .setInteractive()
      .setScale(0.48);

    this.safeArea = this.scene.add.sprite(900, 600, "box").setInteractive().setScale(0.48);

    if (!this.quarantineBox || !this.safeArea) {
      console.error("Failed to load quarantine or safe area images");
    }

    if (this.quarantineBox.input === null || this.safeArea.input === null) {
      console.error("Input is null for quarantine or safe area");
    }

    // increase hit box size
    this.quarantineBox.input.hitArea.setTo(
      -50,
      -50,
      this.quarantineBox.width + 100,
      this.quarantineBox.height + 100,
    );

    this.safeArea.input.hitArea.setTo(
      -50,
      -50,
      this.safeArea.width + 100,
      this.safeArea.height + 100,
    );

    this.quarantineBoxText = this.scene.add.text(340, 580, "Quarantine", {
      color: "#ffffff",
      fontSize: "20px",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2,
    });

    this.safeAreaText = this.scene.add.text(845, 580, "Safe Area", {
      color: "#ffffff",
      fontSize: "20px",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2,
    });

    this.currentFileIndex = Math.floor(Math.random() * this.files.length);
    this.spawnFile(this.currentFileIndex);
  }

  spawnFile(fileIdx: number): void {
    const currentFile = this.files[fileIdx];
    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    if (this.scene.textures.exists("fileIcon")) {
      this.fileObject = this.scene.add
        .sprite(centerX, centerY - 50, "fileIcon")
        .setInteractive({ draggable: true })
        .setScale(0.4)
        .setDepth(1);
    } else {
      // Use a rectangle as a placeholder
      this.fileObject = this.scene.add
        .sprite(centerX, centerY - 50, "fileIcon")
        .setInteractive({ draggable: true })
        .setScale(0.4)
        .setDepth(1);
    }

    this.updateDifficultyChances();
    // this.isObfuscated = true;

    const fileDesc = currentFile.description;

    this.fileText = this.scene.add
      .text(centerX, centerY + 50, fileDesc, {
        color: "#ffffff",
        align: "center",
        stroke: "#000000",
        strokeThickness: 1,
      })
      .setOrigin(0.5);

    if (this.isObfuscated) {
      const obfuscatedText = this.obfuscateText(currentFile.description);
      this.fileText.setText(obfuscatedText);
      this.fileText.setAlpha(0.8);
      this.scene.tweens.add({
        targets: this.fileText,
        alpha: { from: 1, to: 0.6 },
        duration: 2000,
        yoyo: true,
        // repeat: -1,
      });
      // this.scene.tweens.add({
      //   targets: this.fileText,
      //   x: { from: this.fileText.x - 1, to: this.fileText.x + 1 },
      //   duration: 100,
      //   yoyo: true,
      //   repeat: -1,
      // });
      this.scene.time.delayedCall(2000, () => {
        this.fileText.setText(fileDesc);
      });
    }

    this.fileObject.on("drag", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      this.fileObject.x = dragX;
      this.fileObject.y = dragY;
    });

    this.fileObject.on("destroy", () => {
      // ensure drag event is removed when object is destroyed to prevent dupes
      this.fileObject.off("drag");
    });

    this.fileObject.on("dragend", (pointer: Phaser.Input.Pointer) => {
      const bounds = this.fileObject.getBounds();
      const quarantineBounds = this.quarantineBox.getBounds();
      const safeBounds = this.safeArea.getBounds();

      // Check for intersection instead of point containment
      if (Phaser.Geom.Rectangle.Overlaps(bounds, quarantineBounds)) {
        this.handleFileDrop(currentFile, true);
      } else if (Phaser.Geom.Rectangle.Overlaps(bounds, safeBounds)) {
        this.handleFileDrop(currentFile, false);
      } else {
        // Reset position if dropped outside
        this.fileObject.setPosition(this.fileObjectStartingPos.x, this.fileObjectStartingPos.y);
      }
    });
  }

  handleFileDrop(
    file: { name: string; description: string; isInfected: boolean },
    droppedInQuarantine: boolean,
  ): void {
    console.log("Drop detected:", {
      x: this.fileObject.x,
      y: this.fileObject.y,
      quarantineBounds: this.quarantineBox.getBounds(),
      safeBounds: this.safeArea.getBounds(),
      zone: droppedInQuarantine ? "quarantine" : "safe",
    });

    if ((file.isInfected && droppedInQuarantine) || (!file.isInfected && !droppedInQuarantine)) {
      // Correct choice
      console.log("Correct choice");
      if (this.correctSound) {
        this.correctSound.play();
        console.log("Playing correct sound");
      }
      this.score++;
      if (this.score >= this.maxScore) {
        this.complete();
        return;
      }
      this.currentFileIndex = Math.floor(Math.random() * this.files.length);
      this.fileObject.destroy();
      this.fileText.destroy();
      this.spawnFile(this.currentFileIndex);
    } else {
      // Incorrect choice
      this.errorCount++;
      console.log("Incorrect choice");
      if (this.incorrectSound) {
        this.incorrectSound.play();
        console.log("Playing incorrect sound");
      }
      if (this.errorCount >= this.maxErrors) {
        this.fail();
        return;
      }
      this.currentFileIndex = Math.floor(Math.random() * this.files.length);
      this.fileObject.destroy();
      this.fileText.destroy();
      this.spawnFile(this.currentFileIndex);
    }
  }

  update(): void {}

  cleanup(): void {
    super.cleanup();
    this.fileObject?.destroy();
    this.fileText?.destroy();
    this.quarantineBox.destroy();
    this.safeArea.destroy();
    this.quarantineBoxText.destroy();
    this.safeAreaText.destroy();
  }

  private showInstructions() {
    this.instructionsText = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2 - 300,
        "Instructions: Determine if the file is infected or not.\nDrag it to the appropriate area.",
        {
          fontSize: "24px",
          color: "#ffffff",
          align: "center",
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5);
  }

  private updateDifficultyChances() {
    const currentRound = (this.scene.registry.get("round") as number) || 1;
    const maxObsfuscationProb = 0.5;
    const roundMultiplier = 0.05;
    const obsfucationProb = Math.min(maxObsfuscationProb, roundMultiplier * currentRound);
    this.isObfuscated = Math.random() < obsfucationProb;
  }

  private obfuscateText(text: string): string {
    return text
      .split("")
      .map((char) => (char !== " " ? Math.floor(Math.random() * 10).toString() : " "))
      .join("");
  }
}
