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
        // Still need to find better file image
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
    this.correctSound = this.scene.sound.add("correct");
    this.incorrectSound = this.scene.sound.add("incorrect");
    const blackBox = this.scene.add.rectangle(650, 20, 550, 40, 0x000000).setOrigin(0.5, 0);

    this.scene.add.text(650, 25, "Your Task: Virus Containment", { 
      color: "#ffffff",
      fontSize: "30px",
      fontStyle: "bold", 
    }).setOrigin(0.5, 0);  

    // Replace rectangles with images
    this.quarantineBox = this.scene.add.sprite(400, 600, "quarantine")
      .setInteractive()
      .setScale(0.5);

    this.safeArea = this.scene.add.sprite(900, 600, "box")
      .setInteractive()
      .setScale(0.5);

    this.quarantineBoxText = this.scene.add.text(340, 580, "Quarantine", { 
      color: "#ffffff",
      fontSize: "20px",
      fontStyle: "bold",
      stroke: '#000000',        
      strokeThickness: 2
    });

    this.safeAreaText = this.scene.add.text(845, 580, "Safe Area", { 
      color: "#ffffff",
      fontSize: "20px",
      fontStyle: "bold",
      stroke: '#000000',        
      strokeThickness: 2
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
        .sprite(centerX, centerY - 50, 'fileIcon')
        .setInteractive({ draggable: true })
        .setScale(0.4)
        .setDepth(1);
    }
    
    this.fileText = this.scene.add.text(centerX, centerY + 50, currentFile.description, { 
      color: "#000000",
      align: 'center',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5); 
    
    this.fileObject.on("drag", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      this.fileObject.x = dragX;
      this.fileObject.y = dragY;
    });

    this.fileObject.on("destroy", () => {
      // ensure drag event is removed when object is destroyed to prevent dupes
      this.fileObject.off("drag");
    });

    // prevent duplicate listeners
    if (this.scene.input.listeners("dragend").length > 0) return;
    console.log("Adding dragend listener");

    this.scene.input.on(
      "dragend",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle,
      ) => {
        if (this.quarantineBox.getBounds().contains(gameObject.x, gameObject.y)) {
          this.handleFileDrop(currentFile, true);
        } else if (this.safeArea.getBounds().contains(gameObject.x, gameObject.y)) {
          this.handleFileDrop(currentFile, false);
        } else {
          // Reset position if dropped outside
          gameObject.setPosition(this.fileObjectStartingPos.x, this.fileObjectStartingPos.y);
        }
      },
    );
  }

  handleFileDrop(
    file: { name: string; description: string; isInfected: boolean },
    droppedInQuarantine: boolean,
  ): void {
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
}
