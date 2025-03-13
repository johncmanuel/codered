import { Task } from "./task";
import { Scene, GameObjects, Input } from "phaser";

interface Device {
  name: string;
  color: number;
  x: number;
  y: number;
  graphic: GameObjects.Image | GameObjects.Rectangle;
}

interface Wire {
  color: number;
  x: number;
  y: number;
  rect: GameObjects.Rectangle;
  isConnected: boolean;
  line: GameObjects.Line | null;
}

export class NetworkMapping extends Task {
  private devices: Device[];
  private wires: Wire[];
  private mistakes: number = 0;
  private maxMistakes: number = 2;

  // Default thickness for the wires
  private wireThickness: number = 4;

  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
    this.devices = [];
    this.wires = [];
  }

  start(): void {
    this.initializeDevices();
    this.initializeWires();

    this.wires.forEach((wire) => {
      wire.rect.setInteractive();
      this.scene.input.setDraggable(wire.rect);
    });

    this.scene.input.on(
      "dragstart",
      (pointer: Input.Pointer, gameObject: GameObjects.Rectangle) => {
        const wire = this.wires.find((w) => w.rect === gameObject);
        if (wire) {
          wire.line = this.scene.add.line(0, 0, wire.x, wire.y, pointer.x, pointer.y, wire.color);
          wire.line.setLineWidth(this.wireThickness);
        }
      },
    );

    this.scene.input.on("drag", (pointer: Input.Pointer, gameObject: GameObjects.Rectangle) => {
      const wire = this.wires.find((w) => w.rect === gameObject);
      if (wire && wire.line) {
        wire.line.setTo(wire.x, wire.y, pointer.x, pointer.y);
      }
    });

    this.scene.input.on("dragend", (pointer: Input.Pointer, gameObject: GameObjects.Rectangle) => {
      const wire = this.wires.find((w) => w.rect === gameObject);
      if (!wire) return;
      // Remove the line when dragging ends
      if (wire.line) {
        wire.line.destroy();
        wire.line = null;
      }
      this.handleDrop(gameObject, pointer);
    });
  }

  update(): void {
    if (this.isCompleted || this.isFailed) return;

    if (this.mistakes >= this.maxMistakes) {
      this.fail();
    } else if (this.wires.every((wire) => wire.isConnected)) {
      this.complete();
    }
  }

  cleanup(): void {
    super.cleanup();
  }

  private initializeDevices(): void {
    this.devices = [
      this.createDevice("Router", 0xff0000, 100, 100, "router"),
      this.createDevice("Server", 0x00ff00, 300, 100, "server"),
      this.createDevice("Computer", 0x0000ff, 500, 100, "computer"),
    ];
  }

  private createDevice(
    name: string,
    color: number,
    x: number,
    y: number,
    textureKey: string,
  ): Device {
    let graphic: GameObjects.Image | GameObjects.Rectangle;

    if (this.scene.textures.exists(textureKey)) {
      graphic = this.scene.add.image(x, y, textureKey);
    } else {
      graphic = this.scene.add.rectangle(x, y, 80, 60, color);
      // add a border around the rectangle
      graphic.setStrokeStyle(2, 0x000000);
    }

    return { name, color, x, y, graphic };
  }

  private initializeWires(): void {
    this.wires = [
      {
        color: 0xff0000,
        x: 100,
        y: 300,
        rect: this.createWireRectangle(100, 300, 0xff0000),
        isConnected: false,
        line: null,
      },
      {
        color: 0x00ff00,
        x: 300,
        y: 300,
        rect: this.createWireRectangle(300, 300, 0x00ff00),
        isConnected: false,
        line: null,
      },
      {
        color: 0x0000ff,
        x: 500,
        y: 300,
        rect: this.createWireRectangle(500, 300, 0x0000ff),
        isConnected: false,
        line: null,
      },
    ];
  }

  private createWireRectangle(x: number, y: number, color: number): GameObjects.Rectangle {
    const rect = this.scene.add
      .rectangle(x, y, 80, 40, color)
      .setInteractive()
      .setData("color", color);
    return rect;
  }

  private handleDrop(
    wireRect: GameObjects.Rectangle | GameObjects.Line,
    mousePtr: Input.Pointer,
  ): void {
    const wire = this.wires.find((w) => w.rect === wireRect);
    if (!wire) return;

    const device = this.devices.find((d) => this.isPointerOverDevice(mousePtr, d.graphic));
    console.log("device", device);
    console.log("this.devices", this.devices);
    if (!device) return;
    if (wire.color === device.color) {
      wire.isConnected = true;
      wireRect.disableInteractive();
      // Snap to device
      // TODO: Fix the silly placement
      wireRect.setPosition(device.x, device.y);

      // draw permanent line to represent connected wire
      const line = this.scene.add.line(0, 0, wire.x, wire.y, device.x, device.y, wire.color);
      line.setLineWidth(this.wireThickness);
    } else {
      this.mistakes++;
      console.log(`Mistake ${this.mistakes}/${this.maxMistakes}`);
    }
  }

  private isPointerOverDevice(
    pointer: Input.Pointer,
    deviceGraphic: GameObjects.Image | GameObjects.Rectangle,
  ): boolean {
    const deviceBounds = deviceGraphic.getBounds();
    return deviceBounds.contains(pointer.x, pointer.y);
  }
}
