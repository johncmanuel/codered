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
  private instructionText: GameObjects.Text;

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

    this.instructionText = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        20, // 20 pixels from the top
        "Drag the wires to connect them to the correct devices.",
        {
          fontFamily: "Arial",
          fontSize: "24px",
          color: "#ffffff",
          align: "center",
          backgroundColor: "#000000",
          padding: { x: 10, y: 5 },
        },
      )
      .setOrigin(0.5, 0);

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
      if (!wire || !wire.line) return;
      this.handleDrop(wire, pointer);
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
    this.devices.forEach((device) => device.graphic.destroy());
    this.wires.forEach((wire) => {
      wire.rect.destroy();
      if (wire.line) wire.line.destroy();
    });
    this.instructionText.destroy();
  }

  private initializeDevices(): void {
    this.devices = [
      this.createDevice("Router", 0xff0000, 100, 100, "router"),
      this.createDevice("Server", 0x00ff00, 600, 100, "server"),
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
    const width = 40;
    const height = 40;
    const rect = this.scene.add
      .rectangle(x, y, width, height, color)
      .setInteractive()
      .setData("color", color);
    return rect;
  }

  // check if wire and device are overlapping
  private handleDrop(wire: Wire, mousePtr: Input.Pointer): void {
    const device = this.devices.find((d) => this.isPointerOverDevice(mousePtr, d.graphic));
    console.log("device", device);
    console.log("this.devices", this.devices);
    if (!device) {
      if (wire.line) {
        wire.line.destroy();
        wire.line = null;
      }
      return;
    }
    if (wire.color === device.color) {
      wire.isConnected = true;
      wire.rect.disableInteractive();

      // wireRect.setPosition(device.x, device.y);
      // then snap to device
      const snappedPoint = this.getSnappedPoint(wire, device);
      if (wire.line) {
        // draw permanent line to represent connected wire
        wire.line.setTo(wire.x, wire.y, snappedPoint.x, snappedPoint.y);
      }
      // const line = this.scene.add.line(0, 0, wire.x, wire.y, device.x, device.y, wire.color);
      // line.setLineWidth(this.wireThickness);
    } else {
      this.mistakes++;
      console.log(`Mistake ${this.mistakes}/${this.maxMistakes}`);
      if (!wire.line) return;
      wire.line.destroy();
      wire.line = null;
    }
  }

  private isPointerOverDevice(
    pointer: Input.Pointer,
    deviceGraphic: GameObjects.Image | GameObjects.Rectangle,
  ): boolean {
    const deviceBounds = deviceGraphic.getBounds();
    return deviceBounds.contains(pointer.x, pointer.y);
  }

  private getSnappedPoint(wire: Wire, device: Device): { x: number; y: number } {
    const deviceBounds = device.graphic.getBounds();

    // get the midpoint of the device's sides
    const left = { x: deviceBounds.left, y: deviceBounds.centerY };
    const right = { x: deviceBounds.right, y: deviceBounds.centerY };
    const top = { x: deviceBounds.centerX, y: deviceBounds.top };
    const bottom = { x: deviceBounds.centerX, y: deviceBounds.bottom };

    // compute distances from the wire's origin to each side of the device
    const distances = [
      { point: left, distance: Phaser.Math.Distance.Between(wire.x, wire.y, left.x, left.y) },
      { point: right, distance: Phaser.Math.Distance.Between(wire.x, wire.y, right.x, right.y) },
      { point: top, distance: Phaser.Math.Distance.Between(wire.x, wire.y, top.x, top.y) },
      { point: bottom, distance: Phaser.Math.Distance.Between(wire.x, wire.y, bottom.x, bottom.y) },
    ];

    // then compute the closest side of the device when the wire is snapped
    const closestSide = distances.reduce((prev, curr) =>
      curr.distance < prev.distance ? curr : prev,
    );

    return closestSide.point;
  }
}
