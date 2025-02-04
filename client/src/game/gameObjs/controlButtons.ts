import { Scene, GameObjects } from "phaser";

export class ControlButtons {
  private scene: Scene;
  private buttons: GameObjects.Text[];
  private playerControls: Set<string>;
  private buttonWidth: number = 150;
  private buttonHeight: number = 50;
  private padding: number = 20;
  private columns: number = 2;

  constructor(scene: Scene) {
    this.scene = scene;
    this.buttons = [];
    this.playerControls = new Set();
  }

  setPlayerControls(controls: Set<string>) {
    this.playerControls = controls;
  }

  show() {
    // get the number of rows needed based on the number of controls and columns
    const numControls = this.playerControls.size;
    const rows = Math.ceil(numControls / this.columns);

    // center buttons horizontally
    const startX =
      (this.scene.cameras.main.width - this.columns * (this.buttonWidth + this.padding)) / 2;

    // position buttons at the bottom of the screen
    const startY = this.scene.cameras.main.height - rows * (this.buttonHeight + this.padding) - 20;

    let index = 0;
    this.playerControls.forEach((control) => {
      const row = Math.floor(index / this.columns);
      const col = index % this.columns;

      const button = this.scene.add
        .text(
          startX + col * (this.buttonWidth + this.padding),
          startY + row * (this.buttonHeight + this.padding),
          control,
          {
            fontFamily: "Arial",
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#0000ff",
            padding: { x: 10, y: 10 },
          },
        )
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true });

      button.on("pointerdown", () => {
        this.scene.events.emit("controlButtonClicked", control);
      });
      button.setVisible(true);

      this.buttons.push(button);
      index++;
    });
  }

  clear() {
    this.buttons.forEach((button) => button.destroy());
    this.buttons = [];
  }
}
