import { Task } from "./task";
import { Scene } from "phaser";

export class VirusContainment extends Task {
  private files: { name: string; description: string; isInfected: boolean }[];
  private currentFileIndex: number;
  private quarantineBox: Phaser.GameObjects.Rectangle;
  private safeArea: Phaser.GameObjects.Rectangle;
  private fileObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
  private fileObjectStartingPos = { x: 250, y: 100 };
  private errorCount: number = 0;
  private maxErrors: number = 2;
  private score: number = 0;
  private maxScore: number = 2;
  private fileText: Phaser.GameObjects.Text;
  private quarantineBoxText: Phaser.GameObjects.Text;
  private safeAreaText: Phaser.GameObjects.Text;

  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
    this.files = [
      { name: "File1", description: "File Description: High CPU usage detected.", isInfected: true },
      { name: "File2", description: "File Description: Routine system log file.", isInfected: false },
      { name: "File3", description: "File Description: Unusual network activity observed.", isInfected: true },
      { name: "File4", description: "File Description: Backup file created last night.", isInfected: false },
      { name: "File5", description: "File Description: Encrypted content, source unknown.", isInfected: true },
      { name: "File6", description: "File Description: User-generated document.", isInfected: false },
      { name: "File7", description: "File Description: Suspicious file extension.", isInfected: true },
      { name: "File8", description: "File Description: System update package.", isInfected: false },
      { name: "File9", description: "File Description: Contains macros from an unknown sender.", isInfected: true },
      {
        name: "File10",
        description: "File Description: Media file downloaded from a trusted source.",
        isInfected: false,
      },
      {
        name: "File11",
        description: "File Description: Executable file with no digital signature.",
        isInfected: true,
      },
      {
        name: "File12",
        description: "File Description: Configuration file for a trusted application.",
        isInfected: false,
      },
      { name: "File13", description: "File Description: File size has unexpectedly increased.", isInfected: true },
      { name: "File14", description: "File Description: Temporary cache file.", isInfected: false },
      {
        name: "File15",
        description: "File Description: File accessed by multiple unknown processes.",
        isInfected: true,
      },
      { name: "File16", description: "File Description: Readme file from a verified developer.", isInfected: false },
      { name: "File17", description: "File Description: File contains obfuscated code.", isInfected: true },
      { name: "File18", description: "File Description: Log file from a trusted service.", isInfected: false },
      { name: "File19", description: "File Description: File has been flagged by the system.", isInfected: true },
      {
        name: "File20",
        description: "File Description: File is part of a verified software package.",
        isInfected: false,
      },
    ];
  }

  preload() {
    // Fix file path
    this.scene.load.image("fileIcon", "/assets/file.png");
  }

  start(): void {
    const blackBox = this.scene.add.rectangle(600, 20, 550, 40, 0x000000).setOrigin(0.5, 0);

    this.scene.add.text(600, 25, "Your Task: Virus Containment", { 
      color: "#ffffff",
      fontSize: "30px",
      fontStyle: "bold", 
    }).setOrigin(0.5, 0);  

    this.quarantineBox = this.scene.add.rectangle(100, 300, 150, 100, 0xff0000).setInteractive();
    this.safeArea = this.scene.add.rectangle(400, 300, 150, 100, 0x00ff00).setInteractive();

    this.quarantineBoxText = this.scene.add.text(50, 250, "Quarantine", { color: "#ffffff" });
    this.safeAreaText = this.scene.add.text(350, 250, "Safe Area", { color: "#ffffff" });

    this.currentFileIndex = Math.floor(Math.random() * this.files.length);
    this.spawnFile(this.currentFileIndex);
  }

  spawnFile(fileIdx: number): void {
    const currentFile = this.files[fileIdx];

    if (this.scene.textures.exists("fileIcon")) {
      // TODO: find a good file icon image lol
      this.fileObject = this.scene.add
        .sprite(this.fileObjectStartingPos.x, this.fileObjectStartingPos.y, "fileIcon")
        .setInteractive({ draggable: true });
    } else {
      // Use a rectangle as a placeholder
      this.fileObject = this.scene.add
        .sprite(this.fileObjectStartingPos.x, this.fileObjectStartingPos.y, 'fileIcon')
        .setInteractive({ draggable: true });
    }
    this.fileText = this.scene.add.text(200, 150, currentFile.description, { color: "#000000" });

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
