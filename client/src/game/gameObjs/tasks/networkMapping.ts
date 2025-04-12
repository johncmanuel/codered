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
  rect: GameObjects.Image;
  isConnected: boolean;
  line: GameObjects.Line | null;
}

export class NetworkMapping extends Task {
  private devices: Device[] = [];
  private wires: Wire[] = [];
  private mistakes: number = 0;
  private maxMistakes: number = 2;
  private instructionText: Phaser.GameObjects.Text | null = null;
  private computer: Phaser.GameObjects.Image | null = null;
  private router: Phaser.GameObjects.Image | null = null;
  private server: Phaser.GameObjects.Image | null = null;
  private wireThickness: number = 4;
  private initializationComplete: boolean = false;

  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
    this.createBlockingOverlay();
    this.devices = [];
    this.wires = [];
    this.computer = null;
    this.router = null;
    this.server = null;
  }

  async preload(): Promise<void> {
    if (this.scene.textures.exists("computer") && 
        this.scene.textures.exists("router") && 
        this.scene.textures.exists("server")) {
      return Promise.resolve();
    }
    
    return new Promise((resolve) => {
      if (!this.scene.textures.exists("computer")) {
        this.scene.load.image("computer", "/assets/computer.png");
      }
      
      if (!this.scene.textures.exists("router")) {
        this.scene.load.image("router", "/assets/router.png");
      }
      
      if (!this.scene.textures.exists("server")) {
        this.scene.load.image("server", "/assets/server.png");
      }
      
      const needsLoading = !this.scene.textures.exists("computer") || 
                          !this.scene.textures.exists("router") || 
                          !this.scene.textures.exists("server");
      
      if (needsLoading) {
        this.scene.load.once("complete", () => {
          console.log("All assets loaded successfully");
          resolve();
        });
        this.scene.load.start();
      } else {
        resolve(); 
      }
    });
  }

  async start(): Promise<void> {
    console.log("NetworkMapping task starting");
    await this.preload();
    console.log("Checking textures:");
    console.log("computer texture exists:", this.scene.textures.exists("computer"));
    console.log("router texture exists:", this.scene.textures.exists("router"));
    console.log("server texture exists:", this.scene.textures.exists("server"));
    
    this.addBackground();
    
    this.initializeDevices();
    this.initializeWires();

    this.instructionText = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        20,
        "Drag the smaller devices to the correct devices to connect them.",
        {
          fontFamily: "AudioWide",
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
      (pointer: Input.Pointer, gameObject: GameObjects.Image) => {
        const wire = this.wires.find((w) => w.rect === gameObject);
        if (wire) {
          wire.line = this.scene.add.line(0, 0, wire.x, wire.y, pointer.x, pointer.y, wire.color);
          wire.line.setLineWidth(this.wireThickness);
        }
      },
    );

    this.scene.input.on("drag", (pointer: Input.Pointer, gameObject: GameObjects.Image) => {
      const wire = this.wires.find((w) => w.rect === gameObject);
      if (wire && wire.line) {
        wire.line.setTo(wire.x, wire.y, pointer.x, pointer.y);
      }
    });

    this.scene.input.on("dragend", (pointer: Input.Pointer, gameObject: GameObjects.Image) => {
      const wire = this.wires.find((w) => w.rect === gameObject);
      if (!wire || !wire.line) return;
      this.handleDrop(wire, pointer);
    });

    this.initializationComplete = true;
  }

  update(): void {
    if (this.isCompleted || this.isFailed || !this.initializationComplete) return;

    if (this.mistakes >= this.maxMistakes) {
      this.fail();
    } else if (this.wires.length > 0 && this.wires.every((wire) => wire.isConnected)) {
      this.complete();
    }
  }

  complete(): void {
    console.log("NetworkMapping task completing");
    super.complete();
  }

  cleanup(): void {
    console.log("NetworkMapping task cleaning up");
    try {
      super.cleanup();
      
      if (this.computer) this.computer.destroy();
      if (this.router) this.router.destroy();
      if (this.server) this.server.destroy();
      
      if (this.devices && this.devices.length) {
        this.devices.forEach(device => {
          if (device && device.graphic) {
            if (device.graphic === this.computer || 
                device.graphic === this.router || 
                device.graphic === this.server) {
              return;
            }
            device.graphic.destroy();
          }
        });
      }
      
      if (this.wires && this.wires.length) {
        this.wires.forEach(wire => {
          if (wire) {
            if (wire.rect) wire.rect.destroy();
            if (wire.line) wire.line.destroy();
          }
        });
      }
      
      if (this.instructionText) this.instructionText.destroy();
      
      console.log("NetworkMapping cleanup completed successfully");
    } catch (error) {
      console.error("Error during NetworkMapping cleanup:", error);
    }
  }
  
  private addBackground(): void {
    this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 4,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height / 2,
      0x111122,
      0.3
    );
    
    this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height * 3/4,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height / 2,
      0x221111,
      0.3
    );
  }

  private getRandomPosition(isDevice: boolean): { x: number, y: number } {
    const minX = 100;
    const maxX = this.scene.cameras.main.width - 100;
    
    let minY, maxY;
    
    if (isDevice) {
      minY = 80;
      maxY = this.scene.cameras.main.height / 2 - 50;
    } else {
      minY = this.scene.cameras.main.height / 2 + 50;
      maxY = this.scene.cameras.main.height - 100;
    }
    
    // Generate random x,y coordinates
    const x = Phaser.Math.Between(minX, maxX);
    const y = Phaser.Math.Between(minY, maxY);
    
    return { x, y };
  }

  private initializeDevices(): void {
    const devicePositions: { x: number, y: number }[] = [];
    
    for (let i = 0; i < 3; i++) {
      let position;
      let tooClose;
      
      do {
        position = this.getRandomPosition(true); // true for device
        tooClose = devicePositions.some(pos => 
          Phaser.Math.Distance.Between(position.x, position.y, pos.x, pos.y) < 100
        );
      } while (tooClose);
      
      devicePositions.push(position);
    }
    
    this.devices = [
      this.createDevice("Router", 0xff0000, devicePositions[0].x, devicePositions[0].y, "router"),
      this.createDevice("Server", 0x00ff00, devicePositions[1].x, devicePositions[1].y, "server"),
      this.createDevice("Computer", 0x0000ff, devicePositions[2].x, devicePositions[2].y, "computer")
    ];
    
    // After creating devices, assign references to individual images for easier access
    const routerDevice = this.devices.find(d => d.name === "Router");
    const serverDevice = this.devices.find(d => d.name === "Server");
    const computerDevice = this.devices.find(d => d.name === "Computer");
    
    if (routerDevice) this.router = routerDevice.graphic as GameObjects.Image;
    if (serverDevice) this.server = serverDevice.graphic as GameObjects.Image;
    if (computerDevice) this.computer = computerDevice.graphic as GameObjects.Image;
  }

  private createDevice(
    name: string,
    color: number,
    x: number,
    y: number,
    textureKey: string
  ): Device {
    try {
      let graphic: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
      
      if (this.scene.textures.exists(textureKey)) {
        graphic = this.scene.add.image(x, y, textureKey).setOrigin(0.5, 0.5).setScale(0.2);
        console.log(`Created ${name} with texture ${textureKey}`);
      } else {
        console.warn(`Texture ${textureKey} not found, using fallback rectangle`);
        graphic = this.scene.add.rectangle(x, y, 80, 60, color);
      }
      
      return { name, color, x, y, graphic };
    } catch (error) {
      console.error(`Error creating device ${name}:`, error);
      const fallbackGraphic = this.scene.add.rectangle(x, y, 80, 60, color);
      return { name, color, x, y, graphic: fallbackGraphic };
    }
  }

  private initializeWires(): void {
    // Create an array to store wire positions to avoid overlap
    const wirePositions: { x: number, y: number }[] = [];
    
    // Get three random positions for wires
    for (let i = 0; i < 3; i++) {
      let position;
      let tooClose;
      
      do {
        position = this.getRandomPosition(false); // false for wire
        tooClose = wirePositions.some(pos => 
          Phaser.Math.Distance.Between(position.x, position.y, pos.x, pos.y) < 100
        );
      } while (tooClose);
      
      wirePositions.push(position);
    }
    
    // Create wires at random positions
    this.wires = [
      {
        color: 0xff0000,
        x: wirePositions[0].x,
        y: wirePositions[0].y,
        rect: this.createWireConnector(wirePositions[0].x, wirePositions[0].y, 0xff0000, "router"),
        isConnected: false,
        line: null,
      },
      {
        color: 0x00ff00,
        x: wirePositions[1].x,
        y: wirePositions[1].y,
        rect: this.createWireConnector(wirePositions[1].x, wirePositions[1].y, 0x00ff00, "server"),
        isConnected: false,
        line: null,
      },
      {
        color: 0x0000ff,
        x: wirePositions[2].x,
        y: wirePositions[2].y,
        rect: this.createWireConnector(wirePositions[2].x, wirePositions[2].y, 0x0000ff, "computer"),
        isConnected: false,
        line: null,
      },
    ];
  }

  private createWireConnector(x: number, y: number, color: number, textureKey: string): GameObjects.Image {
    const connector = this.scene.add
      .image(x, y, textureKey)
      .setInteractive()
      .setData("color", color)
      .setScale(0.12)  // Smaller scale than destination devices
    
    this.scene.tweens.add({
      targets: connector,
      scale: connector.scale * 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    return connector;
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

      // then snap to device
      const snappedPoint = this.getSnappedPoint(wire, device);
      if (wire.line) {
        // draw permanent line to represent connected wire
        wire.line.setTo(wire.x, wire.y, snappedPoint.x, snappedPoint.y);
      }
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
