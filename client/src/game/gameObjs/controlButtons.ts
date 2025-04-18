import { Scene, GameObjects } from "phaser";

export class ControlButtons {
  private scene: Scene;
  private buttons: GameObjects.Text[];
  private playerControls: Set<string>;
  private buttonWidthPx: number = 250;
  private buttonHeightPx: number = 60;
  private padding: number = 100;
  private columns: number = 2;
  private buttonImages: GameObjects.Image[] = [];
  private normalButtonColor: string = "#0000ff";
  private hoverButtonColor: string = "#000080";

  constructor(scene: Scene) {
    this.scene = scene;
    this.buttons = [];
    this.playerControls = new Set();
  }

  getButtons() {
    return this.buttons;
  }

  setPlayerControls(controls: Set<string>) {
    this.playerControls = controls;
  }

  // TODO: make each control button unique given the task.control
  show() {
    if (this.playerControls.size <= 0) {
      console.error("No controls assigned to player");
      return;
    }
    // get the number of rows needed based on the number of controls and columns
    const numControls = this.playerControls.size;
    const rows = Math.ceil(numControls / this.columns);
    const startX =
      (this.scene.cameras.main.width -
        (this.columns * this.buttonWidthPx + (this.columns - 1) * this.padding)) /
      2;

    const startY =
      this.scene.cameras.main.height -
      (rows * this.buttonHeightPx + (rows - 1) * this.padding) -
      20;

    let index = 0;
    this.playerControls.forEach((control) => {
      const row = Math.floor(index / this.columns);
      const col = index % this.columns;

      const x = startX + col * (this.buttonWidthPx + this.padding);
      const y = startY + row * (this.buttonHeightPx + this.padding);

      const image = this.scene.add.image(x, y, "exe");

      const scale = Math.min(
        (this.buttonWidthPx / image.width) * 3,
        (this.buttonHeightPx / image.height) * 2.3,
      );
      image.setDepth(0);
      image.setScale(scale);
      this.buttonImages.push(image);

      const button = this.scene.add
        .text(x, y, control, {
          fontFamily: "Audiowide",
          fontSize: "16px",
          color: "#ffffff",
          stroke: "black",
          strokeThickness: 2,
          backgroundColor: this.normalButtonColor,
          padding: { x: 10, y: 10 },
        })
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true })
        .setData("control", control);

      button.on("pointerover", () => {
        button.setStyle({ backgroundColor: this.hoverButtonColor });
        button.setScale(1.05);
      });

      button.on("pointerout", () => {
        button.setStyle({ backgroundColor: this.normalButtonColor });
        button.setScale(1.0);
      });

      button.on("pointerdown", () => {
        this.handleClickOnBtn(control);
      });

      button.setVisible(true);

      this.buttons.push(button);
      index++;
    });
  }

  disableBtn(btnIdx: number) {
    if (btnIdx < 0 || btnIdx >= this.buttons.length) {
      console.error("Button index out of range");
      return;
    }
    const button = this.buttons[btnIdx];
    button.setInteractive(false);
    button.off("pointerdown");
    button.off("pointerover");
    button.off("pointerout");
    button.setStyle({ backgroundColor: "#666666" });
  }

  enableBtn(btnIdx: number) {
    if (btnIdx < 0 || btnIdx >= this.buttons.length) {
      console.error("Button index out of range");
      return;
    }
    const button = this.buttons[btnIdx];
    button.setInteractive({ useHandCursor: true });

    button.on("pointerdown", () => {
      this.handleClickOnBtn(button.getData("control"));
    });

    button.on("pointerover", () => {
      button.setStyle({ backgroundColor: this.hoverButtonColor });
      button.setScale(1.05);
    });

    button.on("pointerout", () => {
      button.setStyle({ backgroundColor: this.normalButtonColor });
      button.setScale(1.0);
    });

    button.setStyle({ backgroundColor: this.normalButtonColor });
  }

  hide() {
    this.buttons.forEach((button) => button.setVisible(false));
    this.buttonImages.forEach((image) => image.setVisible(false));
  }

  clear() {
    this.buttons.forEach((button) => button.destroy());
    this.buttonImages.forEach((image) => image.destroy());
    this.buttons = [];
    this.buttonImages = [];
  }

  check() {
    if (this.buttons.length < 0) console.warn("No buttons created");
    if (this.playerControls.size < 0) console.warn("No controls assigned to player");
    this.buttons.forEach((button) => {
      if (!button.visible) console.warn("Button not visible");
    });
    console.log("Control buttons checked");
  }

  handleClickOnBtn(control: any) {
    this.scene.events.emit("controlButtonClicked", control);
  }

  flipAllBtns() {
    this.buttons.forEach((button) => {
      button.setFlip(true, true);
    });
    console.log("Control buttons flipped");
  }

  unflipAllBtns() {
    this.buttons.forEach((button) => {
      button.setFlip(false, false);
    });
    console.log("Control buttons unflipped");
  }

  updateButtonColors(normalColor: string, hoverColor: string) {
    this.normalButtonColor = normalColor;
    this.hoverButtonColor = hoverColor;

    this.buttons.forEach((button) => {
      if (button.input && button.input.enabled) {
        button.setStyle({ backgroundColor: this.normalButtonColor });
      }
    });
  }
}
